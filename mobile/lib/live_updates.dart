import 'dart:async';
import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

import 'api_service.dart';

typedef LiveUpdateListener = void Function(dynamic data);

class LiveUpdateManager {
  static const int maxReconnectAttempts = 5;
  static const Duration reconnectDelay = Duration(seconds: 3);

  final String url;
  final Map<String, List<LiveUpdateListener>> _listeners = <String, List<LiveUpdateListener>>{};
  final Set<Object> _subscriptions = <Object>{};

  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _subscription;
  Timer? _reconnectTimer;
  bool _closed = false;
  bool _connecting = false;
  bool _connected = false;
  int _attempts = 0;
  DateTime? connectedAt;

  LiveUpdateManager([String? url]) : url = url ?? defaultUrl();

  static String defaultUrl() {
    final configured = ApiService.baseUrl;
    final uri = configured.isEmpty ? Uri.base : Uri.parse(configured);
    final scheme = uri.scheme == 'https' || uri.scheme == 'wss' ? 'wss' : 'ws';
    final authority = uri.authority.isNotEmpty ? uri.authority : Uri.base.authority;
    return '$scheme://$authority/api/ws/live';
  }

  bool isConnected() => _connected;

  Duration? get uptime {
    final start = connectedAt;
    return start == null ? null : DateTime.now().difference(start);
  }

  Future<void> connect() async {
    if (_closed || _connecting || _connected) return;
    _connecting = true;

    try {
      final channel = WebSocketChannel.connect(Uri.parse(url));
      _channel = channel;
      _subscription = channel.stream.listen(
        _handleMessage,
        onError: (error) {
          emit('error', <String, dynamic>{'error': error.toString()});
          _handleDone();
        },
        onDone: _handleDone,
      );
      await channel.ready;
      if (_closed) {
        await channel.sink.close();
        return;
      }
      _connected = true;
      _connecting = false;
      _attempts = 0;
      connectedAt = DateTime.now();
      emit('connected', <String, dynamic>{'timestamp': connectedAt});
    } catch (error) {
      _connecting = false;
      emit('error', <String, dynamic>{'error': error.toString()});
      _handleDone();
    }
  }

  void subscribe(Object electionId) {
    final value = electionId is String ? int.tryParse(electionId) ?? electionId : electionId;
    _subscriptions.add(value);
    if (!_connected || _channel == null) return;
    _channel!.sink.add(jsonEncode(<String, dynamic>{
      'type': 'subscribe',
      'election_id': value,
    }));
  }

  void unsubscribe(Object electionId) {
    final value = electionId is String ? int.tryParse(electionId) ?? electionId : electionId;
    _subscriptions.remove(value);
    if (!_connected || _channel == null) return;
    _channel!.sink.add(jsonEncode(<String, dynamic>{
      'type': 'unsubscribe',
      'election_id': value,
    }));
  }

  void Function() on(String event, LiveUpdateListener listener) {
    _listeners.putIfAbsent(event, () => <LiveUpdateListener>[]).add(listener);
    return () => off(event, listener);
  }

  void off(String event, LiveUpdateListener listener) {
    _listeners[event]?.remove(listener);
  }

  void emit(String event, dynamic data) {
    for (final listener in List<LiveUpdateListener>.from(_listeners[event] ?? const <LiveUpdateListener>[])) {
      listener(data);
    }
  }

  void disconnect() {
    _closed = true;
    _reconnectTimer?.cancel();
    _subscription?.cancel();
    _channel?.sink.close();
    _channel = null;
    _subscription = null;
    _connected = false;
    _connecting = false;
  }

  void _handleMessage(dynamic raw) {
    if (raw is! String) return;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map<String, dynamic>) return;
      final type = decoded['type']?.toString();
      switch (type) {
        case 'result_update':
          emit('result_update', decoded['data']);
        case 'candidate_tally':
          emit('tally_update', decoded['data']);
        case 'system_status':
          emit('status', decoded['data']);
      }
    } catch (_) {}
  }

  void _handleDone() {
    final channel = _channel;
    if (channel == null) return;
    _channel = null;
    _subscription?.cancel();
    _subscription = null;
    if (_closed) return;
    _connected = false;
    _connecting = false;
    emit('disconnected', <String, dynamic>{'timestamp': DateTime.now()});
    _attemptReconnect();
  }

  void _attemptReconnect() {
    if (_closed || _reconnectTimer != null) return;
    if (_attempts >= maxReconnectAttempts) {
      emit('reconnect_failed', <String, dynamic>{'attempts': _attempts});
      return;
    }
    _attempts++;
    _reconnectTimer = Timer(reconnectDelay, () {
      _reconnectTimer = null;
      connect();
    });
  }
}
