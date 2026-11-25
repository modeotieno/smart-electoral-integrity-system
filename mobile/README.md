# SEIS Mobile

Flutter app for the Smart Electoral Integrity System. The same codebase builds native Android/iOS apps and an installable browser PWA.

## Features

* Sign in / register with role selection; sessions are revalidated against `/api/auth/me` on startup and cleared when expired.
* Overview of registrations, candidates, stations, biometric enrolment, and tamper-evident security status.
* Elections, polling stations, certified results, and personal biometric enrolment status.
* Incident reporting: submit a title, description, severity, and optional polling station, then review reported incidents.
* Same-origin PWA API proxy with offline app-shell caching; requests time out after 20 seconds with actionable errors.

## Browser install (PWA)

The web build calls the API on the same origin (`/api`), which nginx proxies to the Go backend. No API host is baked into the build by default.

From the repository root:

```bash
make mobile-web
make mobile-up
```

Open `http://localhost:5174` in Chrome/Edge and choose **Install app** (or the in-app **Install** button). `localhost` is treated as a secure origin, so installation works locally. For installation on a real phone, serve the app over HTTPS through a reverse proxy; plain HTTP on a LAN address will not show the install prompt.

To use a different API origin, build with an override:

```bash
make mobile-web API_BASE_URL=https://api.example.com
```

## Native builds

For Android emulator, the default API URL is `http://10.0.2.2:8080`. For a physical device or release build, pass an explicit URL:

```bash
cd mobile
flutter build apk --release --dart-define=API_BASE_URL=https://api.example.com
flutter build ios --release --dart-define=API_BASE_URL=https://api.example.com
```

A local Android release build is written to `build/app/outputs/flutter-apk/app-release.apk`. The default emulator URL (`10.0.2.2:8080`) only works in the emulator; physical devices need a reachable API URL passed with `--dart-define`.

## Checks

```bash
make mobile-analyze
make mobile-test
```

The web output is generated at `mobile/build/web` and is git-ignored, so run `make mobile-web` before starting `mobile-web` in Docker on a fresh clone.
