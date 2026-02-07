# Timely Love – Hosting ve Yayına Alma Rehberi

Bu uygulama **Node.js backend** + **React frontend** + **Firebase Firestore** kullanıyor. İki deployment seçeneği var.

---

## Ön Hazırlık

### 1. Firebase ayarları
- Firebase Console'dan **serviceAccountKey.json** indirin
- Firestore kurallarını production için kontrol edin

### 2. Backend ortam değişkenleri (hepsi gerekli)
```
PORT=3001
JWT_SECRET=güçlü-gizli-bir-anahtar-buraya
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```
veya `FIREBASE_SERVICE_ACCOUNT_JSON` ile JSON içeriğini string olarak verebilirsiniz.

---

## Seçenek A: Tek Sunucuda (Önerilen)

Backend hem API hem de frontend static dosyalarını sunar. Tek proje, tek URL.

### Platform: **Render** (render.com) veya **Railway** (railway.app)

### Adımlar (Render örneği):

1. **GitHub’a push edin** – Projeyi GitHub’a yükleyin

2. **Render’da yeni Web Service oluşturun**
   - Connect: GitHub repo
   - Root directory: (boş bırakın – proje kökü)
   - Build command: `npm run build` (root package.json’daki script)
   - Start command: `npm start`
   - Environment: `PORT`, `JWT_SECRET`, `FIREBASE_SERVICE_ACCOUNT_JSON`

4. **serviceAccountKey.json**
   - Render’da Secret File olarak ekleyin VEYA
   - `FIREBASE_SERVICE_ACCOUNT_JSON` içine tüm JSON’u tek satır olarak yapıştırın

5. **CORS** – Backend zaten `origin: true` ile tüm originlere izin veriyor; ek ayar gerekmez.

---

## Seçenek B: Frontend ve Backend Ayrı

- **Frontend:** Vercel / Netlify
- **Backend:** Render / Railway / Fly.io

### Frontend (Vercel/Netlify)

1. `frontend` klasöründe projeyi deploy edin
2. Ortam değişkeni ekleyin: `VITE_API_URL=https://your-backend-url.com`
3. `api.js` dosyasında `API` değişkeni bu URL’i kullanacak şekilde güncellenmeli

### Backend (Render/Railway)

1. `backend` klasörünü deploy edin
2. Ortam değişkenleri: `PORT`, `JWT_SECRET`, `FIREBASE_SERVICE_ACCOUNT_JSON`
3. CORS’ta frontend domain’inizi ekleyin (örn. `https://your-app.vercel.app`)

---

## Kontrol Listesi

- [ ] Firebase service account production’da tanımlı
- [ ] JWT_SECRET güçlü ve rastgele
- [ ] `serviceAccountKey.json` .gitignore’da (GitHub’a eklemeyin)
- [ ] Firestore kuralları production için uygun
- [ ] Özel kodlar veritabanında mevcut (seed script ile eklenebilir)

---

## Build ve Test (Yerel)

```bash
# Tüm projeyi build et
npm run build

# Sunucuyu başlat (frontend + backend birlikte)
npm start
# Tarayıcıda http://localhost:3001
```

---

## Sık Sorulan Sorular

**Firebase JSON’u nasıl güvenli tutarım?**  
Hosting ortamında Secret File veya `FIREBASE_SERVICE_ACCOUNT_JSON` env var kullanın. JSON’u asla GitHub’a koymayın.

**Özel kodları nasıl eklerim?**  
Backend’e SSH/console ile bağlanıp `node scripts/seed-500-codes.js` çalıştırabilirsiniz; veya lokal ortamda çalıştırıp Firestore’a ekleyin.

**HTTPS?**  
Render, Railway, Vercel, Netlify varsayılan olarak HTTPS sağlar.
