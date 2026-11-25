import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  const ApiException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

class PagedResult {
  final List<dynamic> items;
  final int total;
  final int totalPages;

  const PagedResult({
    required this.items,
    required this.total,
    required this.totalPages,
  });

  bool get isEmpty => items.isEmpty;
}

class ResultsData {
  final PagedResult results;
  final List<dynamic> totals;

  const ResultsData({required this.results, required this.totals});
}

class ApiService {
  static const Duration _requestTimeout = Duration(seconds: 20);
  static const String _tokenKey = 'seis_token';
  static const String _userKey = 'seis_user';

  static String get baseUrl {
    const configured = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (configured.trim().isNotEmpty) {
      return configured.trim().replaceAll(RegExp(r'/+$'), '');
    }
    if (kIsWeb) {
      return '';
    }
    return 'http://10.0.2.2:8080';
  }

  static String get baseUrlLabel {
    final url = baseUrl;
    return url.isEmpty ? 'this site (/api)' : url;
  }

  static Uri _endpoint(String path, [Map<String, String>? query]) {
    final base = baseUrl;
    final cleanPath = path.replaceFirst(RegExp(r'^/'), '');
    final uri = base.isEmpty ? Uri.base.resolve(cleanPath) : Uri.parse('$base/$cleanPath');
    if (query == null || query.isEmpty) return uri;
    final filtered = <String, String>{
      for (final entry in query.entries)
        if (entry.value.trim().isNotEmpty) entry.key: entry.value.trim(),
    };
    return uri.replace(queryParameters: <String, String>{...uri.queryParameters, ...filtered});
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_userKey);
    if (raw == null || raw.isEmpty) return null;
    try {
      final decoded = jsonDecode(raw);
      return decoded is Map<String, dynamic> ? decoded : null;
    } catch (_) {
      return null;
    }
  }

  static Future<void> saveSession(String token, Map<String, dynamic>? user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    if (user != null) {
      await prefs.setString(_userKey, jsonEncode(user));
    }
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    return _request(
      '/api/auth/login',
      method: 'POST',
      body: {
        'email': email.trim().toLowerCase(),
        'password': password,
      },
    );
  }

  static Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String role = 'citizen',
  }) async {
    return _request(
      '/api/auth/register',
      method: 'POST',
      body: {
        'full_name': name.trim(),
        'name': name.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
        'role': role,
        'userType': role,
        'accountType': role,
      },
    );
  }

  static Future<Map<String, dynamic>> me() async {
    return _request('/api/auth/me', auth: true);
  }

  static Future<Map<String, dynamic>> checkBackend() async {
    return _request('/api/health');
  }

  static Future<Map<String, dynamic>> getHealth() async {
    return checkBackend();
  }

  static Future<Map<String, dynamic>> sendContactMessage({
    required String name,
    required String email,
    required String subject,
    required String message,
    String website = '',
  }) async {
    return _request(
      '/api/contact',
      method: 'POST',
      body: {
        'name': name,
        'email': email,
        'subject': subject,
        'message': message,
        'website': website,
      },
    );
  }

  static Future<Map<String, dynamic>> getStats() async {
    return _request('/api/stats');
  }

  static Future<PagedResult> getElections({int? page, int? limit, String search = ''}) async {
    final data = await _request('/api/elections', query: _pageQuery(page, limit, search));
    return _paged(data, const ['elections', 'results']);
  }

  static Future<Map<String, dynamic>> createElection({
    required String name,
    required String description,
    required String startDate,
    required String endDate,
    required String status,
  }) async {
    return _request(
      '/api/elections',
      method: 'POST',
      auth: true,
      body: {
        'name': name,
        'description': description,
        'start_date': startDate,
        'end_date': endDate,
        'status': status,
      },
    );
  }

  static Future<PagedResult> getCandidates({int? page, int? limit, String search = ''}) async {
    final data = await _request('/api/candidates', query: _pageQuery(page, limit, search));
    return _paged(data, const ['candidates', 'results']);
  }

  static Future<PagedResult> getMyCandidates({int? page, int? limit}) async {
    final data = await _request(
      '/api/candidates/my',
      auth: true,
      query: _pageQuery(page, limit, ''),
    );
    return _paged(data, const ['candidates', 'results']);
  }

  static Future<Map<String, dynamic>> createCandidate({
    required int electionId,
    required String fullName,
    required String party,
    required String position,
    required String manifesto,
  }) async {
    return _request(
      '/api/candidates',
      method: 'POST',
      auth: true,
      body: {
        'election_id': electionId,
        'full_name': fullName,
        'party': party,
        'position': position,
        'manifesto': manifesto,
      },
    );
  }

  static Future<Map<String, dynamic>> applyCandidate({
    required int electionId,
    required String fullName,
    required String party,
    required String position,
    required String manifesto,
  }) async {
    return _request(
      '/api/candidates/apply',
      method: 'POST',
      auth: true,
      body: {
        'election_id': electionId,
        'full_name': fullName,
        'party': party,
        'position': position,
        'manifesto': manifesto,
      },
    );
  }

  static Future<Map<String, dynamic>> updateCandidateStatus(
    int id, {
    required String status,
  }) async {
    return _request(
      '/api/candidates/$id/status',
      method: 'PATCH',
      auth: true,
      body: {'status': status},
    );
  }

  static Future<PagedResult> getStations({int? page, int? limit, String search = ''}) async {
    final data = await _request('/api/stations', query: _pageQuery(page, limit, search));
    return _paged(data, const ['stations', 'results']);
  }

  static Future<Map<String, dynamic>> createStation({
    required String name,
    required String location,
    required String county,
    required int registeredVoters,
  }) async {
    return _request(
      '/api/stations',
      method: 'POST',
      auth: true,
      body: {
        'name': name,
        'location': location,
        'county': county,
        'registered_voters': registeredVoters,
      },
    );
  }

  static Future<ResultsData> getResults({int? page, int? limit, String search = ''}) async {
    final data = await _request('/api/results', query: _pageQuery(page, limit, search));
    final rawTotals = data['totals'];
    final totals = rawTotals is List ? rawTotals : <dynamic>[];
    return ResultsData(results: _paged(data, const ['results', 'data']), totals: totals);
  }

  static Future<Map<String, dynamic>> submitResult({
    required int electionId,
    required int candidateId,
    required int pollingStationId,
    required int votes,
  }) async {
    return _request(
      '/api/results',
      method: 'POST',
      auth: true,
      body: {
        'election_id': electionId,
        'candidate_id': candidateId,
        'polling_station_id': pollingStationId,
        'votes': votes,
      },
    );
  }

  static Future<Map<String, dynamic>> verifyResult(int id) async {
    return _request('/api/results/$id/verify', method: 'POST', auth: true);
  }

  static Future<PagedResult> getUsers({int? page, int? limit, String search = ''}) async {
    final data = await _request(
      '/api/users',
      auth: true,
      query: _pageQuery(page, limit, search),
    );
    return _paged(data, const ['users', 'results']);
  }

  static Future<PagedResult> getIncidents({int? page, int? limit, String search = ''}) async {
    final data = await _request(
      '/api/incidents',
      auth: true,
      query: _pageQuery(page, limit, search),
    );
    return _paged(data, const ['incidents', 'results']);
  }

  static Future<Map<String, dynamic>> reportIncident({
    required String title,
    required String description,
    required String severity,
    int? pollingStationId,
  }) async {
    final body = <String, dynamic>{
      'title': title,
      'description': description,
      'severity': severity,
    };
    if (pollingStationId != null) {
      body['polling_station_id'] = pollingStationId;
    }
    return _request(
      '/api/incidents',
      method: 'POST',
      auth: true,
      body: body,
    );
  }

  static Future<PagedResult> getAuditLogs({int? page, int? limit, String search = ''}) async {
    final data = await _request(
      '/api/audit-logs',
      auth: true,
      query: _pageQuery(page, limit, search),
    );
    return _paged(data, const ['logs', 'results']);
  }

  static Future<Map<String, dynamic>> enrollBiometric({
    required String biometricType,
    required String biometricData,
  }) async {
    return _request(
      '/api/biometric/enroll',
      method: 'POST',
      auth: true,
      body: {
        'biometric_type': biometricType,
        'biometric_data': biometricData.substring(0, biometricData.length > 2000 ? 2000 : biometricData.length),
      },
    );
  }

  static Future<Map<String, dynamic>> verifyBiometric({
    required String email,
    required String biometricData,
  }) async {
    return _request(
      '/api/biometric/verify',
      method: 'POST',
      body: {
        'email': email.trim().toLowerCase(),
        'biometric_data': biometricData.substring(0, biometricData.length > 2000 ? 2000 : biometricData.length),
      },
    );
  }

  static Future<Map<String, dynamic>> getBiometricStatus() async {
    return _request('/api/biometric/status', auth: true);
  }

  static Map<String, String> _pageQuery(int? page, int? limit, String search) {
    return <String, String>{
      if (page != null) 'page': '$page',
      if (limit != null) 'limit': '$limit',
      'search': search,
    };
  }

  static PagedResult _paged(dynamic payload, List<String> keys) {
    if (payload is List) {
      return PagedResult(items: payload, total: payload.length, totalPages: 1);
    }
    if (payload is! Map<String, dynamic>) {
      return const PagedResult(items: [], total: 0, totalPages: 1);
    }

    List<dynamic> items = <dynamic>[];
    for (final key in keys) {
      final value = payload[key];
      if (value is List) {
        items = value;
        break;
      }
    }
    if (items.isEmpty) {
      final data = payload['data'];
      if (data is List) {
        items = data;
      } else if (data is Map<String, dynamic>) {
        for (final key in keys) {
          final value = data[key];
          if (value is List) {
            items = value;
            break;
          }
        }
      }
    }

    final pagination = payload['pagination'];
    int total = items.length;
    int totalPages = 1;
    if (pagination is Map<String, dynamic>) {
      total = _intValue(pagination['total'], fallback: total);
      totalPages = _intValue(pagination['total_pages'], fallback: 1);
    }
    return PagedResult(
      items: items,
      total: total,
      totalPages: totalPages < 1 ? 1 : totalPages,
    );
  }

  static int _intValue(dynamic value, {required int fallback}) {
    final parsed = int.tryParse(value?.toString() ?? '');
    return parsed ?? fallback;
  }

  static Future<Map<String, dynamic>> _request(
    String path, {
    String method = 'GET',
    Map<String, dynamic>? body,
    Map<String, String>? query,
    bool auth = false,
  }) async {
    final token = auth ? await getToken() : null;
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };

    final uri = _endpoint(path, query);
    late final http.Response response;

    try {
      final payload = body == null ? null : jsonEncode(body);
      switch (method) {
        case 'POST':
          response = await http.post(uri, headers: headers, body: payload).timeout(_requestTimeout);
        case 'PUT':
          response = await http.put(uri, headers: headers, body: payload).timeout(_requestTimeout);
        case 'PATCH':
          response = await http.patch(uri, headers: headers, body: payload).timeout(_requestTimeout);
        case 'DELETE':
          response = await http.delete(uri, headers: headers).timeout(_requestTimeout);
        default:
          response = await http.get(uri, headers: headers).timeout(_requestTimeout);
      }
    } on TimeoutException {
      throw const ApiException(
        'The SEIS backend did not respond in time. Please try again.',
      );
    } on Exception catch (err) {
      throw ApiException(
        'Cannot connect to the SEIS backend at $baseUrlLabel. '
        'Start the backend and check that this device can reach it. Details: $err',
      );
    }

    final decoded = _decodeBody(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded is Map<String, dynamic>
          ? decoded
          : <String, dynamic>{'data': decoded};
    }

    final message = decoded is Map<String, dynamic>
        ? (decoded['error'] ?? decoded['message'])
        : null;
    if (response.statusCode == 401 &&
        (message == null || message.toString().toLowerCase().contains('unauthor'))) {
      throw ApiException(
        'Your session has expired. Please sign in again.',
        statusCode: 401,
      );
    }
    throw ApiException(
      message?.toString() ?? 'Request failed (${response.statusCode})',
      statusCode: response.statusCode,
    );
  }

  static dynamic _decodeBody(String body) {
    if (body.trim().isEmpty) {
      return <String, dynamic>{};
    }
    try {
      return jsonDecode(body);
    } on FormatException {
      return {'raw': body};
    }
  }
}
