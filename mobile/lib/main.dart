import 'package:flutter/material.dart';
import 'api_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SeisApp());
}

class SeisApp extends StatelessWidget {
  const SeisApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SEIS Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF16A34A),
          primary: const Color(0xFF16A34A),
          surface: const Color(0xFFF8FAFC),
        ),
        scaffoldBackgroundColor: const Color(0xFFF1F5F9),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF071426),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
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
    if (token != null && token.isNotEmpty) {
      final user = await ApiService.getUser();
      setState(() {
        _authenticated = true;
        _user = user;
        _loading = false;
      });
    } else {
      setState(() {
        _authenticated = false;
        _user = null;
        _loading = false;
      });
    }
  }

  void _onLoginSuccess(Map<String, dynamic>? user) {
    setState(() {
      _authenticated = true;
      _user = user;
    });
  }

  void _onLogout() async {
    await ApiService.clearSession();
    setState(() {
      _authenticated = false;
      _user = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFF16A34A)),
        ),
      );
    }

    if (_authenticated) {
      return DashboardScreen(
        user: _user,
        onLogout: _onLogout,
      );
    }

    return AuthScreen(onLoginSuccess: _onLoginSuccess);
  }
}

class AuthScreen extends StatefulWidget {
  final Function(Map<String, dynamic>?) onLoginSuccess;

  const AuthScreen({super.key, required this.onLoginSuccess});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _isLogin = true;
  bool _loading = false;
  String? _errorMessage;
  String _selectedRole = 'citizen';

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final email = _emailController.text.trim();
      final password = _passwordController.text;

      Map<String, dynamic> result;
      if (_isLogin) {
        result = await ApiService.login(email: email, password: password);
      } else {
        result = await ApiService.register(
          name: _nameController.text.trim(),
          email: email,
          password: password,
          role: _selectedRole,
        );
      }

      final token = result['token'] as String?;
      final userData = result['user'] as Map<String, dynamic>?;

      if (token != null && token.isNotEmpty) {
        await ApiService.saveSession(token, userData);
        if (!mounted) return;
        widget.onLoginSuccess(userData);
      } else if (!_isLogin) {
        // After successful registration without auto-token, switch to login
        setState(() {
          _isLogin = true;
          _errorMessage = null;
        });
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Account created successfully! Please sign in.'),
            backgroundColor: Color(0xFF16A34A),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Card(
              elevation: 2,
              shadowColor: Colors.black12,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              child: Padding(
                padding: const EdgeInsets.all(28),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Center(
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: const BoxDecoration(
                            color: Color(0xFFDCFCE7),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.shield_outlined,
                            size: 34,
                            color: Color(0xFF166534),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _isLogin ? 'Sign In to SEIS' : 'Create SEIS Account',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _isLogin
                            ? 'Access electoral audits, telemetry, and voting data'
                            : 'Join the transparent election monitoring network',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF64748B),
                        ),
                      ),
                      const SizedBox(height: 24),
                      if (!_isLogin) ...[
                        TextFormField(
                          controller: _nameController,
                          decoration: const InputDecoration(
                            labelText: 'Full Name',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.person_outline),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Please enter your full name';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          initialValue: _selectedRole,
                          decoration: const InputDecoration(
                            labelText: 'Role',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.badge_outlined),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'citizen', child: Text('Citizen Voter')),
                            DropdownMenuItem(value: 'observer', child: Text('Accredited Observer')),
                            DropdownMenuItem(value: 'candidate', child: Text('Candidate / Agent')),
                            DropdownMenuItem(value: 'official', child: Text('Election Official')),
                          ],
                          onChanged: (val) {
                            if (val != null) {
                              setState(() => _selectedRole = val);
                            }
                          },
                        ),
                        const SizedBox(height: 16),
                      ],
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          labelText: 'Email Address',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.email_outlined),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please enter your email';
                          }
                          if (!value.contains('@')) {
                            return 'Please enter a valid email address';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        decoration: const InputDecoration(
                          labelText: 'Password',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.lock_outline),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your password';
                          }
                          if (value.length < 8) {
                            return 'Password must be at least 8 characters';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      if (_errorMessage != null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEE2E2),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFFCA5A5)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.error_outline, color: Color(0xFFB91C1C), size: 20),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _errorMessage!,
                                  style: const TextStyle(
                                    color: Color(0xFF991B1B),
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      FilledButton.icon(
                        onPressed: _loading ? null : _submit,
                        icon: _loading
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.arrow_forward),
                        label: Text(
                          _loading
                              ? (_isLogin ? 'Signing In...' : 'Registering...')
                              : (_isLogin ? 'Sign In' : 'Create Account'),
                        ),
                        style: FilledButton.styleFrom(
                          minimumSize: const Size.fromHeight(50),
                          backgroundColor: const Color(0xFF16A34A),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextButton(
                        onPressed: () {
                          setState(() {
                            _isLogin = !_isLogin;
                            _errorMessage = null;
                          });
                        },
                        child: Text(
                          _isLogin
                              ? "Don't have an account? Sign up"
                              : 'Already registered? Sign in',
                          style: const TextStyle(
                            color: Color(0xFF15803D),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  final Map<String, dynamic>? user;
  final VoidCallback onLogout;

  const DashboardScreen({
    super.key,
    required this.user,
    required this.onLogout,
  });

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  bool _isLoading = false;
  bool _backendOnline = false;
  Map<String, dynamic> _stats = {};
  List<dynamic> _elections = [];
  List<dynamic> _stations = [];
  List<dynamic> _results = [];

  @override
  void initState() {
    super.initState();
    _refreshData();
  }

  Future<void> _refreshData() async {
    setState(() => _isLoading = true);
    try {
      final health = await ApiService.getHealth().catchError((_) => <String, dynamic>{});
      final online = health.isNotEmpty;

      final stats = await ApiService.getStats().catchError((_) => <String, dynamic>{});
      final elections = await ApiService.getElections().catchError((_) => <dynamic>[]);
      final stations = await ApiService.getStations().catchError((_) => <dynamic>[]);
      final results = await ApiService.getResults().catchError((_) => <dynamic>[]);

      if (mounted) {
        setState(() {
          _backendOnline = online;
          _stats = stats;
          _elections = elections;
          _stations = stations;
          _results = results;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final userName = widget.user?['full_name'] ??
        widget.user?['name'] ??
        widget.user?['email'] ??
        'User';
    final userRole = widget.user?['role'] ?? 'Citizen';

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.shield, color: Color(0xFF22C55E), size: 22),
            const SizedBox(width: 8),
            const Text(
              'SEIS Mobile',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Refresh data',
            icon: const Icon(Icons.refresh),
            onPressed: _refreshData,
          ),
          IconButton(
            tooltip: 'Log out',
            icon: const Icon(Icons.logout),
            onPressed: widget.onLogout,
          ),
        ],
        bottom: _isLoading
            ? const PreferredSize(
                preferredSize: Size.fromHeight(3),
                child: LinearProgressIndicator(
                  color: Color(0xFF22C55E),
                  backgroundColor: Colors.transparent,
                ),
              )
            : null,
      ),
      body: RefreshIndicator(
        onRefresh: _refreshData,
        color: const Color(0xFF16A34A),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 720),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildHeaderCard(userName.toString(), userRole.toString()),
                const SizedBox(height: 16),
                _buildStatusBanner(),
                const SizedBox(height: 16),
                if (_currentIndex == 0) _buildOverviewTab(),
                if (_currentIndex == 1) _buildElectionsTab(),
                if (_currentIndex == 2) _buildStationsTab(),
                if (_currentIndex == 3) _buildResultsTab(),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Overview',
          ),
          NavigationDestination(
            icon: Icon(Icons.how_to_vote_outlined),
            selectedIcon: Icon(Icons.how_to_vote),
            label: 'Elections',
          ),
          NavigationDestination(
            icon: Icon(Icons.location_on_outlined),
            selectedIcon: Icon(Icons.location_on),
            label: 'Stations',
          ),
          NavigationDestination(
            icon: Icon(Icons.analytics_outlined),
            selectedIcon: Icon(Icons.analytics),
            label: 'Results',
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderCard(String name, String role) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF071426),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 8,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: const Color(0xFF16A34A),
            foregroundColor: Colors.white,
            radius: 24,
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : 'U',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Text(
                    role.toUpperCase(),
                    style: const TextStyle(
                      color: Color(0xFF86EFAC),
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: _backendOnline ? const Color(0xFFDCFCE7) : const Color(0xFFFEF3C7),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _backendOnline ? const Color(0xFF86EFAC) : const Color(0xFFFDE68A),
        ),
      ),
      child: Row(
        children: [
          Icon(
            _backendOnline ? Icons.check_circle : Icons.wifi_off,
            size: 18,
            color: _backendOnline ? const Color(0xFF15803D) : const Color(0xFFB45309),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              _backendOnline
                  ? 'Connected to SEIS Secure Backend (${ApiService.baseUrl})'
                  : 'Backend unreachable. Running in offline view mode.',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: _backendOnline ? const Color(0xFF166534) : const Color(0xFF92400E),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    final totalElections = _stats['total_elections'] ?? _elections.length;
    final totalStations = _stats['total_stations'] ?? _stations.length;
    final totalVotes = _stats['total_votes'] ?? 'Real-time';
    final integrityStatus = _stats['status'] ?? 'Audited & Verified';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Integrity & Telemetry Overview',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildMetricCard(
                'Elections',
                totalElections.toString(),
                Icons.how_to_vote,
                const Color(0xFF2563EB),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildMetricCard(
                'Polling Stations',
                totalStations.toString(),
                Icons.location_on,
                const Color(0xFF059669),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildMetricCard(
                'Total Cast',
                totalVotes.toString(),
                Icons.ballot,
                const Color(0xFFD97706),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildMetricCard(
                'Audit State',
                integrityStatus.toString(),
                Icons.verified_user,
                const Color(0xFF16A34A),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Card(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.verified_user, color: Color(0xFF16A34A)),
                    SizedBox(width: 8),
                    Text(
                      'SEIS Tamper-Evident Security',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'All cast votes and polling telemetry are cryptographically signed and hash-chained. Use the tabs below to inspect live elections, check station accreditation, and monitor vote tallies.',
                  style: TextStyle(color: Color(0xFF475569), fontSize: 13, height: 1.4),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMetricCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }

  Widget _buildElectionsTab() {
    if (_elections.isEmpty) {
      return _buildEmptyState(
        icon: Icons.how_to_vote,
        title: 'No Active Elections',
        subtitle: 'There are currently no scheduled or active elections available.',
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Elections',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        ..._elections.map((election) {
          final title = election['title'] ?? election['name'] ?? 'General Election';
          final status = election['status'] ?? 'Scheduled';
          final desc = election['description'] ?? 'Electoral integrity monitored election';

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: Color(0xFFDCFCE7),
                child: Icon(Icons.how_to_vote, color: Color(0xFF16A34A)),
              ),
              title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(desc),
              trailing: Chip(
                label: Text(
                  status.toString().toUpperCase(),
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                ),
                backgroundColor: const Color(0xFFE0F2FE),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildStationsTab() {
    if (_stations.isEmpty) {
      return _buildEmptyState(
        icon: Icons.location_on,
        title: 'Polling Stations',
        subtitle: 'Polling station records will appear here once loaded from the backend.',
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Accredited Polling Stations',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        ..._stations.map((st) {
          final name = st['name'] ?? st['station_name'] ?? 'Station #${st['id'] ?? ''}';
          final location = st['location'] ?? st['county'] ?? 'Central Ward';
          final active = st['active'] ?? true;

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: Icon(
                Icons.account_balance,
                color: active ? const Color(0xFF16A34A) : Colors.grey,
              ),
              title: Text(name.toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(location.toString()),
              trailing: Icon(
                active ? Icons.verified : Icons.warning_amber,
                color: active ? const Color(0xFF16A34A) : Colors.orange,
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildResultsTab() {
    if (_results.isEmpty) {
      return _buildEmptyState(
        icon: Icons.analytics,
        title: 'Certified Results',
        subtitle: 'Certified election results and audit summaries will display here.',
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Certified Results & Tally',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        ..._results.map((res) {
          final candidate = res['candidate'] ?? res['name'] ?? 'Candidate';
          final votes = res['votes'] ?? res['count'] ?? 0;
          final percentage = res['percentage'] ?? '';

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: Color(0xFFE0E7FF),
                child: Icon(Icons.person, color: Color(0xFF4338CA)),
              ),
              title: Text(candidate.toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('Votes: $votes'),
              trailing: Text(
                percentage.toString().isNotEmpty ? '$percentage%' : '$votes votes',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 48, color: const Color(0xFF94A3B8)),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF334155),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }
}
