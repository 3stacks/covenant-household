# Daily Prayer for iOS and Android

The mobile app of Daily Prayer. It uses Expo (SDK 58), React Native and Expo Router. It shows the
same pages as the web app in `apps/web/`. It gets the church year, the data model and the links
from `packages/core/`.

The app has the full calendar in its bundle, so it works with no connection. The links to
Precentor, Hearers and the Self-Interpreting Bible open in the in-app browser.

## Run

The app needs Node 24. Run these commands at the repository root:

```bash
npm run install:all
npm run mobile     # build the calendar, then start Expo
```

Scan the QR code with Expo Go on a phone. Or press `i` for the iOS Simulator, or `a` for the
Android emulator.

Run these checks in `apps/mobile/` before a release:

```bash
npx tsc --noEmit
npx expo-doctor
npx expo export --platform ios --platform android   # the bundles must compile
```

## Screens

| Path | Screen |
| --- | --- |
| `/` | Today |
| `/day/2026-11-10` | A date |
| `/calendar/2026-11` | The church year, by month. It scrolls to today. |
| `/settings`, `/about`, `/how` | The text pages |

The paths are the same as the web app. The deep link `dailyprayer://day/2026-11-10` opens a
date.

## Build for the stores

Expo Build makes the signed builds in the cloud. You do not need Xcode or Android Studio.

1. Create an Expo account.
2. In `apps/mobile/`, run `npx eas-cli@latest login`.
3. Run `npx eas-cli@latest init`. This command writes the project id into `app.json`.
4. Run `npx eas-cli@latest build --platform all --profile production`.
5. Run `npx eas-cli@latest submit --platform ios`.
6. Run `npx eas-cli@latest submit --platform android`.

The App Store needs an Apple Developer Program membership. Google Play needs a Google Play
Console account. Expo Build asks for these accounts. It makes the keys that sign the app.

Git does not keep the calendar. Before each build, the `eas-build-post-install` script runs
`scripts/build-calendar.ts --release`. That script downloads the Bible, confession and psalm
text from Hearers and Precentor.

The app id is `com.lukeboyle.dailyprayer` on both stores. You cannot change it after the first
release, so make sure that it is correct before step 4.
