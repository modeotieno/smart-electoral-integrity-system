import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import 'api_service.dart';
import 'live_updates.dart';
import 'theme.dart';
import 'ui.dart';

const publicNavItems = <(String, String)>[
  ('Home', '/'),
  ('Live Stream', '/live-stream'),
  ('About', '/about'),
  ('Features', '/features'),
  ('How It Works', '/how-it-works'),
  ('Who We Serve', '/who-we-serve'),
  ('Contact', '/contact'),
];

class PublicShell extends StatelessWidget {
  final String route;
  final SeisNavigate onNavigate;
  final Widget child;

  const PublicShell({
    super.key,
    required this.route,
    required this.onNavigate,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SeisColors.slate50,
      appBar: AppBar(
        title: SeisLogo(dark: true, compact: true),
        actions: [
          TextButton.icon(
            onPressed: () => onNavigate('/login'),
            icon: const Icon(Icons.login, size: 18),
            label: const Text('Login'),
            style: TextButton.styleFrom(foregroundColor: Colors.white70),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 10),
            child: FilledButton(
              onPressed: () => onNavigate('/signup'),
              style: FilledButton.styleFrom(
                backgroundColor: SeisColors.green600,
                minimumSize: const Size(110, 38),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9)),
              ),
              child: const Text('Get Started'),
            ),
          ),
        ],
      ),
      drawer: Drawer(
        backgroundColor: SeisColors.navy950,
        child: SafeArea(
          child: Column(
            children: [
              const Padding(
                padding: EdgeInsets.all(20),
                child: SeisLogo(dark: true),
              ),
              const Divider(color: Colors.white12),
              for (final item in publicNavItems)
                ListTile(
                  leading: const Icon(Icons.chevron_right, color: SeisColors.green400),
                  title: Text(
                    item.$1,
                    style: TextStyle(
                      color: route == item.$2 ? Colors.white : Colors.white70,
                      fontWeight: route == item.$2 ? FontWeight.w800 : FontWeight.w500,
                    ),
                  ),
                  selected: route == item.$2,
                  selectedTileColor: const Color(0x1420C77A),
                  onTap: () {
                    Navigator.of(context).pop();
                    onNavigate(item.$2);
                  },
                ),
              const Spacer(),
              ListTile(
                leading: const Icon(Icons.fingerprint, color: SeisColors.green400),
                title: const Text('Biometric', style: TextStyle(color: Colors.white70)),
                onTap: () {
                  Navigator.of(context).pop();
                  onNavigate('/biometric');
                },
              ),
            ],
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(child: child),
          const PublicFooter(),
        ],
      ),
    );
  }
}

class PublicFooter extends StatelessWidget {
  const PublicFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: SeisColors.navy950,
      padding: const EdgeInsets.fromLTRB(20, 28, 20, 18),
      child: Column(
        children: [
          const SeisLogo(dark: true),
          const SizedBox(height: 16),
          const Text(
            'Empowering modern democracies with cryptographically verifiable, '
            'transparent, and resilient electoral infrastructure.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF9FB2C7), fontSize: 12, height: 1.6),
          ),
          const SizedBox(height: 18),
          SeisGrid(
            minTileWidth: 160,
            children: [
              _footerColumn('Platform', const [
                ['Cryptographic Audit', '/features'],
                ['Biometric Auth', '/features'],
                ['Live Tallying', '/how-it-works'],
                ['Public Ledger', '/features'],
              ]),
              _footerColumn('Stakeholders', const [
                ['Electoral Commissions', '/who-we-serve'],
                ['Registered Voters', '/who-we-serve'],
                ['International Observers', '/who-we-serve'],
                ['Political Parties', '/who-we-serve'],
              ]),
              _footerColumn('Company', const [
                ['About SEIS', '/about'],
                ['System Security', '/contact'],
                ['Documentation', '/contact'],
                ['Contact Support', '/contact'],
              ]),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(color: Colors.white12),
          const SizedBox(height: 12),
          const Text(
            '© SEIS Platform. All rights reserved.',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 11),
          ),
        ],
      ),
    );
  }

  Widget _footerColumn(String title, List<List<String>> links) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13),
        ),
        const SizedBox(height: 8),
        ...links.map(
          (link) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 3),
            child: Text(
              link[0],
              style: const TextStyle(color: Color(0xFF9FB2C7), fontSize: 12),
            ),
          ),
        ),
      ],
    );
  }
}

class HomeScreen extends StatelessWidget {
  final SeisNavigate onNavigate;

  const HomeScreen({super.key, required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.zero,
      children: [
        _hero(context),
        _stats(),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
          child: Column(
            children: [
              const SeisSectionHeading(
                eyebrow: 'CORE FEATURES',
                title: 'Built for Uncompromising Electoral Integrity',
                subtitle: 'Our platform combines cryptographic verification with intuitive user controls.',
              ),
              const SizedBox(height: 20),
              const SeisGrid(
                children: [
                  FeatureTile(
                    icon: Icons.lock_outline,
                    title: 'Cryptographic Verification',
                    description: 'Every vote is mathematically sealed and auditable without compromising ballot privacy.',
                  ),
                  FeatureTile(
                    icon: Icons.fingerprint,
                    title: 'Biometric Voter Auth',
                    description: 'Multi-factor identification ensures only registered citizens cast a single ballot.',
                  ),
                  FeatureTile(
                    icon: Icons.insert_chart_outlined,
                    title: 'Real-time Tallying',
                    description: 'Automated precinct aggregation provides immediate, verifiable results.',
                  ),
                ],
              ),
              const SizedBox(height: 36),
              const SeisSectionHeading(
                eyebrow: 'WORKFLOW',
                title: 'How SEIS Ensures Fair Results',
              ),
              const SizedBox(height: 20),
              const SeisGrid(
                minTileWidth: 180,
                children: [
                  _StepCard(number: '01', title: 'Voter Registration', text: 'Citizens verify identity through secure biometric channels.', icon: Icons.how_to_reg_outlined),
                  _StepCard(number: '02', title: 'Ballot Casting', text: 'Encrypted choices are processed with instantaneous hashes.', icon: Icons.lock_outline),
                  _StepCard(number: '03', title: 'Audit & Verification', text: 'Independent observers validate hashes across distributed nodes.', icon: Icons.verified_outlined),
                  _StepCard(number: '04', title: 'Public Reporting', text: 'Final results are published transparently on the dashboard.', icon: Icons.bar_chart),
                ],
              ),
              const SizedBox(height: 36),
              const SeisSectionHeading(
                eyebrow: 'STAKEHOLDERS',
                title: 'Designed for Every Participant',
                subtitle: 'SEIS serves commissions, citizens and observers across the electoral process.',
              ),
              const SizedBox(height: 20),
              const SeisGrid(
                children: [
                  FeatureTile(
                    icon: Icons.account_balance_outlined,
                    title: 'Electoral Commissions',
                    description: 'Comprehensive oversight tools and live monitoring dashboards for administrators.',
                  ),
                  FeatureTile(
                    icon: Icons.how_to_vote_outlined,
                    title: 'Citizens & Voters',
                    description: 'Easy-to-use digital tools with receipt verification to confirm votes are counted.',
                  ),
                  FeatureTile(
                    icon: Icons.visibility_outlined,
                    title: 'International Observers',
                    description: 'Open access channels for independent auditing bodies and civil rights organizations.',
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _hero(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [SeisColors.navy950, SeisColors.forest900],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: const EdgeInsets.fromLTRB(20, 42, 20, 64),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0x1A20C77A),
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: const Color(0x404ADE80)),
            ),
            child: const Text(
              'TRUSTED. TRANSPARENT. VERIFIABLE.',
              style: TextStyle(color: SeisColors.green400, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1),
            ),
          ),
          const SizedBox(height: 18),
          const Text(
            'Smart Electoral\nIntegrity System',
            style: TextStyle(color: Colors.white, fontSize: 40, height: 1.05, fontWeight: FontWeight.w800, letterSpacing: -1.5),
          ),
          const SizedBox(height: 16),
          const Text(
            'A secure demonstration platform that showcases transparent, verifiable and trustworthy digital elections.',
            style: TextStyle(color: Color(0xFFAEBFD1), fontSize: 15, height: 1.7),
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              SizedBox(
                width: 170,
                child: SeisPrimaryButton(
                  label: 'Get Started',
                  icon: Icons.arrow_forward,
                  onPressed: () => onNavigate('/signup'),
                ),
              ),
              SizedBox(
                width: 170,
                child: SeisOutlineButton(
                  label: 'Learn More',
                  icon: Icons.arrow_forward,
                  light: true,
                  onPressed: () => onNavigate('/about'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          _dashboardPreview(),
        ],
      ),
    );
  }

  Widget _dashboardPreview() {
    return Container(
      decoration: BoxDecoration(
        color: SeisColors.navy900,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x22FFFFFF)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Row(
        children: [
          Container(
            width: 90,
            color: const Color(0xFF071426),
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(
              children: const [
                Icon(Icons.fingerprint, color: SeisColors.green400, size: 20),
                SizedBox(height: 8),
                Text('SEIS', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
                SizedBox(height: 12),
                Icon(Icons.dashboard, color: Colors.white54, size: 14),
                SizedBox(height: 8),
                Icon(Icons.people_outline, color: Colors.white54, size: 14),
                SizedBox(height: 8),
                Icon(Icons.how_to_vote_outlined, color: Colors.white54, size: 14),
                SizedBox(height: 8),
                Icon(Icons.location_on_outlined, color: Colors.white54, size: 14),
              ],
            ),
          ),
          const Expanded(
            child: Padding(
              padding: EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Welcome, Election Official', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12)),
                  SizedBox(height: 3),
                  Text('General overview of the election', style: TextStyle(color: Colors.white54, fontSize: 9)),
                  SizedBox(height: 12),
                  SeisGrid(
                    minTileWidth: 70,
                    spacing: 6,
                    children: [
                      _PreviewStat(label: 'Registered Voters', value: '2.5M+'),
                      _PreviewStat(label: 'Candidates', value: '18'),
                      _PreviewStat(label: 'Polling Stations', value: '1,250'),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _stats() {
    return Transform.translate(
      offset: const Offset(0, -24),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 18),
        child: SeisCard(
          child: SeisGrid(
            minTileWidth: 130,
            children: const [
              _HeroStat(icon: Icons.people_outline, value: '2.5M+', label: 'Registered Voters'),
              _HeroStat(icon: Icons.person_outline, value: '18', label: 'Candidates'),
              _HeroStat(icon: Icons.location_on_outlined, value: '1,250', label: 'Polling Stations'),
              _HeroStat(icon: Icons.schedule, value: '99.9%', label: 'System Uptime'),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeroStat extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;

  const _HeroStat({required this.icon, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: const BoxDecoration(color: Color(0xFFEAFBF2), shape: BoxShape.circle),
          child: Icon(icon, color: SeisColors.green600, size: 18),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: SeisColors.navy900)),
              Text(label, style: const TextStyle(fontSize: 10, color: SeisColors.slate500)),
            ],
          ),
        ),
      ],
    );
  }
}

class _PreviewStat extends StatelessWidget {
  final String label;
  final String value;

  const _PreviewStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: SeisColors.slate50,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 7, color: SeisColors.slate500)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
        ],
      ),
    );
  }
}

class _StepCard extends StatelessWidget {
  final String number;
  final String title;
  final String text;
  final IconData icon;

  const _StepCard({required this.number, required this.title, required this.text, required this.icon});

  @override
  Widget build(BuildContext context) {
    return SeisCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(number, style: const TextStyle(color: SeisColors.gold500, fontSize: 22, fontWeight: FontWeight.w800)),
              const Spacer(),
              Icon(icon, color: SeisColors.green600),
            ],
          ),
          const SizedBox(height: 10),
          Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
          const SizedBox(height: 6),
          Text(text, style: const TextStyle(fontSize: 12, color: SeisColors.slate500, height: 1.5)),
        ],
      ),
    );
  }
}

class AboutScreen extends StatelessWidget {
  final SeisNavigate onNavigate;

  const AboutScreen({super.key, required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    const stakeholders = [
      ('Voters', 'Real-time access to verified election details, polling stations and result tracking.', Icons.people_outline),
      ('Candidates', 'A fair, transparent playing field with monitoring and immutable audit logging.', Icons.how_to_vote_outlined),
      ('Election Officials', 'Digital management workflows, secure registration and seamless validation.', Icons.admin_panel_settings_outlined),
      ('Observers', 'Independent audit access and transparent metrics to evaluate compliance.', Icons.search_outlined),
    ];

    return ListView(
      padding: EdgeInsets.zero,
      children: [
        _pageHero(
          eyebrow: 'ABOUT SEIS',
          title: 'Building Trust in Every Vote',
          description: 'SEIS is designed to ensure transparency, security and accountability in every stage of the electoral process.',
        ),
        Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              SeisGrid(
                children: [
                  SeisCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        StatusChip(label: 'Our Mission', tone: StatusTone.success),
                        SizedBox(height: 10),
                        Text('Fostering Digital Trust', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                        SizedBox(height: 8),
                        Text('Provide a secure, transparent, trustworthy and verifiable digital election experience that guarantees every vote counts and can be audited independently.', style: TextStyle(color: SeisColors.slate500, fontSize: 13, height: 1.6)),
                      ],
                    ),
                  ),
                  SeisCard(
                    color: SeisColors.forest900,
                    border: Border.all(color: SeisColors.forest900),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        StatusChip(label: 'Our Vision'),
                        SizedBox(height: 10),
                        Text('Standardizing Electoral Integrity', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
                        SizedBox(height: 8),
                        Text('An electoral process where voters, candidates, officials and observers can confidently access reliable and verifiable information.', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, height: 1.6)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              const SeisSectionHeading(eyebrow: 'OUR FOUNDATION', title: 'Our Core Values'),
              const SizedBox(height: 16),
              const SeisGrid(
                children: [
                  FeatureTile(icon: Icons.visibility_outlined, title: 'Transparency', description: 'Promote openness and make election information understandable and verifiable.'),
                  FeatureTile(icon: Icons.shield_outlined, title: 'Security', description: 'Protect election information and provide secure access throughout the process.'),
                  FeatureTile(icon: Icons.description_outlined, title: 'Accountability', description: 'Maintain records and audit information stakeholders can verify.'),
                  FeatureTile(icon: Icons.verified_outlined, title: 'Integrity', description: 'Support trustworthy processes based on accurate and reliable information.'),
                  FeatureTile(icon: Icons.public_outlined, title: 'Accessibility', description: 'Make important election information accessible to every stakeholder.'),
                  FeatureTile(icon: Icons.check_circle_outline, title: 'Trust', description: 'Build confidence through secure systems and verifiable information.'),
                ],
              ),
              const SizedBox(height: 32),
              const SeisSectionHeading(eyebrow: 'INCLUSIVE SOLUTION', title: 'Built for Every Electoral Stakeholder'),
              const SizedBox(height: 16),
              SeisGrid(
                children: [
                  for (final item in stakeholders)
                    FeatureTile(icon: item.$3, title: item.$1, description: item.$2),
                ],
              ),
              const SizedBox(height: 28),
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: SeisColors.forest900,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Ready to Build Trust in Every Vote?',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Explore SEIS and discover how secure, transparent and verifiable digital election technology can support the electoral process.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13),
                    ),
                    const SizedBox(height: 18),
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: [
                        SizedBox(
                          width: 180,
                          child: SeisOutlineButton(
                            label: 'Explore Features',
                            light: true,
                            onPressed: () => onNavigate('/features'),
                          ),
                        ),
                        SizedBox(
                          width: 180,
                          child: SeisPrimaryButton(
                            label: 'Contact Us',
                            onPressed: () => onNavigate('/contact'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class FeaturesScreen extends StatelessWidget {
  final SeisNavigate onNavigate;

  const FeaturesScreen({super.key, required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    const features = [
      ('Secure Voting', 'SEIS demonstrates how secure digital voting can protect election information through controlled access and secure data handling.', Icons.lock_outline),
      ('Identity Verification', 'Identity verification workflows ensure only authorized participants can access election services.', Icons.verified_user_outlined),
      ('Transparent Results', 'Election information can be monitored and presented in a clear format to support transparency and accountability.', Icons.bar_chart),
      ('Candidate Dashboard', 'Candidates can access relevant election information through a centralized dashboard.', Icons.how_to_vote_outlined),
      ('Security & Integrity', 'Security controls, access management and audit records help demonstrate how election information is protected.', Icons.shield_outlined),
      ('Reports & Analytics', 'Administrators can use reports and statistics to understand election activity and monitor important information.', Icons.description_outlined),
    ];

    return ListView(
      padding: EdgeInsets.zero,
      children: [
        _pageHero(
          eyebrow: 'ELECTION FEATURES',
          title: 'Powerful Features for Election Integrity',
          description: 'Explore the security, transparency and verification features demonstrated by SEIS.',
        ),
        Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SeisSectionHeading(eyebrow: 'SEIS CAPABILITIES', title: 'Built Around Trust'),
              const SizedBox(height: 18),
              SeisGrid(
                children: [
                  for (final feature in features)
                    FeatureTile(icon: feature.$3, title: feature.$1, description: feature.$2),
                ],
              ),
              const SizedBox(height: 24),
              Center(
                child: SizedBox(
                  width: 220,
                  child: SeisPrimaryButton(
                    label: 'Get Started',
                    icon: Icons.arrow_forward,
                    onPressed: () => onNavigate('/signup'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class HowItWorksScreen extends StatelessWidget {
  const HowItWorksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const steps = [
      ('01', 'Register', 'Eligible voters are securely registered within the election system.', Icons.how_to_reg_outlined),
      ('02', 'Authenticate', 'The system verifies the identity and authorization of the user.', Icons.shield_outlined),
      ('03', 'Cast Vote', 'An authorized voter securely participates in the voting process.', Icons.check_circle_outline),
      ('04', 'Verify', 'Election information passes through verification and integrity checks.', Icons.description_outlined),
    ];

    return ListView(
      padding: EdgeInsets.zero,
      children: [
        _pageHero(
          eyebrow: 'HOW IT WORKS',
          title: 'A Transparent Election Process',
          description: 'Follow the SEIS demonstration workflow from voter registration to election information verification.',
        ),
        Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SeisSectionHeading(eyebrow: 'THE WORKFLOW', title: 'From Registration to Verification'),
              const SizedBox(height: 18),
              SeisGrid(
                minTileWidth: 180,
                children: [
                  for (final step in steps)
                    _StepCard(number: step.$1, title: step.$2, text: step.$3, icon: step.$4),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class WhoWeServeScreen extends StatelessWidget {
  const WhoWeServeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const groups = [
      ('Voters', 'Secure and transparent access to electoral information.', Icons.people_outline),
      ('Election Officials', 'Reliable tools for managing secure electoral processes.', Icons.admin_panel_settings_outlined),
      ('Candidates', 'A transparent environment where candidates participate with confidence.', Icons.how_to_vote_outlined),
      ('Election Observers', 'Independent observation and verification throughout the process.', Icons.search_outlined),
      ('Political Parties', 'A fair, transparent and accountable electoral system.', Icons.flag_outlined),
      ('Civil Society', 'Trustworthy electoral information and insights.', Icons.description_outlined),
    ];

    return ListView(
      padding: EdgeInsets.zero,
      children: [
        _pageHero(
          eyebrow: 'WHO WE SERVE',
          title: 'Built for Everyone in the Electoral Ecosystem',
          description: 'SEIS connects the people and institutions that make elections transparent, secure and trustworthy.',
        ),
        Padding(
          padding: const EdgeInsets.all(20),
          child: SeisGrid(
            children: [
              for (final group in groups)
                FeatureTile(icon: group.$3, title: group.$1, description: group.$2),
            ],
          ),
        ),
      ],
    );
  }
}

Widget _pageHero({
  required String eyebrow,
  required String title,
  required String description,
}) {
  return Container(
    width: double.infinity,
    padding: const EdgeInsets.fromLTRB(20, 38, 20, 42),
    decoration: const BoxDecoration(
      gradient: LinearGradient(
        colors: [SeisColors.navy950, SeisColors.navy800],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          eyebrow.toUpperCase(),
          style: const TextStyle(color: SeisColors.green400, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.4),
        ),
        const SizedBox(height: 12),
        Text(
          title,
          style: const TextStyle(color: Colors.white, fontSize: 34, height: 1.1, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 12),
        Text(
          description,
          style: const TextStyle(color: Color(0xFFAEBFD1), fontSize: 14, height: 1.7),
        ),
      ],
    ),
  );
}

class LoginScreen extends StatefulWidget {
  final SeisNavigate onNavigate;
  final void Function(Map<String, dynamic>? user) onAuthenticated;

  const LoginScreen({
    super.key,
    required this.onNavigate,
    required this.onAuthenticated,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await ApiService.login(
        email: _email.text,
        password: _password.text,
      );
      final token = result['token']?.toString();
      if (token == null || token.isEmpty) {
        throw const ApiException('Login did not return a session token.');
      }
      final user = result['user'] is Map<String, dynamic>
          ? result['user'] as Map<String, dynamic>
          : <String, dynamic>{'email': _email.text.trim().toLowerCase()};
      await ApiService.saveSession(token, user);
      if (!mounted) return;
      widget.onAuthenticated(user);
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const SeisSectionHeading(
          eyebrow: 'SEIS ACCESS',
          title: 'Secure Portal Access',
          subtitle: 'Access the SEIS demonstration platform to view system features and verification workflows.',
        ),
        const SizedBox(height: 20),
        SeisCard(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Login', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                const SizedBox(height: 4),
                const Text('Access the SEIS demonstration platform.', style: TextStyle(color: SeisColors.slate500, fontSize: 13)),
                const SizedBox(height: 18),
                if (_error != null) ...[
                  SeisBanner(message: _error!, isError: true),
                  const SizedBox(height: 12),
                ],
                TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email Address',
                    prefixIcon: Icon(Icons.mail_outline),
                  ),
                  validator: (value) => value != null && value.contains('@') ? null : 'Enter a valid email',
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _password,
                  obscureText: _obscure,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    prefixIcon: const Icon(Icons.key_outlined),
                    suffixIcon: IconButton(
                      icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                      onPressed: () => setState(() => _obscure = !_obscure),
                    ),
                  ),
                  validator: (value) => value != null && value.isNotEmpty ? null : 'Enter your password',
                ),
                const SizedBox(height: 18),
                SeisPrimaryButton(label: 'Login', icon: Icons.arrow_forward, loading: _loading, onPressed: _submit),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => widget.onNavigate('/register'),
                  child: const Text('No account? Create account'),
                ),
                const SizedBox(height: 8),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.shield_outlined, size: 16, color: SeisColors.slate500),
                    SizedBox(width: 6),
                    Text('256-bit SSL Encrypted Connection', style: TextStyle(color: SeisColors.slate500, fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class SignupScreen extends StatefulWidget {
  final SeisNavigate onNavigate;
  final void Function(Map<String, dynamic>? user) onAuthenticated;

  const SignupScreen({
    super.key,
    required this.onNavigate,
    required this.onAuthenticated,
  });

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  bool _isLogin = false;
  bool _obscure = true;
  bool _loading = false;
  String? _status;
  bool _error = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  int get _strength {
    final value = _password.text;
    if (value.isEmpty) return 0;
    var score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (RegExp(r'[A-Z]').hasMatch(value)) score++;
    if (RegExp(r'[0-9]').hasMatch(value)) score++;
    if (RegExp(r'[^A-Za-z0-9]').hasMatch(value)) score++;
    if (score <= 2) return 1;
    if (score <= 3) return 2;
    if (score <= 4) return 3;
    return 4;
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _loading = true;
      _status = null;
      _error = false;
    });
    try {
      if (_isLogin) {
        final result = await ApiService.login(email: _email.text, password: _password.text);
        final token = result['token']?.toString();
        if (token == null || token.isEmpty) {
          throw const ApiException('Login did not return a session token.');
        }
        final user = result['user'] is Map<String, dynamic>
            ? result['user'] as Map<String, dynamic>
            : <String, dynamic>{'email': _email.text.trim().toLowerCase()};
        await ApiService.saveSession(token, user);
        widget.onAuthenticated(user);
      } else {
        if (_password.text != _confirm.text) {
          setState(() {
            _status = "Passwords don't match!";
            _error = true;
            _loading = false;
          });
          return;
        }
        if (_password.text.length < 8) {
          setState(() {
            _status = 'Password must be at least 8 characters!';
            _error = true;
            _loading = false;
          });
          return;
        }
        final result = await ApiService.register(
          name: _name.text,
          email: _email.text,
          password: _password.text,
        );
        final token = result['token']?.toString();
        if (token != null && token.isNotEmpty) {
          final user = result['user'] is Map<String, dynamic>
              ? result['user'] as Map<String, dynamic>
              : <String, dynamic>{'email': _email.text.trim().toLowerCase(), 'role': 'citizen'};
          await ApiService.saveSession(token, user);
          widget.onAuthenticated(user);
        } else {
          setState(() {
            _isLogin = true;
            _status = 'Account created successfully! Please sign in.';
          });
        }
      }
    } catch (error) {
      setState(() {
        _status = error.toString().replaceFirst('Exception: ', '');
        _error = true;
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final strength = _strength;
    final strengthColor = switch (strength) {
      1 => SeisColors.danger,
      2 => SeisColors.warning,
      3 => SeisColors.info,
      4 => SeisColors.green600,
      _ => SeisColors.slate200,
    };

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520),
        child: ListView(
          padding: const EdgeInsets.all(20),
          shrinkWrap: true,
          children: [
            SeisCard(
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Center(child: Icon(Icons.fingerprint, color: SeisColors.green600, size: 42)),
                    const SizedBox(height: 12),
                    Text(
                      _isLogin ? 'Welcome Back' : 'Create an Account',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: SeisColors.navy900),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _isLogin ? 'Access your election dashboard' : 'Join the Smart Electoral Integrity System',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 13, color: SeisColors.slate500),
                    ),
                    const SizedBox(height: 18),
                    if (_status != null) ...[
                      SeisBanner(message: _status!, isError: _error),
                      const SizedBox(height: 12),
                    ],
                    if (!_isLogin)
                      TextFormField(
                        controller: _name,
                        decoration: const InputDecoration(labelText: 'Full Name', hintText: 'Jane Doe', prefixIcon: Icon(Icons.person_outline)),
                        validator: (value) => value != null && value.trim().isNotEmpty ? null : 'Enter your full name',
                      ),
                    if (!_isLogin) const SizedBox(height: 14),
                    TextFormField(
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(labelText: 'Email Address', hintText: 'official@seis.gov', prefixIcon: Icon(Icons.mail_outline)),
                      validator: (value) => value != null && value.contains('@') ? null : 'Enter a valid email',
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _password,
                      obscureText: _obscure,
                      decoration: InputDecoration(
                        labelText: 'Password',
                        hintText: '••••••••',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                          onPressed: () => setState(() => _obscure = !_obscure),
                        ),
                      ),
                      validator: (value) => value != null && value.isNotEmpty ? null : 'Enter your password',
                    ),
                    if (!_isLogin) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          for (var i = 0; i < 4; i++)
                            Expanded(
                              child: Container(
                                margin: const EdgeInsets.only(right: 5),
                                height: 6,
                                decoration: BoxDecoration(
                                  color: i < strength ? strengthColor : SeisColors.slate200,
                                  borderRadius: BorderRadius.circular(999),
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _password.text.isEmpty ? 'Create a strong password' : 'Password strength: ${switch (strength) {1 => 'Weak', 2 => 'Fair', 3 => 'Good', _ => 'Strong'}}',
                        style: TextStyle(color: strengthColor, fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                    ],
                    if (!_isLogin) ...[
                      const SizedBox(height: 14),
                      TextFormField(
                        controller: _confirm,
                        obscureText: true,
                        decoration: const InputDecoration(labelText: 'Confirm Password', hintText: '••••••••', prefixIcon: Icon(Icons.lock_outline)),
                        validator: (value) => value != null && value.isNotEmpty ? null : 'Confirm your password',
                      ),
                    ],
                    const SizedBox(height: 18),
                    SeisPrimaryButton(
                      label: _loading ? 'Processing...' : _isLogin ? 'Sign In' : 'Create Account',
                      loading: _loading,
                      onPressed: _submit,
                    ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () => setState(() {
                        _isLogin = !_isLogin;
                        _status = null;
                      }),
                      child: Text(_isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class RegisterScreen extends StatefulWidget {
  final SeisNavigate onNavigate;
  final void Function(Map<String, dynamic>? user) onAuthenticated;

  const RegisterScreen({
    super.key,
    required this.onNavigate,
    required this.onAuthenticated,
  });

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  String _role = 'citizen';
  bool _obscure = true;
  bool _loading = false;
  String? _error;
  String? _message;

  static const roles = [
    ('citizen', 'Citizen / Voter'),
    ('observer', 'Election Observer'),
    ('candidate', 'Candidate'),
    ('presiding_officer', 'Presiding Officer'),
    ('returning_officer', 'Returning Officer'),
    ('election_administrator', 'Election Administrator'),
  ];

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    if (_password.text != _confirm.text) {
      setState(() => _error = 'Passwords do not match');
      return;
    }
    if (_password.text.length < 8) {
      setState(() => _error = 'Password must be at least 8 characters');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
      _message = null;
    });
    try {
      final result = await ApiService.register(
        name: _name.text,
        email: _email.text,
        password: _password.text,
        role: _role,
      );
      final token = result['token']?.toString();
      if (token != null && token.isNotEmpty) {
        final user = result['user'] is Map<String, dynamic>
            ? result['user'] as Map<String, dynamic>
            : <String, dynamic>{
                'full_name': _name.text.trim(),
                'email': _email.text.trim().toLowerCase(),
                'role': _role,
              };
        await ApiService.saveSession(token, user);
        widget.onAuthenticated(user);
      } else {
        setState(() {
          _message = 'Account created! Sign in to continue.';
          _role = 'citizen';
        });
        widget.onNavigate('/login');
      }
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const SeisSectionHeading(
          eyebrow: 'CREATE ACCOUNT',
          title: 'Join SEIS',
          subtitle: 'Create your secure account to access transparent, verifiable election services.',
        ),
        const SizedBox(height: 20),
        SeisCard(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Create account', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                const SizedBox(height: 4),
                const Text('Enter your credentials to get started.', style: TextStyle(color: SeisColors.slate500, fontSize: 13)),
                const SizedBox(height: 18),
                if (_error != null) ...[
                  SeisBanner(message: _error!, isError: true),
                  const SizedBox(height: 12),
                ],
                if (_message != null) ...[
                  SeisBanner(message: _message!),
                  const SizedBox(height: 12),
                ],
                TextFormField(
                  controller: _name,
                  decoration: const InputDecoration(labelText: 'Full Name', prefixIcon: Icon(Icons.person_outline)),
                  validator: (value) => value != null && value.trim().isNotEmpty ? null : 'Enter your full name',
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email Address', prefixIcon: Icon(Icons.mail_outline)),
                  validator: (value) => value != null && value.contains('@') ? null : 'Enter a valid email',
                ),
                const SizedBox(height: 14),
                DropdownButtonFormField<String>(
                  initialValue: _role,
                  decoration: const InputDecoration(labelText: 'Role', prefixIcon: Icon(Icons.shield_outlined)),
                  items: [
                    for (final role in roles)
                      DropdownMenuItem(value: role.$1, child: Text(role.$2)),
                  ],
                  onChanged: (value) => setState(() => _role = value ?? 'citizen'),
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _password,
                  obscureText: _obscure,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                      onPressed: () => setState(() => _obscure = !_obscure),
                    ),
                  ),
                  validator: (value) => value != null && value.length >= 8 ? null : 'Minimum 8 characters',
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _confirm,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Confirm Password', prefixIcon: Icon(Icons.lock_outline)),
                  validator: (value) => value != null && value.isNotEmpty ? null : 'Confirm your password',
                ),
                const SizedBox(height: 16),
                SeisPrimaryButton(label: 'Create Account', icon: Icons.arrow_forward, loading: _loading, onPressed: _submit),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => widget.onNavigate('/login'),
                  child: const Text('Already have an account? Sign in'),
                ),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.shield_outlined, size: 16, color: SeisColors.slate500),
                    SizedBox(width: 6),
                    Text('Credentials protected with bcrypt hashing.', style: TextStyle(color: SeisColors.slate500, fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});

  @override
  State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _subject = TextEditingController();
  final _message = TextEditingController();
  bool _sending = false;
  String? _status;
  bool _error = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _subject.dispose();
    _message.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _sending = true;
      _status = null;
    });
    try {
      await ApiService.sendContactMessage(
        name: _name.text,
        email: _email.text,
        subject: _subject.text,
        message: _message.text,
      );
      _name.clear();
      _email.clear();
      _subject.clear();
      _message.clear();
      setState(() => _status = 'Thank you — your message has been received.');
    } catch (error) {
      setState(() {
        _status = error.toString().replaceFirst('Exception: ', '');
        _error = true;
      });
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.zero,
      children: [
        _pageHero(
          eyebrow: 'CONTACT SEIS',
          title: 'Have Questions About SEIS?',
          description: 'Get in touch to learn more about the Smart Electoral Integrity System demonstration platform.',
        ),
        Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              SeisCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    SeisSectionHeading(eyebrow: 'GET IN TOUCH', title: "Let's Talk"),
                    SizedBox(height: 12),
                    InfoRow(label: 'Email', value: 'otienomodesta505@gmail.com', icon: Icons.mail_outline),
                    InfoRow(label: 'Phone', value: '+254 727 822 752', icon: Icons.phone_outlined),
                    InfoRow(label: 'Location', value: 'Kenya', icon: Icons.location_on_outlined),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              SeisCard(
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text('Send us a message', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
                      const SizedBox(height: 4),
                      const Text('Have a question or want to learn more about SEIS? Send us a message.', style: TextStyle(fontSize: 13, color: SeisColors.slate500)),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _name,
                        decoration: const InputDecoration(labelText: 'Your Name', hintText: 'Enter your name'),
                        validator: (value) => value != null && value.trim().isNotEmpty ? null : 'Enter your name',
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _email,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(labelText: 'Email Address', hintText: 'Enter your email'),
                        validator: (value) => value != null && value.contains('@') ? null : 'Enter a valid email',
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _subject,
                        decoration: const InputDecoration(labelText: 'Subject', hintText: 'What would you like to ask?'),
                        validator: (value) => value != null && value.trim().isNotEmpty ? null : 'Enter a subject',
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _message,
                        maxLines: 6,
                        decoration: const InputDecoration(labelText: 'Message', hintText: 'Write your message here...'),
                        validator: (value) => value != null && value.trim().length >= 10 ? null : 'Message must be at least 10 characters',
                      ),
                      if (_status != null) ...[
                        const SizedBox(height: 12),
                        SeisBanner(message: _status!, isError: _error),
                      ],
                      const SizedBox(height: 16),
                      SeisPrimaryButton(label: 'Send Message', icon: Icons.arrow_forward, loading: _sending, onPressed: _submit),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class LiveStreamScreen extends StatefulWidget {
  const LiveStreamScreen({super.key});

  @override
  State<LiveStreamScreen> createState() => _LiveStreamScreenState();
}

class _LiveStreamScreenState extends State<LiveStreamScreen> {
  List<dynamic> _elections = [];
  List<dynamic> _results = [];
  List<dynamic> _totals = [];
  String? _selectedElectionId;
  String _message = 'Waiting for voting to begin';
  bool _live = false;
  bool _loading = true;
  Timer? _timer;
  DateTime _updated = DateTime.now();
  late final LiveUpdateManager _manager;

  @override
  void initState() {
    super.initState();
    _manager = LiveUpdateManager();
    _manager.on('connected', (_) {
      if (!mounted) return;
      setState(() {
        _live = true;
        _message = 'Live stream connected';
      });
      _subscribeAll();
    });
    _manager.on('disconnected', (_) {
      if (!mounted) return;
      setState(() {
        _live = false;
        _message = 'Connection paused — polling for the latest results';
      });
    });
    _manager.on('result_update', (_) => _refresh());
    _manager.on('tally_update', (_) => _refresh());
    _load();
    _manager.connect().catchError((_) {
      if (!mounted) return;
      setState(() {
        _live = false;
        _message = 'WebSocket unavailable — using polling updates';
      });
    });
    _timer = Timer.periodic(const Duration(seconds: 10), (_) {
      if (!_manager.isConnected()) _refresh();
    });
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

  void _subscribeAll() {
    if (!_manager.isConnected()) return;
    for (final election in _elections) {
      final id = election['id'];
      if (id != null) _manager.subscribe(id);
    }
  }

  Future<void> _load({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);
    try {
      final electionsResult = await ApiService.getElections();
      final results = await ApiService.getResults(page: 1, limit: 200);
      final electionItems = electionsResult.items;
      final rows = results.results.items;
      final totals = results.totals.isNotEmpty ? results.totals : _aggregate(rows);
      if (!mounted) return;
      setState(() {
        _elections = electionItems;
        _results = rows;
        _totals = totals;
        _updated = DateTime.now();
        _loading = false;
        _message = totals.isEmpty
            ? 'Votes are coming in — results will appear here soon'
            : 'Live election counts are updating in real time';
        if (_selectedElectionId == null && electionItems.isNotEmpty) {
          final active = electionItems.firstWhere(
            (item) => ['active', 'ongoing', 'open'].contains(item['status']?.toString()),
            orElse: () => electionItems.first,
          );
          _selectedElectionId = active['id']?.toString();
        }
      });
      _subscribeAll();
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _live = _manager.isConnected();
        _message = 'Live stream data is temporarily unavailable';
      });
    }
  }

  List<dynamic> _aggregate(List<dynamic> rows) {
    final totals = <String, Map<String, dynamic>>{};
    for (final row in rows) {
      final name = row['candidate']?.toString() ?? row['full_name']?.toString() ?? 'Unknown Candidate';
      final votes = int.tryParse(row['votes']?.toString() ?? '') ?? 0;
      totals.putIfAbsent(name, () => {'candidate': name, 'total_votes': 0});
      totals[name]!['total_votes'] = (totals[name]!['total_votes'] as int) + votes;
    }
    final list = totals.values.toList();
    list.sort((a, b) => (b['total_votes'] as int).compareTo(a['total_votes'] as int));
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final sorted = [..._totals]..sort(
      (a, b) => (int.tryParse(b['total_votes']?.toString() ?? '') ?? 0)
          .compareTo(int.tryParse(a['total_votes']?.toString() ?? '') ?? 0),
    );
    final totalVotes = _results.fold<int>(
      0,
      (sum, row) => sum + (int.tryParse(row['votes']?.toString() ?? '') ?? 0),
    );
    final leader = sorted.isEmpty ? null : sorted.first;
    final activeElection = _elections.firstWhere(
      (item) => item['id']?.toString() == _selectedElectionId,
      orElse: () => _elections.isEmpty ? <String, dynamic>{} : _elections.first,
    );

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            color: SeisColors.forest800,
            borderRadius: BorderRadius.circular(22),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const StatusChip(label: 'LIVE ELECTION STREAM', tone: StatusTone.success),
              const SizedBox(height: 14),
              Text(
                activeElection['name']?.toString() ?? 'Student Representative Election Live Results',
                style: const TextStyle(color: Colors.white, fontSize: 28, height: 1.15, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 10),
              const Text(
                'A public, real-time election stream for students and the wider community to follow the vote count, monitor live tallies, and stay informed as body representatives are confirmed.',
                style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, height: 1.7),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  StatusChip(
                    label: _live ? '● Live' : '● Syncing',
                    tone: _live ? StatusTone.success : StatusTone.warning,
                  ),
                  Text(
                    'Updated ${_updated.hour.toString().padLeft(2, '0')}:${_updated.minute.toString().padLeft(2, '0')}:${_updated.second.toString().padLeft(2, '0')}',
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SeisCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Live status', style: TextStyle(color: SeisColors.slate500, fontSize: 12, letterSpacing: 1.2)),
              const SizedBox(height: 8),
              Text(_message, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
              const SizedBox(height: 12),
              InfoRow(label: 'Votes counted', value: totalVotes.toString()),
              InfoRow(label: 'Leading candidate', value: leader?['candidate']?.toString() ?? 'Awaiting results'),
              InfoRow(label: 'Participation', value: '${_elections.length} election stream(s)'),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SeisCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Live leaderboard', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
              const SizedBox(height: 10),
              if (_elections.isNotEmpty)
                DropdownButtonFormField<String>(
                  initialValue: _selectedElectionId,
                  decoration: const InputDecoration(labelText: 'Election'),
                  items: [
                    for (final election in _elections)
                      DropdownMenuItem<String>(
                        value: election['id']?.toString(),
                        child: Text(election['name']?.toString() ?? 'Election'),
                      ),
                  ],
                  onChanged: (value) => setState(() => _selectedElectionId = value),
                ),
              const SizedBox(height: 14),
              if (_loading)
                const Center(child: CircularProgressIndicator(color: SeisColors.green600))
              else if (sorted.isEmpty)
                const SeisEmptyState(
                  icon: Icons.bar_chart,
                  title: 'No vote totals yet',
                  subtitle: 'The stream will update when ballots are submitted.',
                )
              else
                SeisGrid(
                  minTileWidth: 180,
                  children: [
                    for (var i = 0; i < sorted.length; i++)
                      SeisCard(
                        color: i == 0 ? const Color(0xFFF0FDF4) : SeisColors.slate50,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text('RANK #${i + 1}', style: const TextStyle(fontSize: 10, color: SeisColors.slate500, letterSpacing: 1)),
                                const Spacer(),
                                if (i == 0) const StatusChip(label: 'Leading', tone: StatusTone.success),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              sorted[i]['candidate']?.toString() ?? 'Candidate',
                              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: SeisColors.navy900),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              sorted[i]['party']?.toString() ?? 'Student representative candidate',
                              style: const TextStyle(fontSize: 12, color: SeisColors.slate500),
                            ),
                            const SizedBox(height: 14),
                            Text(
                              '${sorted[i]['total_votes']?.toString() ?? '0'} votes',
                              style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w800, color: SeisColors.navy900),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SeisCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Recent result feed', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
              const SizedBox(height: 10),
              if (_results.isEmpty)
                const Text('No live results yet.', style: TextStyle(color: SeisColors.slate500))
              else
                ..._results.take(8).map(
                  (row) => InfoRow(
                    label: '${row['candidate'] ?? row['full_name'] ?? 'Candidate'} · ${row['station'] ?? 'Polling station'}',
                    value: '${row['votes'] ?? 0} · ${row['verified'] == true ? 'Verified' : 'Pending'}',
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class BiometricView extends StatefulWidget {
  final bool embedded;

  const BiometricView({super.key, this.embedded = false});

  @override
  State<BiometricView> createState() => _BiometricViewState();
}

class _BiometricViewState extends State<BiometricView> {
  String _mode = 'fingerprint';
  Map<String, dynamic>? _status;
  final _email = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  CameraController? _controller;
  Uint8List? _previewBytes;
  String? _capturedData;
  bool _cameraBusy = false;
  bool _loading = false;
  String? _cameraError;
  String? _error;
  String? _message;

  @override
  void initState() {
    super.initState();
    _loadStatus();
  }

  @override
  void dispose() {
    final controller = _controller;
    if (controller != null) unawaited(controller.dispose());
    _email.dispose();
    super.dispose();
  }

  Future<void> _loadStatus() async {
    try {
      final status = await ApiService.getBiometricStatus();
      if (mounted) setState(() => _status = status);
    } catch (_) {}
  }

  Future<void> _startCamera() async {
    if (_controller != null || _cameraBusy) return;
    setState(() {
      _cameraBusy = true;
      _cameraError = null;
    });
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        throw const ApiException('No camera is available on this device.');
      }
      final controller = CameraController(
        cameras.first,
        ResolutionPreset.medium,
        imageFormatGroup: ImageFormatGroup.jpeg,
      );
      await controller.initialize();
      if (!mounted) {
        await controller.dispose();
        return;
      }
      setState(() {
        _controller = controller;
        _cameraBusy = false;
        _cameraError = null;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _cameraBusy = false;
        _cameraError = 'Camera access denied or not available. Use file upload instead.';
      });
    }
  }

  Future<void> _stopCamera() async {
    final controller = _controller;
    if (controller == null) return;
    if (mounted) setState(() => _controller = null);
    await controller.dispose();
  }

  Future<void> _capture() async {
    final controller = _controller;
    if (controller == null || !controller.value.isInitialized) {
      setState(() => _cameraError = 'Start the camera before capturing.');
      return;
    }
    if (controller.value.isTakingPicture || _cameraBusy) return;
    setState(() => _cameraBusy = true);
    try {
      final file = await controller.takePicture();
      final bytes = await file.readAsBytes();
      final dataUrl = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      if (!mounted) return;
      setState(() {
        _capturedData = dataUrl;
        _previewBytes = bytes;
        _cameraBusy = false;
        _cameraError = null;
        _message = 'Photo captured';
      });
      await _stopCamera();
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _cameraBusy = false;
        _cameraError = error.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  Future<void> _uploadPhoto() async {
    final file = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (file == null) return;
    final bytes = await file.readAsBytes();
    final mime = file.mimeType ?? _mimeFor(file.path);
    final dataUrl = 'data:$mime;base64,${base64Encode(bytes)}';
    if (!mounted) return;
    setState(() {
      _capturedData = dataUrl;
      _previewBytes = bytes;
      _cameraError = null;
      _message = 'Photo uploaded';
    });
  }

  String _mimeFor(String path) {
    final value = path.toLowerCase();
    if (value.endsWith('.png')) return 'image/png';
    if (value.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg';
  }

  Future<void> _enroll() async {
    if (_capturedData == null || _capturedData!.isEmpty) {
      setState(() => _error = 'Please capture or upload a photo first.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
      _message = null;
    });
    try {
      final result = await ApiService.enrollBiometric(
        biometricType: _mode,
        biometricData: _capturedData!,
      );
      setState(() => _message = result['message']?.toString() ?? 'Biometric enrolled');
      await _loadStatus();
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _verify() async {
    if (_email.text.trim().isEmpty || _capturedData == null || _capturedData!.isEmpty) {
      setState(() => _error = 'Need email and a captured photo');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
      _message = null;
    });
    try {
      final result = await ApiService.verifyBiometric(
        email: _email.text,
        biometricData: _capturedData!,
      );
      setState(() => _message = result['verified'] == true ? 'Verified — biometric matches!' : 'Not verified');
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final enrolled = _status?['enrolled'] == true;
    return ListView(
      padding: EdgeInsets.all(widget.embedded ? 0 : 20),
      shrinkWrap: widget.embedded,
      physics: widget.embedded ? const NeverScrollableScrollPhysics() : null,
      children: [
        if (!widget.embedded)
          const SeisSectionHeading(
            eyebrow: 'SEIS BIOMETRIC',
            title: 'Biometric Identity — Fully Functional',
            subtitle: 'SEIS supports fingerprint, face and iris enrollment. Data is hashed with SHA-256 and never stored raw.',
          ),
        if (!widget.embedded) const SizedBox(height: 20),
        if (_status != null)
          SeisCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text('Your Biometric Status', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                    const Spacer(),
                    StatusChip(label: enrolled ? 'Enrolled' : 'Not Enrolled', tone: enrolled ? StatusTone.success : StatusTone.warning),
                  ],
                ),
                const SizedBox(height: 8),
                InfoRow(label: 'Type', value: _status?['biometric_type']?.toString() ?? 'none'),
                InfoRow(label: 'Hash', value: _status?['hash_preview']?.toString() ?? '—'),
                if (_status?['enrolled_at'] != null)
                  InfoRow(label: 'Enrolled at', value: _status!['enrolled_at'].toString()),
              ],
            ),
          ),
        const SizedBox(height: 16),
        SeisCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Capture Biometric', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: SeisColors.navy900)),
              const SizedBox(height: 12),
              SeisGrid(
                minTileWidth: 130,
                children: [
                  _ModeChip(
                    label: 'Fingerprint',
                    value: 'fingerprint',
                    icon: Icons.fingerprint,
                    selected: _mode,
                    onTap: () => setState(() => _mode = 'fingerprint'),
                  ),
                  _ModeChip(
                    label: 'Face Recognition',
                    value: 'face',
                    icon: Icons.face_outlined,
                    selected: _mode,
                    onTap: () => setState(() => _mode = 'face'),
                  ),
                  _ModeChip(
                    label: 'Iris Scan',
                    value: 'iris',
                    icon: Icons.visibility_outlined,
                    selected: _mode,
                    onTap: () => setState(() => _mode = 'iris'),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              SizedBox(
                height: 220,
                width: double.infinity,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: _controller != null && _controller!.value.isInitialized
                      ? CameraPreview(_controller!)
                      : _previewBytes != null
                          ? Image.memory(_previewBytes!, fit: BoxFit.cover)
                          : Container(
                              color: SeisColors.navy950,
                              child: const Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.fingerprint, color: SeisColors.green400, size: 42),
                                    SizedBox(height: 8),
                                    Text('Biometric preview', style: TextStyle(color: Color(0xFF8DA49C), fontSize: 12)),
                                  ],
                                ),
                              ),
                            ),
                ),
              ),
              if (_cameraError != null) ...[
                const SizedBox(height: 12),
                SeisBanner(message: _cameraError!, isError: true),
              ],
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  SizedBox(
                    width: 150,
                    child: SeisOutlineButton(
                      label: 'Start Camera',
                      icon: Icons.camera_alt_outlined,
                      compact: true,
                      onPressed: _cameraBusy || _controller != null ? null : _startCamera,
                    ),
                  ),
                  SizedBox(
                    width: 150,
                    child: SeisPrimaryButton(
                      label: 'Capture',
                      icon: Icons.camera,
                      compact: true,
                      loading: _cameraBusy && _controller != null,
                      onPressed: _controller == null ? null : _capture,
                    ),
                  ),
                  SizedBox(
                    width: 150,
                    child: SeisOutlineButton(
                      label: 'Stop',
                      icon: Icons.stop_circle_outlined,
                      compact: true,
                      onPressed: _controller == null ? null : _stopCamera,
                    ),
                  ),
                  SizedBox(
                    width: 150,
                    child: SeisOutlineButton(
                      label: 'Upload Photo',
                      icon: Icons.upload_file,
                      compact: true,
                      onPressed: _cameraBusy ? null : _uploadPhoto,
                    ),
                  ),
                ],
              ),
              if (_capturedData != null) ...[
                const SizedBox(height: 10),
                const Text('Photo ready for enrollment and verification.', style: TextStyle(color: SeisColors.green600, fontSize: 12)),
              ],
              const SizedBox(height: 12),
              TextField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Registered email for verification', prefixIcon: Icon(Icons.mail_outline)),
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                SeisBanner(message: _error!, isError: true),
              ],
              if (_message != null) ...[
                const SizedBox(height: 12),
                SeisBanner(message: _message!),
              ],
              const SizedBox(height: 16),
              SeisPrimaryButton(label: 'Enroll Biometric', icon: Icons.fingerprint, loading: _loading, onPressed: _enroll),
              const SizedBox(height: 10),
              SeisOutlineButton(label: 'Verify', icon: Icons.verified_user_outlined, onPressed: _loading ? null : _verify),
              const SizedBox(height: 10),
              const Text(
                'Data is hashed with SHA-256 before storage. Raw biometric data is never stored.',
                style: TextStyle(color: SeisColors.slate500, fontSize: 11),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SeisCard(
          color: SeisColors.forest900,
          border: Border.all(color: SeisColors.forest900),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('How it works', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800)),
              SizedBox(height: 10),
              Text('1. Capture fingerprint / face / iris\n2. Image is hashed (SHA-256)\n3. Hash stored in Postgres — never raw biometric\n4. Verification hashes again and compares\n5. Audit logged to audit_logs', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, height: 1.7)),
            ],
          ),
        ),
      ],
    );
  }
}

class _ModeChip extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final String selected;
  final VoidCallback onTap;

  const _ModeChip({
    required this.label,
    required this.value,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final active = value == selected;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: active ? const Color(0xFFEAFBF2) : Colors.white,
          border: Border.all(color: active ? SeisColors.green600 : SeisColors.slate200),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Icon(icon, color: active ? SeisColors.green600 : SeisColors.slate500, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: active ? SeisColors.navy900 : SeisColors.slate500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
