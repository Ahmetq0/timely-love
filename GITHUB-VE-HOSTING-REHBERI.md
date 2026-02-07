# Timely Love – GitHub ve Hosting Adım Adım Rehber

---

## BÖLÜM 1: GitHub'a Yükleme

### Adım 1: GitHub Hesabı
1. [github.com](https://github.com) adresine gidin
2. Sağ üstten **Sign up** ile yeni hesap açın (veya **Sign in** ile giriş yapın)

### Adım 2: Yeni Repo Oluşturma
1. Giriş yaptıktan sonra sağ üstteki **+** → **New repository**
2. **Repository name:** `timely-love` (veya istediğiniz bir isim)
3. **Description:** (isteğe bağlı) "Takvim planlayıcı uygulaması"
4. **Public** seçin
5. **"Add a README file"** işaretini **KALDIRIN** (proje zaten var)
6. **Create repository** tıklayın

### Adım 3: Projeyi Bilgisayarda Hazırlama

**Terminal'i açın** (VS Code içindeki Terminal veya Mac'te Terminal.app).

Proje klasörüne gidin:
```bash
cd "/Users/ahmethan/Desktop/SGÖ TAKVİM PLANLAYICI"
```

**Git'in kurulu olduğunu kontrol edin:**
```bash
git --version
```
(Kurulu değilse [git-scm.com](https://git-scm.com) adresinden indirin.)

### Adım 4: Git Başlatma ve İlk Commit

```bash
# Git deposunu başlat (henüz yapılmadıysa)
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "İlk commit - Timely Love uygulaması"
```

### Adım 5: GitHub Repo ile Bağlama

GitHub'da oluşturduğunuz repo sayfasında yeşil **Code** butonuna tıklayın. HTTPS linkini kopyalayın (örn. `https://github.com/KULLANICI_ADINIZ/timely-love.git`).

Terminal'de:

```bash
# GitHub reposunu "origin" olarak ekle (URL'i kendi linkinizle değiştirin)
git remote add origin https://github.com/KULLANICI_ADINIZ/timely-love.git

# Ana branch adını "main" yap (gerekirse)
git branch -M main

# GitHub'a gönder
git push -u origin main
```

**İlk kez push yaparken** GitHub kullanıcı adı ve şifre (veya Personal Access Token) isteyebilir. Giriş yapın.

### Adım 6: Kontrol
- GitHub repo sayfasını yenileyin
- Tüm dosyaların göründüğünü kontrol edin
- `serviceAccountKey.json` ve `.env` dosyalarının **listede olmaması** gerekir (.gitignore sayesinde)

---

## BÖLÜM 2: Render ile Hosting

### Adım 1: Render Hesabı
1. [render.com](https://render.com) adresine gidin
2. **Get Started** veya **Sign Up** tıklayın
3. **Sign up with GitHub** seçin → GitHub hesabınızla giriş yapın ve yetki verin

### Adım 2: Yeni Web Service Oluşturma
1. Render dashboard'da **New +** → **Web Service**
2. **Build and deploy from a Git repository** bölümünde **Next** tıklayın
3. **Connect a repository** kısmında GitHub reponuzu bulun (`timely-love` veya verdiğiniz isim)
4. Repo yanındaki **Connect** tıklayın

### Adım 3: Servis Ayarları

Aşağıdaki alanları doldurun:

| Alan | Değer |
|------|-------|
| **Name** | `timely-love` (veya istediğiniz isim) |
| **Region** | Frankfurt (EU Central) veya en yakın bölge |
| **Branch** | `main` |
| **Root Directory** | (boş bırakın) |
| **Runtime** | Node |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### Adım 4: Environment Variables (Ortam Değişkenleri)

**Environment** bölümünde **Add Environment Variable** tıklayın ve şunları ekleyin:

| Key | Value |
|-----|-------|
| `JWT_SECRET` | Güçlü rastgele bir metin (örn. `k7x9m2p5q1w4e8r3t6y0u`) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | serviceAccountKey.json dosyasının **tüm içeriği** (tek satır olarak) |

**Firebase JSON nasıl eklenir:**
1. `backend/serviceAccountKey.json` dosyasını bir metin editöründe açın
2. Tüm içeriği kopyalayın (süslü parantezler dahil)
3. Satır sonlarını kaldırıp tek satır yapın (isterseniz olduğu gibi de bırakabilirsiniz)
4. Bu metni `FIREBASE_SERVICE_ACCOUNT_JSON` değeri olarak yapıştırın

> **Alternatif:** Render'da **Secret Files** kullanarak `serviceAccountKey.json` dosyasını da yükleyebilirsiniz. Bu durumda `FIREBASE_SERVICE_ACCOUNT_PATH` değişkenine dosya yolunu verin.

### Adım 5: Deploy Başlatma
1. **Create Web Service** tıklayın
2. Render build ve deploy işlemini başlatır (3–5 dakika sürebilir)
3. Logları takip ederek hata olup olmadığını kontrol edin

### Adım 6: Sonuç
- Deploy tamamlandığında **"Live"** yazısı yeşil olur
- Üstteki linke tıklayın (örn. `https://timely-love.onrender.com`)
- Uygulama canlıda çalışıyor olmalı

---

## Sık Karşılaşılan Sorunlar

### "Build failed"
- Logları kontrol edin (Render dashboard → Logs)
- `npm run build` yerel ortamda çalışıyor mu test edin: `npm run build`

### "Application failed to respond"
- `JWT_SECRET` ve `FIREBASE_SERVICE_ACCOUNT_JSON` doğru girilmiş mi kontrol edin
- Firebase JSON'da tırnak işareti kaçışı (`\"`) gerekebilir; çok fazla sorun varsa Secret File kullanın

### Firebase bağlantı hatası
- Firebase Console'da service account yetkilerini kontrol edin
- Firestore'un aktif olduğundan emin olun

### Güncelleme yapmak istediğinizde
```bash
git add .
git commit -m "Güncelleme açıklaması"
git push
```
Render otomatik olarak yeni deploy başlatır.

---

## Özet Kontrol Listesi

- [ ] GitHub hesabı açıldı
- [ ] Yeni repo oluşturuldu
- [ ] Proje `git push` ile GitHub'a yüklendi
- [ ] Render hesabı GitHub ile bağlandı
- [ ] Web Service oluşturuldu
- [ ] Build: `npm run build`, Start: `npm start`
- [ ] `JWT_SECRET` eklendi
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` eklendi
- [ ] Deploy başarılı, site açılıyor
