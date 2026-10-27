import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static String get baseUrl {
    const configured = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (configured.trim().isNotEmpty) {
      return configured.trim().replaceAll(RegExp(r'/+$'), '');
    }
    return 'http://10.0.2.2:8080';
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('seis_token');
  }

  static Future<void> saveSession(String token, Map<String, dynamic>? user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('seis_token', token);
    if (user != null) {
      await prefs.setString('seis_user', jsonEncode(user));
    }
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('seis_token');
    await prefs.remove('seis_user');
  }

  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    return _request(
      '/api/auth/login',
      method: 'POST',
      body: {
        'email': email,
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
        'full_name': name,
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        'userType': role,
      },
    );
  }

  static Future<Map<String, dynamic>> me() async {
    return _request('/api/auth/me', auth: true);
  }

  static Future<Map<String, dynamic>> getStats() async {
    return _request('/api/stats', auth: true);
  }

  static Future<List<dynamic>> getElections() async {
    final result = await _request('/api/elections', auth: true);
    final data = result['data'] ?? result['elections'] ?? [];
    return data is List ? data : <dynamic>[];
  }

  static Future<List<dynamic>> getResults() async {
    final result = await _request('/api/results', auth: true);
    final data = result['data'] ?? result['results'] ?? [];
    return data is List ? data : <dynamic>[];
  }

  static Future<List<dynamic>> getCandidates() async {
    final result = await _request('/api/candidates', auth: true);
    final data = result['data'] ?? result['candidates'] ?? [];
    return data is List ? data : <dynamic>[];
  }

  static Future<List<dynamic>> getStations() async {
    final result = await _request('/api/stations', auth: true);
    final data = result['data'] ?? result['stations'] ?? [];
    return data is List ? data : <dynamic>[];
  }

  static Future<Map<String, dynamic>> getHealth() async {
    return _request('/api/health');
  }

  static Future<Map<String, dynamic>> _request(
    String path, {
    String method = 'GET',
    Map<String, dynamic>? body,
    bool auth = false,
  }) async {
    final token = auth ? await getToken() : null;
    final headers = <String, String>{
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };

    final uri = Uri.parse('$baseUrl$path');
    http.Response response;

    try {
      if (method == 'POST') {
        response = await http.post(
          uri,
          headers: headers,
          body: jsonEncode(body ?? {}),
        );
      } else if (method == 'PUT') {
        response = await http.put(
          uri,
          headers: headers,
          body: jsonEncode(body ?? {}),
        );
      } else if (method == 'PATCH') {
        response = await http.patch(
          uri,
          headers: headers,
          body: jsonEncode(body ?? {}),
        );
      } else if (method == 'DELETE') {
        response = await http.delete(uri, headers: headers);
      } else {
        response = await http.get(uri, headers: headers);
      }
    } on Exception catch (err) {
      throw Exception(
        'Cannot connect to the SEIS backend at $baseUrl. Start the backend and ensure Android/iPhone can reach it. Details: $err',
      );
    }

    final decoded = _decodeBody(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded is Map<String, dynamic>
          ? decoded
          : <String, dynamic>{'data': decoded};
    }

    throw Exception(
      decoded is Map<String, dynamic>
          ? (decoded['error'] ?? decoded['message'] ?? 'Request failed')
          : 'Request failed',
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
