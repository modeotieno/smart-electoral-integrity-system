import 'package:flutter/material.dart';

import 'theme.dart';

typedef SeisNavigate = void Function(String route);

class SeisLogo extends StatelessWidget {
  final bool dark;
  final bool compact;

  const SeisLogo({super.key, this.dark = false, this.compact = false});

  @override
  Widget build(BuildContext context) {
    final color = dark ? Colors.white : SeisColors.navy950;
    final subColor = dark ? const Color(0xFF9FB2C7) : SeisColors.slate500;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 34,
          height: 42,
          child: Stack(
            alignment: Alignment.center,
            children: List.generate(4, (index) {
              final sizes = [
                const Size(30, 38),
                const Size(23, 31),
                const Size(16, 23),
                const Size(7, 12),
              ];
              return Container(
                width: sizes[index].width,
                height: sizes[index].height,
                decoration: BoxDecoration(
                  border: Border.all(color: SeisColors.green500, width: 2),
                  shape: BoxShape.circle,
                ),
              );
            }),
          ),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'SEIS',
              style: TextStyle(
                color: color,
                fontSize: compact ? 16 : 20,
                fontWeight: FontWeight.w800,
                letterSpacing: 3,
                height: 1,
              ),
            ),
            if (!compact)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  'SMART ELECTORAL\nINTEGRITY SYSTEM',
                  style: TextStyle(
                    color: subColor,
                    fontSize: 8,
                    height: 1.25,
                    letterSpacing: 1.6,
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class SeisCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? color;
  final Border? border;

  const SeisCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.color,
    this.border,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: border ?? Border.all(color: SeisColors.slate200),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A0F172A),
            blurRadius: 16,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: child,
    );
  }
}

class SeisSectionHeading extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String? subtitle;
  final bool center;

  const SeisSectionHeading({
    super.key,
    required this.eyebrow,
    required this.title,
    this.subtitle,
    this.center = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: center ? CrossAxisAlignment.center : CrossAxisAlignment.start,
      children: [
        Text(
          eyebrow.toUpperCase(),
          style: const TextStyle(
            color: SeisColors.green600,
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.4,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          title,
          textAlign: center ? TextAlign.center : TextAlign.start,
          style: const TextStyle(
            color: SeisColors.navy900,
            fontSize: 26,
            fontWeight: FontWeight.w800,
            height: 1.2,
          ),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 8),
          Text(
            subtitle!,
            textAlign: center ? TextAlign.center : TextAlign.start,
            style: const TextStyle(color: SeisColors.slate500, fontSize: 14, height: 1.6),
          ),
        ],
      ],
    );
  }
}

class SeisPrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool loading;
  final bool compact;

  const SeisPrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.loading = false,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: loading ? null : onPressed,
      style: FilledButton.styleFrom(
        minimumSize: Size.fromHeight(compact ? 40 : 48),
        padding: const EdgeInsets.symmetric(horizontal: 18),
        backgroundColor: SeisColors.green600,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      child: loading
          ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
            )
          : Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  child: Text(
                    label,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                ),
                if (icon != null) ...[
                  const SizedBox(width: 8),
                  Icon(icon, size: 18),
                ],
              ],
            ),
    );
  }
}

class SeisOutlineButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool light;
  final bool compact;

  const SeisOutlineButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.light = false,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final foreground = light ? Colors.white : SeisColors.navy900;
    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        minimumSize: Size.fromHeight(compact ? 40 : 48),
        padding: const EdgeInsets.symmetric(horizontal: 18),
        foregroundColor: foreground,
        side: BorderSide(
          color: light ? Colors.white54 : SeisColors.slate200,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Flexible(
            child: Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
          if (icon != null) ...[
            const SizedBox(width: 8),
            Icon(icon, size: 18),
          ],
        ],
      ),
    );
  }
}

class SeisBanner extends StatelessWidget {
  final String message;
  final bool isError;

  const SeisBanner({super.key, required this.message, this.isError = false});

  @override
  Widget build(BuildContext context) {
    final background = isError ? const Color(0xFFFEF2F2) : const Color(0xFFF0FDF4);
    final foreground = isError ? SeisColors.danger : const Color(0xFF166534);
    final border = isError ? const Color(0xFFFECACA) : const Color(0xFFBBF7D0);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: border),
      ),
      child: Row(
        children: [
          Icon(isError ? Icons.error_outline : Icons.check_circle_outline, color: foreground, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(color: foreground, fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class StatusChip extends StatelessWidget {
  final String label;
  final StatusTone tone;

  const StatusChip({super.key, required this.label, this.tone = StatusTone.neutral});

  @override
  Widget build(BuildContext context) {
    final colors = switch (tone) {
      StatusTone.success => (bg: const Color(0xFFDCFCE7), fg: const Color(0xFF166534)),
      StatusTone.warning => (bg: const Color(0xFFFEF3C7), fg: const Color(0xFF92400E)),
      StatusTone.danger => (bg: const Color(0xFFFEE2E2), fg: const Color(0xFF991B1B)),
      StatusTone.info => (bg: const Color(0xFFE0F2FE), fg: const Color(0xFF075985)),
      StatusTone.neutral => (bg: SeisColors.slate100, fg: SeisColors.slate700),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: colors.bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          color: colors.fg,
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.4,
        ),
      ),
    );
  }
}

enum StatusTone { success, warning, danger, info, neutral }

StatusTone toneFor(String value) {
  final normalized = value.toLowerCase();
  if (normalized.contains('approv') ||
      normalized.contains('verif') ||
      normalized.contains('active') ||
      normalized.contains('enrolled') ||
      normalized.contains('success')) {
    return StatusTone.success;
  }
  if (normalized.contains('pending') ||
      normalized.contains('planned') ||
      normalized.contains('medium') ||
      normalized.contains('high')) {
    return StatusTone.warning;
  }
  if (normalized.contains('reject') ||
      normalized.contains('critical') ||
      normalized.contains('failed')) {
    return StatusTone.danger;
  }
  if (normalized.contains('low') || normalized.contains('open')) {
    return StatusTone.info;
  }
  return StatusTone.neutral;
}

class SeisEmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;

  const SeisEmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return SeisCard(
      padding: const EdgeInsets.all(28),
      child: Column(
        children: [
          Icon(icon, size: 44, color: SeisColors.slate400),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: SeisColors.slate700,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Text(
              subtitle!,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: SeisColors.slate500),
            ),
          ],
        ],
      ),
    );
  }
}

class SeisGrid extends StatelessWidget {
  final int minTileWidth;
  final double spacing;
  final List<Widget> children;

  const SeisGrid({
    super.key,
    required this.children,
    this.minTileWidth = 220,
    this.spacing = 12,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final available = constraints.maxWidth;
        final columns = available <= 0
            ? 1
            : (available / (minTileWidth + spacing)).floor().clamp(1, 4);
        final width = (available - spacing * (columns - 1)) / columns;
        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: [
            for (final child in children)
              SizedBox(width: width.toDouble(), child: child),
          ],
        );
      },
    );
  }
}

class InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData? icon;

  const InfoRow({super.key, required this.label, required this.value, this.icon});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: [
          if (icon != null) ...[
            Icon(icon, size: 18, color: SeisColors.green600),
            const SizedBox(width: 10),
          ],
          Expanded(
            flex: 3,
            child: Text(label, style: const TextStyle(color: SeisColors.slate500, fontSize: 13)),
          ),
          Expanded(
            flex: 4,
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(
                color: SeisColors.slate900,
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class StatTile extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const StatTile({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return SeisCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: SeisColors.slate500, fontSize: 12)),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    color: SeisColors.navy900,
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
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

class FeatureTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const FeatureTile({
    super.key,
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return SeisCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFEAFBF2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: SeisColors.green600),
          ),
          const SizedBox(height: 14),
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: SeisColors.navy900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            description,
            style: const TextStyle(fontSize: 13, color: SeisColors.slate500, height: 1.55),
          ),
        ],
      ),
    );
  }
}
