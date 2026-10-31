# Smart Kharcha Android APK Project

This folder contains the complete, native Android Studio / Gradle project for **Smart Kharcha** (`com.smartkharcha.app`).

### Prerequisites
- Android Studio Hedgehog / Iguana / Jellyfish (or Android SDK command line tools)
- JDK 17
- Gradle 8.2+

### How to Build the APK File

#### Option 1: Using Command Line (Terminal)
Open terminal in this `android/` folder and run:

```bash
# For Debug APK (testing on phone):
./gradlew assembleDebug

# Output APK path:
# app/build/outputs/apk/debug/app-debug.apk

# For Production Release APK:
./gradlew assembleRelease

# Output APK path:
# app/build/outputs/apk/release/app-release-unsigned.apk
```

#### Option 2: Using Android Studio
1. Open Android Studio.
2. Select **Open an existing project** and select this `android` folder.
3. Wait for Gradle sync to complete.
4. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
5. Android Studio will generate `app-debug.apk`. Click **"locate"** to grab the `.apk` file!

#### Option 3: Install directly to phone via USB (ADB)
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```
