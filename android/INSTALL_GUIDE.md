# Panduan Instalasi Aplikasi Uang Kas XI DKV 1

Aplikasi ini menggunakan arsitektur **MVVM (Model-View-ViewModel)** dengan **Kotlin**, **Material Design 3**, dan **Firebase** (Authentication, Firestore, Storage, Cloud Messaging) untuk pengelolaan kas kelas XI DKV 1 secara profesional dan aman.

## 📁 Struktur Project Android
```text
XI_DKV_1_Kas/
│
├── android/
│   ├── build.gradle (Project-level Gradle)
│   ├── settings.gradle
│   └── app/
│       ├── build.gradle (Module-level Gradle)
│       └── src/
│           └── main/
│               ├── AndroidManifest.xml
│               ├── java/com/dkv1/kas/
│               │   ├── MainActivity.kt
│               │   ├── model/
│               │   │   └── Models.kt
│               │   ├── repository/
│               │   │   └── KasRepository.kt
│               │   ├── viewmodel/
│               │   │   └── KasViewModel.kt
│               │   ├── adapter/
│               │   │   └── StudentAdapter.kt
│               │   └── ui/
│               │       ├── VisitorFragment.kt
│               │       ├── AdminFragment.kt
│               │       └── SettingsFragment.kt
│               └── res/
│                   ├── layout/
│                   │   ├── activity_main.xml
│                   │   ├── fragment_visitor.xml
│                   │   ├── fragment_admin.xml
│                   │   └── fragment_settings.xml
│                   └── values/
│                       ├── colors.xml
│                       └── themes.xml
```

---

## 🚀 Langkah-langkah Membuka Project di Android Studio

1. **Unduh/Salin File Source Code**
   Pastikan Anda menyalin seluruh folder `android/` dari workspace ini ke komputer lokal Anda.

2. **Buka Android Studio**
   - Pilih **File > Open**.
   - Arahkan ke folder `android/` (yang berisi file `build.gradle` utama).
   - Klik **OK**. Android Studio akan melakukan sinkronisasi Gradle (pastikan Anda terhubung ke internet).

3. **Gunakan Gradle Terbaru & Kotlin 1.9+**
   Project dikonfigurasi menggunakan Gradle Wrapper versi terbaru dengan kompatibilitas penuh Kotlin DSL.

---

## 🔥 Menghubungkan ke Firebase Anda

Karena Firebase memerlukan sertifikat SHA-1 lokal Anda, Anda harus mendaftarkan aplikasi ini ke Firebase Console Anda sendiri:

1. **Buat Project Firebase Baru**
   - Buka [Firebase Console](https://console.firebase.google.com/).
   - Klik **Add Project**, masukkan nama: `Kas XI DKV 1`.

2. **Daftarkan Aplikasi Android**
   - Di dashboard Firebase, tambahkan aplikasi **Android**.
   - Gunakan Package Name: `com.dkv1.kas`.
   - Masukkan **SHA-1** laptop Anda (Bisa didapat dengan membuka tab Gradle di kanan Android Studio, pilih `app > Tasks > android > signingReport`).
   - Unduh file `google-services.json`.

3. **Letakkan file `google-services.json`**
   - Salin file `google-services.json` yang diunduh ke folder: `android/app/` di komputer Anda.

4. **Aktifkan Fitur Firebase di Console**
   - **Authentication**: Aktifkan **Google Sign-In**.
   - **Firestore Database**: Pilih **Create Database**, pilih lokasi server terdekat (misal: `asia-southeast1` untuk Singapura/Jakarta). Masukkan Firebase Security Rules yang disediakan di tab "Firebase Rules".
   - **Firebase Storage**: Aktifkan untuk menyimpan Logo Kelas dan Banner.
   - **Cloud Messaging (FCM)**: Aktifkan untuk notifikasi push.

---

## 🔒 Konfigurasi Keamanan (Firestore Rules)
Pastikan Anda menyalin file `firestore.rules` ke menu **Rules** di Firebase Firestore Console Anda. Aturan ini memastikan hanya admin dengan email `syallprince@gmail.com` yang dapat mengubah data, sedangkan pengunjung umum hanya dapat membaca (Read-Only).
