# SGÖ Takvim Planlayıcı – Kayıt ve Giriş Sistemi

Pembe-beyaz temalı kullanıcı kayıt ve giriş uygulaması. Özel kod ile kayıt, Firebase (Firestore) veritabanı ve Express backend kullanır.

## Özellikler

- **Kayıt sayfası:** Ad, Soyad, E-posta, Şifre ve Özel Kod
- **Özel kod doğrulama:** Kod backend’de saklanır, kayıt sadece geçerli ve daha önce kullanılmamış kodla tamamlanır
- **Veritabanı:** Firebase Firestore (özel kodlar, kullanıcılar, takvim etkinlikleri)
- **Kayıt sonrası:** Başarılı kayıtta kullanıcı giriş sayfasına yönlendirilir
- **Giriş:** Ad, soyad ve şifre ile giriş. Başarılı girişte JWT (JSON Web Token) verilir; kullanıcı profil sayfasına yönlendirilir
- **Profil sayfası:** Ad, soyad, profil fotoğrafı; kendi takviminiz; **Kızlar listesi** (diğer kullanıcılar). Bir kıza tıklayınca onun profil sayfasına gidersiniz.
- **Kız profil sayfası:** Seçilen kızın adı, fotoğrafı ve kendi takvimi (sadece görüntüleme). **Takvimi özelleştir:** Siz o kızın takvimine önemli tarihler, çift aktivite önerileri, özel gün hatırlatmaları ve birlikte zaman etkinlikleri ekleyebilirsiniz; ekledikleriniz veritabanında sizin adınıza saklanır.

## Gereksinimler

- Node.js 18+
- Firebase projesi (Firestore)

## Kurulum

### 1. Firebase

1. [Firebase Console](https://console.firebase.google.com/) içinde yeni bir proje oluşturun.
2. **Firestore Database**’i açın ve veritabanı oluşturun (test veya üretim modu).
3. **Proje Ayarları** → **Hizmet hesapları** → **Yeni özel anahtar oluştur** ile bir JSON anahtar dosyası indirin.
4. İndirilen dosyayı `backend` klasörüne kopyalayıp `serviceAccountKey.json` olarak adlandırın (veya `.env` içinde `FIREBASE_SERVICE_ACCOUNT_PATH` ile kendi dosya adınızı verin).
5. Firestore’da **Indexes** bölümünde bileşik indeksler gerekebilir: `calendarEvents` için `userId` (Ascending) + `date` (Ascending); `calendarCustomizations` için `userId` (Ascending) + `profileId` (Ascending) + `date` (Ascending). İlk ilgili sorgu hata verirse konsoldaki link ile indeksi oluşturabilirsiniz.

### 2. Backend

```bash
cd backend
cp .env.example .env
# .env içinde FIREBASE_SERVICE_ACCOUNT_PATH, JWT_SECRET ve PORT=3001 ayarlayın
npm install
npm run dev
```

Sunucu varsayılan olarak `http://localhost:3001` adresinde çalışır.

### 3. Özel kod oluşturma

Kayıt için en az bir özel kod gerekir. Örnek kod eklemek için:

```bash
curl -X POST http://localhost:3001/api/admin/codes -H "Content-Type: application/json" -d '{"code":"TEST-CODE-123"}'
```

İstediğiniz kodu `code` alanında gönderin; bu kod artık kayıt formunda kullanılabilir.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır. Kayıt ve giriş sayfaları buradan kullanılır.

## Kullanım

1. **Kayıt:** `/register` sayfasında Ad, Soyad, E-posta, Şifre ve Özel Kod girin. “Doğrula” ile kodu kontrol edin, ardından “Kayıt Ol”a tıklayın.
2. Kayıt başarılı olunca giriş sayfasına yönlendirilirsiniz.
3. **Giriş:** Ad, soyad ve şifre ile giriş yapın; başarılı girişte JWT saklanır ve profil sayfasına yönlendirilirsiniz.
4. **Profil:** Profil fotoğrafı URL’si girebilir, takvime etkinlik ekleyip silebilir ve diğer kullanıcıların profillerini görüntüleyebilirsiniz.

## API Özeti

| Endpoint | Açıklama |
|----------|----------|
| `POST /api/register` | Kayıt (name, surname, email, password, specialCode) |
| `POST /api/login` | Giriş (name, surname, password) → JWT ve user döner |
| `POST /api/validate-code` | Özel kod doğrulama (code) |
| `POST /api/admin/codes` | Yeni özel kod ekleme (code) |
| `GET /api/profile/me` | Kendi profil + takvim (JWT gerekli) |
| `PATCH /api/profile/me` | Profil fotoğrafı güncelleme (JWT gerekli) |
| `GET /api/profile/others` | Diğer kullanıcı listesi (JWT gerekli) |
| `GET /api/profile/:id` | Bir kullanıcının profili + kendi takvimi + sizin o profile eklediğiniz özelleştirmeler (JWT gerekli) |
| `POST /api/profile/:id/calendar` | O profile takvim özelleştirmesi ekleme (date, title, description, type) (JWT gerekli) |
| `DELETE /api/profile/:id/calendar/:eventId` | Eklediğiniz bir özelleştirmeyi silme (JWT gerekli) |
| `GET/POST/DELETE /api/profile/me/calendar` | Kendi takvim etkinlikleri (JWT gerekli) |

## Tema

Arayüz pembe ve beyaz renklerle tasarlandı (CSS değişkenleri: `--pink-*`, `--white`).
