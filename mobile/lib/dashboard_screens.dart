import 'dart:async';

import 'package:flutter/material.dart';

import 'api_service.dart';
import 'live_updates.dart';
import 'public_screens.dart';
import 'theme.dart';
import 'ui.dart';

const dashboardMenu = <(String, String, IconData)>[
  ('Dashboard', '/dashboard', Icons.dashboard_outlined),
  ('Elections', '/dashboard/elections', Icons.how_to_vote_outlined),
  ('Biometric', '/dashboard/biometric', Icons.fingerprint),
  ('Voters', '/dashboard/voters', Icons.people_outline),
  ('Candidates', '/dashboard/candidates', Icons.person_outline),
  ('Candidate Portal', '/dashboard/candidate-portal', Icons.verified_user_outlined),
  ('Polling Stations', '/dashboard/stations', Icons.location_on_outlined),
  ('Results', '/dashboard/results', Icons.bar_chart),
  ('Reports', '/dashboard/reports', Icons.description_outlined),
];

class SeisRoles {
  static const createElection = ['election_administrator', 'returning_officer', 'presiding_officer'];
  static const createCandidate = ['election_administrator', 'returning_officer'];
  static const applyCandidate = ['candidate', 'citizen', 'observer', 'presiding_officer', 'returning_officer', 'election_administrator'];
  static const createStation = ['election_administrator', 'returning_officer', 'presiding_officer'];
  static const submitResult = ['presiding_officer', 'returning_officer', 'election_administrator'];
  static const verifyResult = ['returning_officer', 'election_administrator'];
  static const reviewCandidate = ['election_administrator', 'returning_officer'];
  static const manageUsers = ['election_administrator', 'system_administrator'];
}

bool hasAnyRole(Map<String, dynamic>? user, List<String> roles) {
  final role = user?['role']?.toString() ?? '';
  return roles.contains(role);
}

String roleLabel(Map<String, dynamic>? user) {
  return user?['full_name']?.toString() ??
      user?['name']?.toString() ??
      user?['email']?.toString() ??
      'Election Official';
}

class DashboardShell extends StatelessWidget {
  final String route;
  final SeisNavigate onNavigate;
  final VoidCallback onLogout;
  final Map<String, dynamic>? user;
  final Widget child;

  const DashboardShell({
    super.key,
    required this.route,
    required this.onNavigate,
    required this.onLogout,
    required this.user,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final narrow = MediaQuery.of(context).size.width < 900;

    return Scaffold(
      backgroundColor: SeisColors.slate100,
      appBar: AppBar(
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: SeisLogo(dark: true, compact: true),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(
              roleLabel(user),
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
          ),
          IconButton(
            tooltip: 'Log out',
            icon: const Icon(Icons.logout),
            onPressed: onLogout,
          ),
        ],
      ),
      drawer: SizedBox(
        width: 260,
        child: Drawer(
          backgroundColor: SeisColors.navy950,
          child: SafeArea(
            child: Column(
              children: [
                const Padding(
                  padding: EdgeInsets.all(20),
                  child: SeisLogo(dark: true),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'SIGNED IN',
                        style: TextStyle(color: Color(0xFF8DA49C), fontSize: 10, letterSpacing: 1.4),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        roleLabel(user),
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.lock_outline, color: Color(0xFFCBD5E1), size: 12),
                          const SizedBox(width: 5),
                          Text(
                            user?['role']?.toString() ?? 'guest',
                            style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const Divider(color: Colors.white12),
                Expanded(
                  child: ListView(
                    padding: EdgeInsets.zero,
                    children: [
                      for (final item in dashboardMenu)
                        ListTile(
                          leading: Icon(item.$3, color: route == item.$2 ? SeisColors.green400 : Colors.white54, size: 19),
                          title: Text(
                            item.$1,
                            style: TextStyle(
                              color: route == item.$2 ? Colors.white : Colors.white70,
                              fontWeight: route == item.$2 ? FontWeight.w800 : FontWeight.w500,
                              fontSize: 13,
                            ),
                          ),
                          selected: route == item.$2,
                          selectedTileColor: const Color(0x1420C77A),
                          onTap: () {
                            Navigator.of(context).pop();
                            onNavigate(item.$2);
                          },
                        ),
                    ],
                  ),
                ),
                ListTile(
                  leading: const Icon(Icons.logout, color: Colors.white54, size: 19),
                  title: const Text('Logout', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  onTap: onLogout,
                ),
              ],
            ),
          ),
        ),
      ),
      body: Row(
        children: [
          if (!narrow)
            Container(
              width: 220,
              color: SeisColors.navy950,
              child: SafeArea(
                child: Column(
                  children: [
                    const Padding(
                      padding: EdgeInsets.all(16),
                      child: SeisLogo(dark: true),
                    ),
                    const Divider(color: Colors.white12),
                    for (final item in dashboardMenu)
                      ListTile(
                        dense: true,
                        leading: Icon(item.$3, color: route == item.$2 ? SeisColors.green400 : Colors.white54, size: 18),
                        title: Text(
                          item.$1,
                          style: TextStyle(
                            color: route == item.$2 ? Colors.white : Colors.white70,
                            fontWeight: route == item.$2 ? FontWeight.w800 : FontWeight.w500,
                            fontSize: 12,
                          ),
                        ),
                        selected: route == item.$2,
                        selectedTileColor: const Color(0x1420C77A),
                        onTap: () => onNavigate(item.$2),
                      ),
                    const Spacer(),
                    ListTile(
                      dense: true,
                      leading: const Icon(Icons.logout, color: Colors.white54, size: 18),
                      title: const Text('Logout', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      onTap: onLogout,
                    ),
                  ],
                ),
              ),
            ),
          Expanded(child: child),
        ],
      ),
      bottomNavigationBar: narrow
          ? NavigationBar(
              selectedIndex: dashboardMenu.indexWhere((item) => item.$2 == route) == -1
                  ? 0
                  : dashboardMenu.indexWhere((item) => item.$2 == route),
              onDestinationSelected: (index) => onNavigate(dashboardMenu[index].$2),
              destinations: [
                for (final item in dashboardMenu)
                  NavigationDestination(icon: Icon(item.$3), label: item.$1),
              ],
            )
          : null,
    );
  }
}

mixin PaginatedListMixin<T extends StatefulWidget> on State<T> {
  final TextEditingController searchController = TextEditingController();
  List<dynamic> items = <dynamic>[];
  int page = 1;
  int limit = 10;
  int total = 0;
  int totalPages = 1;
  String query = '';
  bool loading = true;
  String? error;
  String? message;

  Map<String, dynamic>? get user;
  Future<PagedResult> fetch(int page, int limit, String search);
  Widget itemBuilder(dynamic item);
  Widget? formBuilder() => null;
  Future<void>? onCreate() => null;
  Widget? headerBuilder() => null;

  void initList() {
    reload();
  }

  void disposeList() {
    searchController.dispose();
  }

  bool can(List<String> roles) => hasAnyRole(user, roles);

  Future<void> reload() async {
    if (!mounted) return;
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final result = await fetch(page, limit, query);
      if (!mounted) return;
      setState(() {
        items = result.items;
        total = result.total;
        totalPages = result.totalPages;
        loading = false;
      });
    } catch (err) {
      if (!mounted) return;
      setState(() {
        error = err.toString().replaceFirst('Exception: ', '');
        loading = false;
      });
    }
  }

  Future<void> resetAndReload() async {
    page = 1;
    query = '';
    searchController.clear();
    await reload();
  }

  void applySearch() {
    setState(() {
      page = 1;
      query = searchController.text.trim();
    });
    reload();
  }

  void clearSearch() {
    searchController.clear();
    resetAndReload();
  }

  Future<void> runCreate() async {
    final operation = onCreate();
    if (operation == null) return;
    setState(() {
      error = null;
      message = null;
    });
    try {
      await operation;
      setState(() => message = 'Record saved successfully');
      await resetAndReload();
    } catch (err) {
      if (!mounted) return;
      setState(() => error = err.toString().replaceFirst('Exception: ', ''));
    }
  }

  Widget buildListBody({
    required String title,
    required String subtitle,
    required String searchHint,
  }) {
    final form = formBuilder();
    final create = onCreate();

    return RefreshIndicator(
      onRefresh: reload,
      color: SeisColors.green600,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (headerBuilder() != null) headerBuilder()!,
          if (headerBuilder() != null) const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                    Text(subtitle, style: const TextStyle(color: SeisColors.slate500, fontSize: 12)),
                  ],
                ),
              ),
              StatusChip(label: '$total total', tone: StatusTone.success),
            ],
          ),
          if (loading) const LinearProgressIndicator(color: SeisColors.green600, minHeight: 2),
          const SizedBox(height: 14),
          if (error != null) ...[
            SeisBanner(message: error!, isError: true),
            const SizedBox(height: 12),
          ],
          if (message != null) ...[
            SeisBanner(message: message!),
            const SizedBox(height: 12),
          ],
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: searchController,
                  decoration: InputDecoration(
                    hintText: searchHint,
                    isDense: true,
                    prefixIcon: const Icon(Icons.search, size: 18),
                  ),
                  onSubmitted: (_) => applySearch(),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 92,
                child: SeisPrimaryButton(label: 'Search', compact: true, onPressed: applySearch),
              ),
              if (query.isNotEmpty) ...[
                const SizedBox(width: 8),
                TextButton(onPressed: clearSearch, child: const Text('Clear')),
              ],
            ],
          ),
          if (form != null) ...[
            const SizedBox(height: 16),
            form,
          ],
          if (create != null) ...[
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerLeft,
              child: SeisPrimaryButton(
                label: 'Save',
                compact: true,
                icon: Icons.save_outlined,
                onPressed: runCreate,
              ),
            ),
          ],
          const SizedBox(height: 16),
          if (items.isEmpty && !loading)
            SeisEmptyState(icon: Icons.inbox_outlined, title: 'No records', subtitle: 'Try a different search or add a new record.')
          else
            ...items.map(itemBuilder),
          const SizedBox(height: 12),
          buildPagination(
            page: page,
            totalPages: totalPages,
            total: total,
            limit: limit,
            onPage: (value) {
              setState(() => page = value);
              reload();
            },
            onLimit: (value) {
              setState(() {
                limit = value;
                page = 1;
              });
              reload();
            },
          ),
        ],
      ),
    );
  }
}

Widget buildPagination({
  required int page,
  required int totalPages,
  required int total,
  required int limit,
  required ValueChanged<int> onPage,
  required ValueChanged<int> onLimit,
}) {
  return SeisCard(
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    child: Row(
      children: [
        Text('$total records', style: const TextStyle(fontSize: 11, color: SeisColors.slate500)),
        const Spacer(),
        DropdownButton<int>(
          value: limit,
          items: const [
            DropdownMenuItem(value: 10, child: Text('10')),
            DropdownMenuItem(value: 20, child: Text('20')),
            DropdownMenuItem(value: 50, child: Text('50')),
          ],
          onChanged: (value) {
            if (value != null) onLimit(value);
          },
        ),
        const SizedBox(width: 8),
        IconButton(
          icon: const Icon(Icons.chevron_left),
          onPressed: page > 1 ? () => onPage(page - 1) : null,
        ),
        Text('$page / $totalPages', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
        IconButton(
          icon: const Icon(Icons.chevron_right),
          onPressed: page < totalPages ? () => onPage(page + 1) : null,
        ),
      ],
    ),
  );
}

class DashboardOverviewScreen extends StatefulWidget {
  final SeisNavigate onNavigate;

  const DashboardOverviewScreen({super.key, required this.onNavigate});

  @override
  State<DashboardOverviewScreen> createState() => _DashboardOverviewScreenState();
}

class _DashboardOverviewScreenState extends State<DashboardOverviewScreen> {
  Map<String, dynamic> _stats = {};
  List<dynamic> _results = [];
  List<dynamic> _totals = [];
  bool _loading = true;
  bool _live = false;
  Timer? _timer;
  late final LiveUpdateManager _manager;

  @override
  void initState() {
    super.initState();
    _manager = LiveUpdateManager();
    _manager.on('connected', (_) {
      if (!mounted) return;
      setState(() => _live = true);
      _manager.subscribe(1);
    });
    _manager.on('disconnected', (_) {
      if (!mounted) return;
      setState(() => _live = false);
    });
    _manager.on('result_update', (_) => _refresh());
    _manager.on('tally_update', (_) => _refresh());
    _load();
    _manager.connect();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => _refresh());
  }

  @override
  void dispose() {
    _timer?.cancel();
    _manager.disconnect();
    super.dispose();
  }

  void _refresh() {
    if (mounted) _load(silent: true);
  }

  Future<void> _load({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);
    try {
      final stats = await ApiService.getStats().catchError((_) => <String, dynamic>{});
      final results = await ApiService.getResults(page: 1, limit: 10).catchError(
        (_) => ResultsData(
          results: const PagedResult(items: [], total: 0, totalPages: 1),
          totals: const [],
        ),
      );
      if (!mounted) return;
      setState(() {
        _stats = stats;
        _results = results.results.items;
        _totals = results.totals;
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final computedTotals = _totals.isNotEmpty ? _totals : _aggregate(_results);
    final sorted = [...computedTotals]..sort(
      (a, b) => (int.tryParse(b['total_votes']?.toString() ?? '') ?? 0)
          .compareTo(int.tryParse(a['total_votes']?.toString() ?? '') ?? 0),
    );
    final totalVotes = _results.fold<int>(
      0,
      (sum, row) => sum + (int.tryParse(row['votes']?.toString() ?? '') ?? 0),
    );
    final maxVotes = sorted.isEmpty
        ? 1
        : int.tryParse(sorted.first['total_votes']?.toString() ?? '') ?? 1;

    return RefreshIndicator(
      onRefresh: _load,
      color: SeisColors.green600,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_loading) const LinearProgressIndicator(color: SeisColors.green600, minHeight: 2),
          Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Welcome back', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                    Text('Role: election participant', style: TextStyle(color: SeisColors.slate500, fontSize: 12)),
                  ],
                ),
              ),
              StatusChip(
                label: _live ? 'Live updates active' : 'Polling updates',
                tone: _live ? StatusTone.success : StatusTone.warning,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              SizedBox(
                width: 160,
                child: SeisPrimaryButton(label: 'Live Stream', compact: true, icon: Icons.bar_chart, onPressed: () => widget.onNavigate('/live-stream')),
              ),
              SizedBox(
                width: 160,
                child: SeisPrimaryButton(label: 'Biometric', compact: true, icon: Icons.fingerprint, onPressed: () => widget.onNavigate('/dashboard/biometric')),
              ),
              SizedBox(
                width: 160,
                child: SeisOutlineButton(label: 'Reports', compact: true, icon: Icons.description_outlined, onPressed: () => widget.onNavigate('/dashboard/reports')),
              ),
            ],
          ),
          const SizedBox(height: 18),
          SeisGrid(
            minTileWidth: 170,
            children: [
              StatTile(label: 'Registered Voters', value: _format(_stats['registered_voters']), icon: Icons.people_outline, color: SeisColors.info),
              StatTile(label: 'Candidates', value: _format(_stats['candidates']), icon: Icons.how_to_vote_outlined, color: const Color(0xFF7C3AED)),
              StatTile(label: 'Polling Stations', value: _format(_stats['polling_stations']), icon: Icons.location_on_outlined, color: SeisColors.green600),
              StatTile(label: 'Biometric Enrolled', value: _format(_stats['biometric_enrolled']), icon: Icons.fingerprint, color: SeisColors.warning),
            ],
          ),
          const SizedBox(height: 18),
          SeisCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text('Live Election Progress', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                    const Spacer(),
                    StatusChip(label: _live ? 'Live • active' : 'Standby', tone: _live ? StatusTone.success : StatusTone.neutral),
                  ],
                ),
                const SizedBox(height: 14),
                InfoRow(label: 'Votes counted', value: totalVotes.toString()),
                InfoRow(label: 'Leading', value: sorted.isEmpty ? 'Waiting for votes' : sorted.first['candidate']?.toString() ?? '—'),
                const SizedBox(height: 12),
                if (sorted.isEmpty)
                  const SeisEmptyState(icon: Icons.bar_chart, title: 'No live totals yet', subtitle: 'Results appear as ballots are submitted.')
                else
                  ...sorted.take(4).map((item) {
                    final votes = int.tryParse(item['total_votes']?.toString() ?? '') ?? 0;
                    final percent = maxVotes == 0 ? 0.0 : (votes / maxVotes) * 100;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Expanded(child: Text(item['candidate']?.toString() ?? 'Candidate', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12))),
                              Text('$votes votes', style: const TextStyle(color: SeisColors.slate500, fontSize: 12)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(999),
                            child: LinearProgressIndicator(
                              value: percent.clamp(0, 100) / 100,
                              minHeight: 9,
                              backgroundColor: SeisColors.slate200,
                              color: SeisColors.green600,
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SeisCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Integrity Timeline', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                SizedBox(height: 12),
                InfoRow(label: 'Biometric verification', value: 'Fingerprint / Face / Iris hashed with SHA-256', icon: Icons.fingerprint),
                InfoRow(label: 'Results pipeline', value: 'Aggregating station submissions', icon: Icons.bar_chart),
                InfoRow(label: 'Audit logging', value: 'All actions written to audit_logs', icon: Icons.verified_outlined),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<dynamic> _aggregate(List<dynamic> rows) {
    final totals = <String, Map<String, dynamic>>{};
    for (final row in rows) {
      final name = row['candidate']?.toString() ?? 'Candidate';
      final votes = int.tryParse(row['votes']?.toString() ?? '') ?? 0;
      totals.putIfAbsent(name, () => {'candidate': name, 'total_votes': 0});
      totals[name]!['total_votes'] = (totals[name]!['total_votes'] as int) + votes;
    }
    return totals.values.toList();
  }

  String _format(dynamic value) {
    if (value == null) return '—';
    final number = int.tryParse(value.toString());
    if (number == null) return value.toString();
    return number.toString().replaceAllMapped(
      RegExp(r'\B(?=(\d{3})+(?!\d))'),
      (match) => ',',
    );
  }
}

class ElectionsScreen extends StatefulWidget {
  final Map<String, dynamic>? user;

  const ElectionsScreen({super.key, required this.user});

  @override
  State<ElectionsScreen> createState() => _ElectionsScreenState();
}

class _ElectionsScreenState extends State<ElectionsScreen> with PaginatedListMixin<ElectionsScreen> {
  final _name = TextEditingController();
  final _description = TextEditingController();
  final _start = TextEditingController();
  final _end = TextEditingController();
  String _status = 'planned';

  @override
  Map<String, dynamic>? get user => widget.user;

  @override
  void initState() {
    super.initState();
    initList();
  }

  @override
  void dispose() {
    _name.dispose();
    _description.dispose();
    _start.dispose();
    _end.dispose();
    disposeList();
    super.dispose();
  }

  @override
  Future<PagedResult> fetch(int page, int limit, String search) {
    return ApiService.getElections(page: page, limit: limit, search: search);
  }

  @override
  Widget itemBuilder(dynamic item) {
    return SeisCard(
      child: Row(
        children: [
          CircleAvatar(backgroundColor: const Color(0xFFEAFBF2), child: Icon(Icons.how_to_vote_outlined, color: SeisColors.green600)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['name']?.toString() ?? 'Election', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: SeisColors.navy900)),
                const SizedBox(height: 3),
                Text(item['description']?.toString() ?? '—', style: const TextStyle(fontSize: 12, color: SeisColors.slate500)),
                Text('${item['start_date'] ?? '—'} → ${item['end_date'] ?? '—'}', style: const TextStyle(fontSize: 11, color: SeisColors.slate400)),
              ],
            ),
          ),
          StatusChip(label: item['status']?.toString() ?? 'planned'),
        ],
      ),
    );
  }

  @override
  Widget? formBuilder() {
    final allowed = can(SeisRoles.createElection);
    return SeisCard(
      color: allowed ? Colors.white : SeisColors.slate50,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.add_circle_outline, color: allowed ? SeisColors.green600 : SeisColors.slate400),
              const SizedBox(width: 8),
              const Text('Create Election', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
            ],
          ),
          if (!allowed) ...[
            const SizedBox(height: 8),
            SeisBanner(
              isError: true,
              message: 'Requires: ${SeisRoles.createElection.join(", ")}. Your role: ${user?['role'] ?? 'unknown'}',
            ),
          ],
          const SizedBox(height: 12),
          IgnorePointer(
            ignoring: !allowed,
            child: Opacity(
              opacity: allowed ? 1 : 0.5,
              child: Column(
                children: [
                  TextField(controller: _name, decoration: const InputDecoration(labelText: 'Name', isDense: true)),
                  const SizedBox(height: 10),
                  TextField(controller: _description, maxLines: 2, decoration: const InputDecoration(labelText: 'Description', isDense: true)),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(child: TextField(controller: _start, decoration: const InputDecoration(labelText: 'Start date (YYYY-MM-DD)', isDense: true))),
                      const SizedBox(width: 8),
                      Expanded(child: TextField(controller: _end, decoration: const InputDecoration(labelText: 'End date (YYYY-MM-DD)', isDense: true))),
                    ],
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: _status,
                    decoration: const InputDecoration(labelText: 'Status', isDense: true),
                    items: const [
                      DropdownMenuItem(value: 'planned', child: Text('planned')),
                      DropdownMenuItem(value: 'active', child: Text('active')),
                      DropdownMenuItem(value: 'closed', child: Text('closed')),
                    ],
                    onChanged: (value) => setState(() => _status = value ?? 'planned'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Future<void> onCreate() async {
    if (!can(SeisRoles.createElection)) {
      throw ApiException('Insufficient permissions to create an election.');
    }
    await ApiService.createElection(
      name: _name.text,
      description: _description.text,
      startDate: _start.text,
      endDate: _end.text,
      status: _status,
    );
    _name.clear();
    _description.clear();
    _start.clear();
    _end.clear();
  }

  @override
  Widget build(BuildContext context) {
    return buildListBody(
      title: 'Elections',
      subtitle: 'All elections — paginated',
      searchHint: 'Search elections…',
    );
  }
}

class VotersScreen extends StatefulWidget {
  final Map<String, dynamic>? user;

  const VotersScreen({super.key, required this.user});

  @override
  State<VotersScreen> createState() => _VotersScreenState();
}

class _VotersScreenState extends State<VotersScreen> with PaginatedListMixin<VotersScreen> {
  @override
  Map<String, dynamic>? get user => widget.user;

  @override
  void initState() {
    super.initState();
    initList();
  }

  @override
  void dispose() {
    disposeList();
    super.dispose();
  }

  @override
  Future<PagedResult> fetch(int page, int limit, String search) {
    return ApiService.getUsers(page: page, limit: limit, search: search);
  }

  @override
  Widget itemBuilder(dynamic item) {
    return SeisCard(
      child: Row(
        children: [
          CircleAvatar(child: Text((item['full_name']?.toString() ?? 'U').substring(0, 1))),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['full_name']?.toString() ?? 'User', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                Text(item['email']?.toString() ?? '—', style: const TextStyle(fontSize: 12, color: SeisColors.slate500)),
                Text('Joined ${item['created_at']?.toString().split('T').first ?? '—'}', style: const TextStyle(fontSize: 11, color: SeisColors.slate400)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              StatusChip(label: item['role']?.toString() ?? 'user', tone: StatusTone.info),
              const SizedBox(height: 6),
              Icon(
                item['biometric_enrolled'] == true ? Icons.verified : Icons.fingerprint_outlined,
                size: 16,
                color: item['biometric_enrolled'] == true ? SeisColors.green600 : SeisColors.slate400,
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return buildListBody(
      title: 'Voters & Users',
      subtitle: 'All registered users — live from backend',
      searchHint: 'Search name or email…',
    );
  }
}

class CandidatesScreen extends StatefulWidget {
  final Map<String, dynamic>? user;

  const CandidatesScreen({super.key, required this.user});

  @override
  State<CandidatesScreen> createState() => _CandidatesScreenState();
}

class _CandidatesScreenState extends State<CandidatesScreen> with PaginatedListMixin<CandidatesScreen> {
  final _fullName = TextEditingController();
  final _party = TextEditingController();
  final _position = TextEditingController(text: 'President');
  final _manifesto = TextEditingController();
  List<dynamic> _elections = [];
  int? _electionId;

  @override
  Map<String, dynamic>? get user => widget.user;

  @override
  void initState() {
    super.initState();
    initList();
    _loadElections();
  }

  @override
  void dispose() {
    _fullName.dispose();
    _party.dispose();
    _position.dispose();
    _manifesto.dispose();
    disposeList();
    super.dispose();
  }

  Future<void> _loadElections() async {
    try {
      final result = await ApiService.getElections(limit: 200);
      if (!mounted) return;
      setState(() => _elections = result.items);
    } catch (_) {}
  }

  @override
  Future<PagedResult> fetch(int page, int limit, String search) {
    return ApiService.getCandidates(page: page, limit: limit, search: search);
  }

  @override
  Widget itemBuilder(dynamic item) {
    return SeisCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(item['full_name']?.toString() ?? 'Candidate', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14))),
              StatusChip(label: item['status']?.toString() ?? 'approved', tone: toneFor(item['status']?.toString() ?? '')),
            ],
          ),
          const SizedBox(height: 6),
          InfoRow(label: 'Position', value: item['position']?.toString() ?? '—'),
          InfoRow(label: 'Party', value: item['party']?.toString() ?? '—'),
          InfoRow(label: 'Election', value: item['election']?.toString() ?? item['election_id']?.toString() ?? '—'),
          InfoRow(label: 'Votes', value: item['votes']?.toString() ?? '0'),
        ],
      ),
    );
  }

  @override
  Widget? formBuilder() {
    final allowed = can(SeisRoles.createCandidate);
    return SeisCard(
      color: allowed ? Colors.white : SeisColors.slate50,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.person_add_outlined, color: allowed ? SeisColors.green600 : SeisColors.slate400),
              const SizedBox(width: 8),
              const Text('Add Candidate', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
            ],
          ),
          if (!allowed)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: SeisBanner(isError: true, message: 'Requires: ${SeisRoles.createCandidate.join(", ")}'),
            ),
          const SizedBox(height: 12),
          IgnorePointer(
            ignoring: !allowed,
            child: Opacity(
              opacity: allowed ? 1 : 0.5,
              child: Column(
                children: [
                  DropdownButtonFormField<int?>(
                    initialValue: _electionId,
                    decoration: const InputDecoration(labelText: 'Election', isDense: true),
                    items: [
                      const DropdownMenuItem<int?>(value: null, child: Text('Select election')),
                      for (final election in _elections)
                        DropdownMenuItem<int?>(
                          value: int.tryParse(election['id']?.toString() ?? ''),
                          child: Text(election['name']?.toString() ?? 'Election'),
                        ),
                    ],
                    onChanged: (value) => setState(() => _electionId = value),
                  ),
                  const SizedBox(height: 10),
                  TextField(controller: _fullName, decoration: const InputDecoration(labelText: 'Full name', isDense: true)),
                  const SizedBox(height: 10),
                  TextField(controller: _party, decoration: const InputDecoration(labelText: 'Party', isDense: true)),
                  const SizedBox(height: 10),
                  TextField(controller: _position, decoration: const InputDecoration(labelText: 'Position', isDense: true)),
                  const SizedBox(height: 10),
                  TextField(controller: _manifesto, maxLines: 2, decoration: const InputDecoration(labelText: 'Manifesto (optional)', isDense: true)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Future<void> onCreate() async {
    if (!can(SeisRoles.createCandidate)) {
      throw const ApiException('Insufficient permissions to add a candidate.');
    }
    if (_electionId == null) {
      throw const ApiException('Select an election first.');
    }
    await ApiService.createCandidate(
      electionId: _electionId!,
      fullName: _fullName.text,
      party: _party.text,
      position: _position.text,
      manifesto: _manifesto.text,
    );
    _fullName.clear();
    _party.clear();
    _manifesto.clear();
  }

  @override
  Widget build(BuildContext context) {
    return buildListBody(
      title: 'Candidates',
      subtitle: 'Manage candidates per election',
      searchHint: 'Search name or party…',
    );
  }
}

class StationsScreen extends StatefulWidget {
  final Map<String, dynamic>? user;

  const StationsScreen({super.key, required this.user});

  @override
  State<StationsScreen> createState() => _StationsScreenState();
}

class _StationsScreenState extends State<StationsScreen> with PaginatedListMixin<StationsScreen> {
  final _name = TextEditingController();
  final _location = TextEditingController();
  final _county = TextEditingController();
  final _voters = TextEditingController();

  @override
  Map<String, dynamic>? get user => widget.user;

  @override
  void initState() {
    super.initState();
    initList();
  }

  @override
  void dispose() {
    _name.dispose();
    _location.dispose();
    _county.dispose();
    _voters.dispose();
    disposeList();
    super.dispose();
  }

  @override
  Future<PagedResult> fetch(int page, int limit, String search) {
    return ApiService.getStations(page: page, limit: limit, search: search);
  }

  @override
  Widget itemBuilder(dynamic item) {
    return SeisCard(
      child: Row(
        children: [
          const Icon(Icons.location_on_outlined, color: SeisColors.green600),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['name']?.toString() ?? 'Station', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                Text(item['location']?.toString() ?? '—', style: const TextStyle(fontSize: 12, color: SeisColors.slate500)),
                Text('County: ${item['county']?.toString() ?? '—'}', style: const TextStyle(fontSize: 11, color: SeisColors.slate400)),
              ],
            ),
          ),
          Text('${item['registered_voters'] ?? 0} voters', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  @override
  Widget? formBuilder() {
    final allowed = can(SeisRoles.createStation);
    return SeisCard(
      color: allowed ? Colors.white : SeisColors.slate50,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.add_location_alt_outlined, color: allowed ? SeisColors.green600 : SeisColors.slate400),
              const SizedBox(width: 8),
              const Text('Add Station', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
            ],
          ),
          if (!allowed)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: SeisBanner(isError: true, message: 'Requires: ${SeisRoles.createStation.join(", ")}'),
            ),
          const SizedBox(height: 12),
          IgnorePointer(
            ignoring: !allowed,
            child: Opacity(
              opacity: allowed ? 1 : 0.5,
              child: Column(
                children: [
                  TextField(controller: _name, decoration: const InputDecoration(labelText: 'Station name', isDense: true)),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(child: TextField(controller: _location, decoration: const InputDecoration(labelText: 'Location', isDense: true))),
                      const SizedBox(width: 8),
                      Expanded(child: TextField(controller: _county, decoration: const InputDecoration(labelText: 'County', isDense: true))),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(controller: _voters, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Registered voters', isDense: true)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Future<void> onCreate() async {
    if (!can(SeisRoles.createStation)) {
      throw const ApiException('Insufficient permissions to add a station.');
    }
    await ApiService.createStation(
      name: _name.text,
      location: _location.text,
      county: _county.text,
      registeredVoters: int.tryParse(_voters.text) ?? 0,
    );
    _name.clear();
    _location.clear();
    _county.clear();
    _voters.clear();
  }

  @override
  Widget build(BuildContext context) {
    return buildListBody(
      title: 'Polling Stations',
      subtitle: 'Stations are the source of results',
      searchHint: 'Search station / county…',
    );
  }
}

class CandidatePortalScreen extends StatefulWidget {
  final Map<String, dynamic>? user;

  const CandidatePortalScreen({super.key, required this.user});

  @override
  State<CandidatePortalScreen> createState() => _CandidatePortalScreenState();
}

class _CandidatePortalScreenState extends State<CandidatePortalScreen> {
  List<dynamic> _elections = [];
  List<dynamic> _myApps = [];
  List<dynamic> _all = [];
  final _fullName = TextEditingController();
  final _party = TextEditingController();
  final _position = TextEditingController(text: 'President');
  final _manifesto = TextEditingController();
  final _search = TextEditingController();
  int? _electionId;
  bool _loading = true;
  String? _error;
  String? _message;

  @override
  void initState() {
    super.initState();
    _fullName.text = widget.user?['full_name']?.toString() ?? '';
    _loadAll();
  }

  @override
  void dispose() {
    _fullName.dispose();
    _party.dispose();
    _position.dispose();
    _manifesto.dispose();
    _search.dispose();
    super.dispose();
  }

  bool get isReviewer => hasAnyRole(widget.user, SeisRoles.reviewCandidate);

  Future<void> _loadAll() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final elections = await ApiService.getElections(limit: 200);
      final my = await ApiService.getMyCandidates(limit: 200);
      final all = await ApiService.getCandidates(limit: 200, search: _search.text.trim());
      if (!mounted) return;
      setState(() {
        _elections = elections.items;
        _myApps = my.items;
        _all = all.items;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.toString().replaceFirst('Exception: ', '');
        _loading = false;
      });
    }
  }

  Future<void> _apply() async {
    setState(() {
      _error = null;
      _message = null;
    });
    if (_electionId == null) {
      setState(() => _error = 'Select an election first.');
      return;
    }
    try {
      await ApiService.applyCandidate(
        electionId: _electionId!,
        fullName: _fullName.text,
        party: _party.text,
        position: _position.text,
        manifesto: _manifesto.text,
      );
      setState(() {
        _message = 'Application submitted — pending approval';
        _party.clear();
        _manifesto.clear();
        _electionId = null;
      });
      await _loadAll();
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    }
  }

  Future<void> _review(int id, String status) async {
    if (!isReviewer) {
      setState(() => _error = 'Requires reviewer role: ${SeisRoles.reviewCandidate.join(", ")}');
      return;
    }
    try {
      await ApiService.updateCandidateStatus(id, status: status);
      setState(() => _message = 'Candidate $status');
      await _loadAll();
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    final votes = _myApps.fold<int>(0, (sum, item) => sum + (int.tryParse(item['votes']?.toString() ?? '') ?? 0));
    final approved = _myApps.where((item) => item['status']?.toString() == 'approved').length;

    return RefreshIndicator(
      onRefresh: _loadAll,
      color: SeisColors.green600,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Candidate Portal', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
          const Text('Register as candidate & track your progress', style: TextStyle(color: SeisColors.slate500, fontSize: 12)),
          if (_loading) const LinearProgressIndicator(color: SeisColors.green600, minHeight: 2),
          const SizedBox(height: 12),
          if (_error != null) ...[
            SeisBanner(message: _error!, isError: true),
            const SizedBox(height: 12),
          ],
          if (_message != null) ...[
            SeisBanner(message: _message!),
            const SizedBox(height: 12),
          ],
          SeisGrid(
            minTileWidth: 150,
            children: [
              SeisCard(child: _metric('Applications', '${_myApps.length}', '$approved approved')),
              SeisCard(child: _metric('Total Votes', '$votes', 'across all elections')),
              SeisCard(child: _metric('Role', widget.user?['role']?.toString() ?? 'citizen', isReviewer ? 'can review applications' : 'applicant view')),
            ],
          ),
          const SizedBox(height: 16),
          SeisCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Apply as Candidate', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                const SizedBox(height: 12),
                DropdownButtonFormField<int?>(
                  initialValue: _electionId,
                  decoration: const InputDecoration(labelText: 'Election', isDense: true),
                  items: [
                    const DropdownMenuItem<int?>(value: null, child: Text('Select election')),
                    for (final election in _elections)
                      DropdownMenuItem<int?>(
                        value: int.tryParse(election['id']?.toString() ?? ''),
                        child: Text('${election['name'] ?? 'Election'} — ${election['status'] ?? ''}'),
                      ),
                  ],
                  onChanged: (value) => setState(() => _electionId = value),
                ),
                const SizedBox(height: 10),
                TextField(controller: _fullName, decoration: const InputDecoration(labelText: 'Full name', isDense: true)),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(child: TextField(controller: _party, decoration: const InputDecoration(labelText: 'Party', isDense: true))),
                    const SizedBox(width: 8),
                    Expanded(child: TextField(controller: _position, decoration: const InputDecoration(labelText: 'Position', isDense: true))),
                  ],
                ),
                const SizedBox(height: 10),
                TextField(controller: _manifesto, maxLines: 2, decoration: const InputDecoration(labelText: 'Manifesto (optional)', isDense: true)),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerLeft,
                  child: SeisPrimaryButton(label: 'Submit Application', icon: Icons.send, compact: true, onPressed: _apply),
                ),
                const SizedBox(height: 8),
                const Text('Applications start as pending and require approval by election administrators or returning officers.', style: TextStyle(color: SeisColors.slate500, fontSize: 11)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SeisCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('My Applications & Progress', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                const SizedBox(height: 10),
                if (_myApps.isEmpty)
                  const Text('No applications yet — apply above.', style: TextStyle(color: SeisColors.slate500))
                else
                  ..._myApps.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(child: Text(item['election']?.toString() ?? item['election_id']?.toString() ?? 'Election', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13))),
                              StatusChip(label: item['status']?.toString() ?? 'pending', tone: toneFor(item['status']?.toString() ?? '')),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text('${item['position'] ?? '—'} · ${item['party'] ?? '—'} · ${item['votes'] ?? 0} votes', style: const TextStyle(fontSize: 12, color: SeisColors.slate500)),
                          if (item['rejection_reason'] != null)
                            Text(item['rejection_reason'].toString(), style: const TextStyle(fontSize: 11, color: SeisColors.danger)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _search,
                  decoration: const InputDecoration(hintText: 'Search candidates…', isDense: true, prefixIcon: Icon(Icons.search, size: 18)),
                  onSubmitted: (_) => _loadAll(),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(width: 90, child: SeisPrimaryButton(label: 'Go', compact: true, onPressed: _loadAll)),
            ],
          ),
          const SizedBox(height: 12),
          SeisCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text('All Candidates', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                    const Spacer(),
                    if (isReviewer) const StatusChip(label: 'Reviewer', tone: StatusTone.success),
                  ],
                ),
                const SizedBox(height: 10),
                if (_all.isEmpty)
                  const Text('No candidates yet.', style: TextStyle(color: SeisColors.slate500))
                else
                  ..._all.map(
                    (item) {
                      final id = int.tryParse(item['id']?.toString() ?? '');
                      final status = item['status']?.toString() ?? 'approved';
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(child: Text(item['full_name']?.toString() ?? 'Candidate', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13))),
                                StatusChip(label: status, tone: toneFor(status)),
                              ],
                            ),
                            Text('${item['party'] ?? '—'} · ${item['position'] ?? '—'} · ${item['votes'] ?? 0} votes', style: const TextStyle(fontSize: 12, color: SeisColors.slate500)),
                            if (isReviewer && id != null) ...[
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  if (status != 'approved')
                                    SizedBox(
                                      width: 100,
                                      child: SeisPrimaryButton(label: 'Approve', compact: true, onPressed: () => _review(id, 'approved')),
                                    ),
                                  if (status != 'rejected') ...[
                                    const SizedBox(width: 8),
                                    SizedBox(
                                      width: 100,
                                      child: SeisOutlineButton(label: 'Reject', compact: true, onPressed: () => _review(id, 'rejected')),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ],
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _metric(String label, String value, String note) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: SeisColors.slate500, fontSize: 11)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
        Text(note, style: const TextStyle(color: SeisColors.slate500, fontSize: 10)),
      ],
    );
  }
}

class ResultsScreen extends StatefulWidget {
  final Map<String, dynamic>? user;

  const ResultsScreen({super.key, required this.user});

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  List<dynamic> _results = [];
  List<dynamic> _totals = [];
  List<dynamic> _candidates = [];
  List<dynamic> _stations = [];
  List<dynamic> _elections = [];
  final _search = TextEditingController();
  int? _electionId;
  int? _candidateId;
  int? _stationId;
  final _votes = TextEditingController();
  int page = 1;
  int limit = 10;
  int total = 0;
  int totalPages = 1;
  bool _loading = true;
  bool _live = false;
  String? _error;
  String? _message;
  Timer? _timer;
  late final LiveUpdateManager _manager;

  @override
  void initState() {
    super.initState();
    _manager = LiveUpdateManager();
    _manager.on('connected', (_) {
      if (!mounted) return;
      setState(() => _live = true);
      _subscribeAll();
    });
    _manager.on('disconnected', (_) {
      if (!mounted) return;
      setState(() => _live = false);
    });
    _manager.on('result_update', (_) => _refresh());
    _manager.on('tally_update', (_) => _refresh());
    _loadResults();
    _loadMeta();
    _manager.connect();
    _timer = Timer.periodic(const Duration(seconds: 15), (_) {
      if (!_manager.isConnected()) _refresh();
    });
  }

  @override
  void dispose() {
    _search.dispose();
    _votes.dispose();
    _timer?.cancel();
    _manager.disconnect();
    super.dispose();
  }

  void _refresh() {
    if (mounted) _loadResults(silent: true);
  }

  void _subscribeAll() {
    if (!_manager.isConnected()) return;
    for (final election in _elections) {
      final id = election['id'];
      if (id != null) _manager.subscribe(id);
    }
  }

  bool get canSubmit => hasAnyRole(widget.user, SeisRoles.submitResult);
  bool get canVerify => hasAnyRole(widget.user, SeisRoles.verifyResult);

  Future<void> _loadResults({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);
    try {
      final data = await ApiService.getResults(page: page, limit: limit, search: _search.text.trim());
      if (!mounted) return;
      setState(() {
        _results = data.results.items;
        _totals = data.totals;
        total = data.results.total;
        totalPages = data.results.totalPages;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.toString().replaceFirst('Exception: ', '');
        _loading = false;
      });
    }
  }

  Future<void> _loadMeta() async {
    try {
      final candidates = await ApiService.getCandidates(limit: 200);
      final stations = await ApiService.getStations(limit: 200);
      final elections = await ApiService.getElections(limit: 200);
      if (!mounted) return;
      setState(() {
        _candidates = candidates.items;
        _stations = stations.items;
        _elections = elections.items;
      });
      _subscribeAll();
    } catch (_) {}
  }

  Future<void> _submit() async {
    setState(() {
      _error = null;
      _message = null;
    });
    if (!canSubmit) {
      setState(() => _error = 'Submit requires: ${SeisRoles.submitResult.join(", ")}');
      return;
    }
    if (_electionId == null || _candidateId == null || _stationId == null || _votes.text.isEmpty) {
      setState(() => _error = 'Complete all result fields.');
      return;
    }
    try {
      await ApiService.submitResult(
        electionId: _electionId!,
        candidateId: _candidateId!,
        pollingStationId: _stationId!,
        votes: int.tryParse(_votes.text) ?? 0,
      );
      setState(() {
        _message = 'Result submitted';
        _votes.clear();
      });
      await _loadResults();
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    }
  }

  Future<void> _verify(int id) async {
    if (!canVerify) {
      setState(() => _error = 'Verify requires: ${SeisRoles.verifyResult.join(", ")}');
      return;
    }
    try {
      await ApiService.verifyResult(id);
      setState(() => _message = 'Verified #$id');
      await _loadResults();
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _loadResults,
      color: SeisColors.green600,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Results', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                    Text('Submit and verify — role-gated', style: TextStyle(color: SeisColors.slate500, fontSize: 12)),
                  ],
                ),
              ),
              StatusChip(label: _live ? 'Live WebSocket' : 'Polling', tone: _live ? StatusTone.success : StatusTone.warning),
            ],
          ),
          if (_loading) const LinearProgressIndicator(color: SeisColors.green600, minHeight: 2),
          const SizedBox(height: 12),
          if (_error != null) ...[
            SeisBanner(message: _error!, isError: true),
            const SizedBox(height: 12),
          ],
          if (_message != null) ...[
            SeisBanner(message: _message!),
            const SizedBox(height: 12),
          ],
          SeisCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Vote Totals (aggregated)', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                const SizedBox(height: 10),
                if (_totals.isEmpty)
                  const Text('No votes yet', style: TextStyle(color: SeisColors.slate500))
                else
                  SeisGrid(
                    minTileWidth: 150,
                    children: [
                      for (final item in _totals)
                        SeisCard(
                          color: SeisColors.slate50,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['candidate']?.toString() ?? 'Candidate', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                              const SizedBox(height: 4),
                              Text('${item['total_votes'] ?? 0} votes', style: const TextStyle(color: SeisColors.green600, fontWeight: FontWeight.w800)),
                            ],
                          ),
                        ),
                    ],
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _search,
                  decoration: const InputDecoration(hintText: 'Search candidate / station…', isDense: true, prefixIcon: Icon(Icons.search, size: 18)),
                  onSubmitted: (_) {
                    setState(() => page = 1);
                    _loadResults();
                  },
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 92,
                child: SeisPrimaryButton(
                  label: 'Search',
                  compact: true,
                  onPressed: () {
                    setState(() => page = 1);
                    _loadResults();
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SeisCard(
            color: canSubmit ? Colors.white : SeisColors.slate50,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.add_circle_outline, color: canSubmit ? SeisColors.green600 : SeisColors.slate400),
                    const SizedBox(width: 8),
                    const Text('Submit Result', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                  ],
                ),
                if (!canSubmit)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: SeisBanner(isError: true, message: 'Requires: ${SeisRoles.submitResult.join(", ")}'),
                  ),
                const SizedBox(height: 12),
                IgnorePointer(
                  ignoring: !canSubmit,
                  child: Opacity(
                    opacity: canSubmit ? 1 : 0.5,
                    child: Column(
                      children: [
                        DropdownButtonFormField<int?>(
                          initialValue: _electionId,
                          decoration: const InputDecoration(labelText: 'Election', isDense: true),
                          items: [
                            const DropdownMenuItem<int?>(value: null, child: Text('Election')),
                            for (final item in _elections)
                              DropdownMenuItem<int?>(value: int.tryParse(item['id']?.toString() ?? ''), child: Text(item['name']?.toString() ?? 'Election')),
                          ],
                          onChanged: (value) => setState(() => _electionId = value),
                        ),
                        const SizedBox(height: 10),
                        DropdownButtonFormField<int?>(
                          initialValue: _candidateId,
                          decoration: const InputDecoration(labelText: 'Candidate', isDense: true),
                          items: [
                            const DropdownMenuItem<int?>(value: null, child: Text('Candidate')),
                            for (final item in _candidates)
                              DropdownMenuItem<int?>(value: int.tryParse(item['id']?.toString() ?? ''), child: Text('${item['full_name'] ?? 'Candidate'} — ${item['position'] ?? ''}')),
                          ],
                          onChanged: (value) => setState(() => _candidateId = value),
                        ),
                        const SizedBox(height: 10),
                        DropdownButtonFormField<int?>(
                          initialValue: _stationId,
                          decoration: const InputDecoration(labelText: 'Polling Station', isDense: true),
                          items: [
                            const DropdownMenuItem<int?>(value: null, child: Text('Polling Station')),
                            for (final item in _stations)
                              DropdownMenuItem<int?>(value: int.tryParse(item['id']?.toString() ?? ''), child: Text('${item['name'] ?? 'Station'} — ${item['location'] ?? ''}')),
                          ],
                          onChanged: (value) => setState(() => _stationId = value),
                        ),
                        const SizedBox(height: 10),
                        TextField(controller: _votes, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Votes', isDense: true)),
                        const SizedBox(height: 12),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: SeisPrimaryButton(label: 'Submit Result', compact: true, icon: Icons.send, onPressed: _submit),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (_results.isEmpty)
            const SeisEmptyState(icon: Icons.bar_chart, title: 'No results yet', subtitle: 'Submit one above.')
          else
            ..._results.map(
              (item) => SeisCard(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item['candidate']?.toString() ?? 'Candidate', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                          Text('${item['election'] ?? '—'} · ${item['station'] ?? '—'}', style: const TextStyle(fontSize: 12, color: SeisColors.slate500)),
                          Text('${item['votes'] ?? 0} votes', style: const TextStyle(fontSize: 12, color: SeisColors.green600, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                    if (item['verified'] == true)
                      const StatusChip(label: 'verified', tone: StatusTone.success)
                    else if (canVerify)
                      SizedBox(
                        width: 90,
                        child: SeisPrimaryButton(
                          label: 'Verify',
                          compact: true,
                          onPressed: () => _verify(int.tryParse(item['id']?.toString() ?? '') ?? 0),
                        ),
                      )
                    else
                      const StatusChip(label: 'pending', tone: StatusTone.warning),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 12),
          buildPagination(
            page: page,
            totalPages: totalPages,
            total: total,
            limit: limit,
            onPage: (value) {
              setState(() => page = value);
              _loadResults();
            },
            onLimit: (value) {
              setState(() {
                limit = value;
                page = 1;
              });
              _loadResults();
            },
          ),
        ],
      ),
    );
  }
}

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  List<dynamic> _logs = [];
  List<dynamic> _incidents = [];
  List<dynamic> _stations = [];
  Map<String, dynamic>? _stats;
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _searchLogs = TextEditingController();
  final _searchIncidents = TextEditingController();
  int? _stationId;
  String _severity = 'medium';
  bool _loading = true;
  String? _error;
  String? _message;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _searchLogs.dispose();
    _searchIncidents.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final logs = await ApiService.getAuditLogs(limit: 10, search: _searchLogs.text.trim());
      final incidents = await ApiService.getIncidents(limit: 5, search: _searchIncidents.text.trim());
      final stations = await ApiService.getStations(limit: 200);
      final stats = await ApiService.getStats().catchError((_) => <String, dynamic>{});
      if (!mounted) return;
      setState(() {
        _logs = logs.items;
        _incidents = incidents.items;
        _stations = stations.items;
        _stats = stats;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.toString().replaceFirst('Exception: ', '');
        _loading = false;
      });
    }
  }

  Future<void> _report() async {
    setState(() {
      _error = null;
      _message = null;
    });
    if (_title.text.trim().isEmpty) {
      setState(() => _error = 'Enter an incident title.');
      return;
    }
    try {
      await ApiService.reportIncident(
        title: _title.text,
        description: _description.text,
        severity: _severity,
        pollingStationId: _stationId,
      );
      setState(() {
        _message = 'Incident reported';
        _title.clear();
        _description.clear();
        _stationId = null;
        _severity = 'medium';
      });
      await _load();
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      color: SeisColors.green600,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Reports & Audit', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                    Text('Traceability and incident monitoring', style: TextStyle(color: SeisColors.slate500, fontSize: 12)),
                  ],
                ),
              ),
              const StatusChip(label: 'Live', tone: StatusTone.success),
            ],
          ),
          if (_loading) const LinearProgressIndicator(color: SeisColors.green600, minHeight: 2),
          const SizedBox(height: 12),
          if (_error != null) ...[
            SeisBanner(message: '$_error — login required for audit view.', isError: true),
            const SizedBox(height: 12),
          ],
          if (_message != null) ...[
            SeisBanner(message: _message!),
            const SizedBox(height: 12),
          ],
          if (_stats != null)
            SeisGrid(
              minTileWidth: 150,
              children: [
                StatTile(label: 'Registered Voters', value: _stats!['registered_voters']?.toString() ?? '—', icon: Icons.people_outline, color: SeisColors.info),
                StatTile(label: 'Elections', value: _stats!['elections']?.toString() ?? '—', icon: Icons.how_to_vote_outlined, color: const Color(0xFF7C3AED)),
                StatTile(label: 'Stations', value: _stats!['polling_stations']?.toString() ?? '—', icon: Icons.location_on_outlined, color: SeisColors.green600),
                StatTile(label: 'Biometric Enrolled', value: _stats!['biometric_enrolled']?.toString() ?? '—', icon: Icons.fingerprint, color: SeisColors.warning),
              ],
            ),
          const SizedBox(height: 16),
          SeisCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Report Incident', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                const SizedBox(height: 12),
                TextField(controller: _title, decoration: const InputDecoration(labelText: 'Title', isDense: true)),
                const SizedBox(height: 10),
                TextField(controller: _description, maxLines: 2, decoration: const InputDecoration(labelText: 'Description', isDense: true)),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<int?>(
                        initialValue: _stationId,
                        decoration: const InputDecoration(labelText: 'Station', isDense: true),
                        items: [
                          const DropdownMenuItem<int?>(value: null, child: Text('No station')),
                          for (final station in _stations)
                            DropdownMenuItem<int?>(
                              value: int.tryParse(station['id']?.toString() ?? ''),
                              child: Text(station['name']?.toString() ?? 'Station'),
                            ),
                        ],
                        onChanged: (value) => setState(() => _stationId = value),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: _severity,
                        decoration: const InputDecoration(labelText: 'Severity', isDense: true),
                        items: const [
                          DropdownMenuItem(value: 'low', child: Text('low')),
                          DropdownMenuItem(value: 'medium', child: Text('medium')),
                          DropdownMenuItem(value: 'high', child: Text('high')),
                          DropdownMenuItem(value: 'critical', child: Text('critical')),
                        ],
                        onChanged: (value) => setState(() => _severity = value ?? 'medium'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerLeft,
                  child: SeisPrimaryButton(label: 'Report', compact: true, icon: Icons.send, onPressed: _report),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SeisCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Incidents', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                const SizedBox(height: 10),
                TextField(
                  controller: _searchIncidents,
                  decoration: const InputDecoration(hintText: 'Search incidents…', isDense: true, prefixIcon: Icon(Icons.search, size: 18)),
                  onSubmitted: (_) => _load(),
                ),
                const SizedBox(height: 10),
                if (_incidents.isEmpty)
                  const Text('No incidents reported', style: TextStyle(color: SeisColors.slate500))
                else
                  ..._incidents.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(child: Text(item['title']?.toString() ?? 'Incident', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13))),
                              StatusChip(label: item['severity']?.toString() ?? 'medium', tone: toneFor(item['severity']?.toString() ?? '')),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(item['description']?.toString() ?? '—', style: const TextStyle(fontSize: 12, color: SeisColors.slate500)),
                          Text('${item['status'] ?? 'open'} · ${item['created_at'] ?? ''}', style: const TextStyle(fontSize: 11, color: SeisColors.slate400)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SeisCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Audit Logs', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                const SizedBox(height: 10),
                TextField(
                  controller: _searchLogs,
                  decoration: const InputDecoration(hintText: 'Search action…', isDense: true, prefixIcon: Icon(Icons.search, size: 18)),
                  onSubmitted: (_) => _load(),
                ),
                const SizedBox(height: 10),
                if (_logs.isEmpty)
                  const Text('No audit logs yet — perform actions to generate logs.', style: TextStyle(color: SeisColors.slate500))
                else
                  ..._logs.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          const Icon(Icons.shield_outlined, color: SeisColors.green600, size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item['action']?.toString() ?? 'audit', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                                Text(item['description']?.toString() ?? '', style: const TextStyle(fontSize: 11, color: SeisColors.slate500)),
                                Text(item['created_at']?.toString() ?? '', style: const TextStyle(fontSize: 10, color: SeisColors.slate400)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 10),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: SeisColors.navy950, borderRadius: BorderRadius.circular(10)),
                  child: const Text(
                    '[audit] user_register • hashed bcrypt\n[audit] biometric_enroll • sha256\n[audit] result_submit • upsert + verify',
                    style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 11, fontFamily: 'monospace'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class DashboardBiometricScreen extends StatelessWidget {
  const DashboardBiometricScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const BiometricView(embedded: true);
  }
}
