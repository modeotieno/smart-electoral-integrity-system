import 'package:flutter_test/flutter_test.dart';
import 'package:seis_mobile/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('SEIS app loads public home', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const SeisApp());
    await tester.pumpAndSettle();

    expect(find.text('TRUSTED. TRANSPARENT. VERIFIABLE.'), findsOneWidget);
    expect(find.textContaining('Smart Electoral'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);
  });
}
