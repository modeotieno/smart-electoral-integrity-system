import 'package:flutter/material.dart';

import 'api_service.dart';
import 'dashboard_screens.dart';
import 'public_screens.dart';
import 'theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SeisApp());
}

class SeisApp extends StatelessWidget {
  const SeisApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SEIS',
      debugShowCheckedModeBanner: false,
      theme: SeisTheme.light,
      home: const SessionGate(),
    );
  }
}

class SessionGate extends StatefulWidget {
  const SessionGate({super.key});

  @override
  State<SessionGate> createState() => _SessionGateState();
}

class _SessionGateState extends State<SessionGate> {
  String _route = '/';
  bool _loading = true;
  bool _authenticated = false;
  Map<String, dynamic>? _user;

  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    final token = await ApiService.getToken();
    if (token == null || token.isEmpty) {
      _setUnauthenticated();
      return;
    }

    var user = await ApiService.getUser();
    try {
      final fresh = await ApiService.me();
      final data = _asMap(fresh['data']);
      final remoteUser = _asMap(fresh['user']) ?? _asMap(data?['user']);
      if (remoteUser != null) {
        user = <String, dynamic>{...?user, ...remoteUser};
        await ApiService.saveSession(token, user);
      }
    } on ApiException catch (error) {
      if (error.statusCode == 401 || error.statusCode == 403) {
        await ApiService.clearSession();
        _setUnauthenticated(route: '/login');
        return;
      }
    } catch (_) {}

    if (!mounted) return;
    setState(() {
      _authenticated = true;
      _user = user;
      _loading = false;
    });
  }

  Map<String, dynamic>? _asMap(dynamic value) {
    if (value is Map<String, dynamic>) return value;
    if (value is Map) return Map<String, dynamic>.from(value);
    return null;
  }

  void _setUnauthenticated({String route = '/'}) {
    if (!mounted) return;
    setState(() {
      _authenticated = false;
      _user = null;
      _route = route;
      _loading = false;
    });
  }

  void _navigate(String route) {
    if (route.startsWith('/dashboard') && !_authenticated) {
      setState(() => _route = '/login');
      return;
    }
    setState(() => _route = route);
  }

  void _onAuthenticated(Map<String, dynamic>? user) {
    setState(() {
      _authenticated = true;
      _user = user;
      _route = '/dashboard';
    });
  }

  Future<void> _onLogout() async {
    await ApiService.clearSession();
    _setUnauthenticated();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: SeisColors.green600),
        ),
      );
    }

    if (_route.startsWith('/dashboard')) {
      return _dashboardScreen();
    }
    return _publicScreen();
  }

  Widget _publicScreen() {
    final navigate = _navigate;
    late final Widget child;

    switch (_route) {
      case '/live-stream':
        child = const LiveStreamScreen();
      case '/about':
        child = AboutScreen(onNavigate: navigate);
      case '/features':
        child = FeaturesScreen(onNavigate: navigate);
      case '/how-it-works':
        child = const HowItWorksScreen();
      case '/who-we-serve':
        child = const WhoWeServeScreen();
      case '/contact':
        child = const ContactScreen();
      case '/login':
        child = LoginScreen(
          onNavigate: navigate,
          onAuthenticated: _onAuthenticated,
        );
      case '/signup':
        child = SignupScreen(
          onNavigate: navigate,
          onAuthenticated: _onAuthenticated,
        );
      case '/register':
        child = RegisterScreen(
          onNavigate: navigate,
          onAuthenticated: _onAuthenticated,
        );
      case '/biometric':
        child = const BiometricView();
      default:
        child = HomeScreen(onNavigate: navigate);
    }

    return PublicShell(
      route: _route,
      onNavigate: navigate,
      child: child,
    );
  }

  Widget _dashboardScreen() {
    final navigate = _navigate;
    late final Widget child;

    switch (_route) {
      case '/dashboard/elections':
        child = ElectionsScreen(user: _user);
      case '/dashboard/biometric':
        child = const DashboardBiometricScreen();
      case '/dashboard/voters':
        child = VotersScreen(user: _user);
      case '/dashboard/candidates':
        child = CandidatesScreen(user: _user);
      case '/dashboard/candidate-portal':
        child = CandidatePortalScreen(user: _user);
      case '/dashboard/stations':
        child = StationsScreen(user: _user);
      case '/dashboard/results':
        child = ResultsScreen(user: _user);
      case '/dashboard/reports':
        child = const ReportsScreen();
      default:
        child = DashboardOverviewScreen(onNavigate: navigate);
    }

    return DashboardShell(
      route: _route,
      onNavigate: navigate,
      onLogout: _onLogout,
      user: _user,
      child: child,
    );
  }
}
