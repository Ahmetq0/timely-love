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

## BÖLÜM 2: Kendi Hosting'inizde (VPS / Kendi Sunucu) Çalıştırma

Kendi domain'inizle (örn. `timelylove.com`) tek adreste çalışması için **kendi sunucunuzda** veya **Node.js destekleyen bir VPS/hosting** kullanabilirsiniz. Evet, çalışır.

### Ne tür hosting gerekir?
- **Node.js** çalıştırabilen bir sunucu gerekir.
- **Shared hosting** (klasik web hosting) çoğunda Node yok; **VPS** veya **Cloud sunucu** kullanın.
- Örnek: **DigitalOcean**, **Hetzner**, **Turhost VPS**, **Natro**, **Radore**, veya herhangi bir Linux VPS.

### Genel akış
1. VPS/hosting alırsınız → SSH ile sunucuya bağlanırsınız
2. Node.js kurarsınız
3. Projeyi GitHub'dan sunucuya çekersiniz
4. Build alıp uygulamayı çalıştırırsınız
5. Domain'i bu sunucuya yönlendirirsiniz (A kaydı veya CNAME)

---

### Adım 1: Sunucuya bağlanın

Hosting aldıktan sonra size **IP adresi**, **SSH kullanıcı adı** ve **şifre/SSH key** verilir.

Mac/Linux’ta Terminal’de:
```bash
ssh kullanici@SUNUCU_IP_ADRESI
```
(Windows’ta PuTTY veya Windows Terminal kullanabilirsiniz.)

---

### Adım 2: Node.js kurun

Sunucuda (SSH ile bağlıyken):

```bash
# Node.js 20 LTS (Ubuntu/Debian örnek)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kontrol
node -v   # v20.x.x
npm -v
```

---

### Adım 3: Projeyi sunucuya alın

```bash
# Örnek: /var/www altında
sudo mkdir -p /var/www
cd /var/www

# GitHub'dan clone (repo public ise şifresiz)
sudo git clone https://github.com/KULLANICI_ADINIZ/timely-love.git
cd timely-love
```

(Git kurulu değilse: `sudo apt-get update && sudo apt-get install -y git`)

---

### Adım 4: Ortam değişkenleri ve Firebase

```bash
cd /var/www/timely-love/backend

# .env dosyası oluştur
sudo nano .env
```

İçine şunları yazın (kendi değerlerinizle):

```
PORT=3001
JWT_SECRET=buraya-güclü-gizli-anahtar-yazin
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

Kaydedin (Ctrl+O, Enter, Ctrl+X).

**serviceAccountKey.json** dosyasını bilgisayarınızdan sunucuya kopyalamanız gerekir. Bilgisayarınızda (yeni bir terminalde):

```bash
scp "/Users/ahmethan/Desktop/SGÖ TAKVİM PLANLAYICI/backend/serviceAccountKey.json" kullanici@SUNUCU_IP:/var/www/timely-love/backend/
```

---

### Adım 5: Build ve başlatma

```bash
cd /var/www/timely-love

# Bağımlılıklar + frontend build
npm run build

# Backend'i başlat (kalıcı çalışması için PM2 önerilir)
sudo npm install -g pm2
cd backend
pm2 start server.js --name timely-love
pm2 save
pm2 startup   # Sunucu yeniden açılsa da uygulama başlasın
```

Uygulama `http://SUNUCU_IP:3001` adresinde çalışır.

---

### Adım 6: Domain ve HTTPS (isteğe bağlı)

Kendi domain'inizi (örn. `timelylove.com`) bu sunucuya yönlendirmek için:

1. **Domain DNS:** Domain satın aldığınız panelde **A kaydı** ekleyin:  
   `@` (veya `www`) → Sunucu IP adresi

2. **Nginx** ile 80/443 portuna yönlendirme ve HTTPS:
   - Nginx kurun: `sudo apt-get install -y nginx`
   - Site config: `sudo nano /etc/nginx/sites-available/timely-love`

Örnek config:

```nginx
server {
    listen 80;
    server_name timelylove.com www.timelylove.com;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- Aktifleştir: `sudo ln -s /etc/nginx/sites-available/timely-love /etc/nginx/sites-enabled/`
- Test: `sudo nginx -t`
- Yeniden başlat: `sudo systemctl reload nginx`

3. **HTTPS** için Let's Encrypt:  
   `sudo apt-get install certbot python3-certbot-nginx && sudo certbot --nginx -d timelylove.com -d www.timelylove.com`

Bundan sonra site `https://timelylove.com` üzerinden açılır; URL’de başka bir şey olmaz.

---

### Güncelleme (yeni sürüm çıkınca)

```bash
cd /var/www/timely-love
git pull
npm run build
pm2 restart timely-love
```

---

## BÖLÜM 3: Render ile Hosting (Alternatif)

(Render kullanmak istemiyorsanız bu bölümü atlayabilirsiniz.)

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

**GitHub:**
- [ ] GitHub hesabı açıldı
- [ ] Yeni repo oluşturuldu
- [ ] Proje `git push` ile GitHub'a yüklendi

**Kendi hosting (VPS) ile:**
- [ ] VPS / Node.js destekleyen sunucu alındı
- [ ] Node.js kuruldu
- [ ] Proje clone edildi, `.env` ve `serviceAccountKey.json` eklendi
- [ ] `npm run build` ve `pm2 start` ile uygulama çalışıyor
- [ ] Domain A kaydı sunucuya yönlendirildi
- [ ] (İsteğe bağlı) Nginx + SSL ile HTTPS açıldı

**Render ile (alternatif):**
- [ ] Render hesabı GitHub ile bağlandı
- [ ] Web Service oluşturuldu (Build: `npm run build`, Start: `npm start`)
- [ ] `JWT_SECRET` ve `FIREBASE_SERVICE_ACCOUNT_JSON` eklendi
- [ ] Deploy başarılı, site açılıyor
