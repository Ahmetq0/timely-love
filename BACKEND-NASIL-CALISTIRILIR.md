# Backend Nasıl Çalıştırılır? (Adım Adım)

Bu rehber, projenin **backend** (sunucu) kısmını bilgisayarınızda çalıştırmanız için gereken tüm adımları anlatır.

---

## Adım 1: Node.js’in yüklü olduğunu kontrol edin

Backend, **Node.js** ile çalışır. Yüklü mü kontrol etmek için:

1. **Terminal** (Mac/Linux) veya **Komut İstemi / PowerShell** (Windows) açın.
2. Şu komutu yazın ve Enter’a basın:

```bash
node -v
```

- **Bir sürüm numarası görüyorsanız** (örn. `v18.17.0`) → Node.js yüklü, Adım 2’ye geçin.
- **“Komut bulunamadı” gibi bir hata alıyorsanız** → [nodejs.org](https://nodejs.org) adresinden **LTS** sürümünü indirip kurun, sonra terminali kapatıp tekrar açın ve `node -v` komutunu tekrar deneyin.

---

## Adım 2: Firebase projesi oluşturun

Backend, veritabanı olarak **Firebase (Firestore)** kullanır. Önce bir Firebase projesi açmanız gerekir.

1. Tarayıcıda **https://console.firebase.google.com** adresine gidin.
2. Google hesabınızla giriş yapın.
3. **“Proje oluştur”** (veya “Create a project”) deyin.
4. Proje adı girin (örn. `sgo-takvim`) ve **Devam** deyin.
5. İsterseniz Google Analytics’i atlayabilirsiniz. **Proje oluştur** ile bitirin.

---

## Adım 3: Firestore veritabanını açın

1. Firebase Console’da sol menüden **“Build”** → **“Firestore Database”** seçin.
2. **“Create database”** deyin.
3. **“Start in test mode”** seçin (geliştirme için yeterli), **Next** → **Enable** deyin.
4. Bölge seçin (örn. `europe-west1`) ve **Enable** deyin.

Veritabanı oluşturulmuş olacak.

---

## Adım 4: Servis hesabı anahtarını (JSON) indirin

Backend’in Firebase’e bağlanabilmesi için bir **anahtar dosyası** gerekir.

1. Firebase Console’da sol üstteki **dişli ikonu** → **“Proje ayarları”** (Project settings).
2. Üstten **“Hizmet hesapları”** (Service accounts) sekmesine geçin.
3. **“Yeni özel anahtar oluştur”** (Generate new private key) butonuna tıklayın ve **Oluştur** deyin.
4. Bilgisayarınıza bir **JSON** dosyası inecek (örn. `sgo-takvim-firebase-adminsdk-xxxxx.json`).

Bu dosyayı bir sonraki adımda backend klasörüne koyacağız.

---

## Adım 5: Anahtar dosyasını backend klasörüne kopyalayın

1. Projenizin klasörünü açın: **SGÖ TAKVİM PLANLAYICI**
2. İçindeki **backend** klasörüne girin.
3. İndirdiğiniz JSON dosyasını bu **backend** klasörüne **kopyalayın**.
4. Dosyanın adını şu şekilde **değiştirin**: **`serviceAccountKey.json`**

Son durumda şöyle olmalı:

```
SGÖ TAKVİM PLANLAYICI/
  backend/
    serviceAccountKey.json   ← bu dosya burada olmalı
    .env
    server.js
    ...
```

---

## Adım 6: .env dosyasını oluşturun

Backend’in ayarlarını tutan bir **.env** dosyası oluşturmanız gerekir.

1. **backend** klasörünün içinde **`.env.example`** adlı dosyayı bulun.
2. Bu dosyayı **kopyalayın** ve kopyanın adını **`.env`** yapın.  
   (Mac’te gizli dosyalar kapalıysa `.env.example` görünür; kopyalayıp adını `.env` yapabilirsiniz.)
3. **`.env`** dosyasını bir metin editörüyle (Not Defteri, VS Code, Cursor vb.) açın.
4. İçeriği aşağıdaki gibi düzenleyin (zaten doğruysa dokunmayın):

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
JWT_SECRET=guvenli-bir-sifre-buraya-rastgele-yazin-12345
PORT=3001
```

- `FIREBASE_SERVICE_ACCOUNT_PATH`: Anahtar dosyası `serviceAccountKey.json` adıyla backend içindeyse bu satır aynen böyle kalabilir.
- `JWT_SECRET`: Kendi belirlediğiniz uzun bir metin olabilir (gerçek projede güçlü ve rastgele olmalı).
- `PORT`: Backend 3001 portunda çalışacak.

Dosyayı **kaydedin**.

---

## Adım 7: Bağımlılıkları yükleyin

1. Terminali (veya Komut İstemi / PowerShell’i) açın.
2. Proje klasörüne gidin. Örnek (kendi bilgisayarınızdaki yolu kullanın):

```bash
cd "Masaüstü/SGÖ TAKVİM PLANLAYICI/backend"
```

Windows’ta örnek:

```bash
cd C:\Users\KULLANICI_ADINIZ\Desktop\SGÖ TAKVİM PLANLAYICI\backend
```

3. Şu komutu çalıştırın:

```bash
npm install
```

Bu komut gerekli paketleri indirir. Birkaç dakika sürebilir. Bittiğinde **backend** klasöründe **node_modules** klasörü oluşur.

---

## Adım 8: Backend’i çalıştırın

Hâlâ **backend** klasöründeyken:

```bash
npm run dev
```

Şuna benzer bir çıktı görürseniz backend çalışıyor demektir:

```
Server running at http://localhost:3001
```

- Bu pencereyi **kapatmayın**; backend çalışır durumda kalmalı.
- Durdurmak için bu terminal penceresinde **Ctrl + C** (Mac’te de Ctrl + C) yapın.

---

## Adım 9: (İsteğe bağlı) Özel kod oluşturun

Kayıt olabilmek için veritabanında en az bir **özel kod** olmalı. Backend çalışırken **yeni bir terminal** açın ve:

```bash
cd "Masaüstü/SGÖ TAKVİM PLANLAYICI/backend"
node scripts/seed-code.js KAYIT-KODU-2024
```

`KAYIT-KODU-2024` yerine istediğiniz kodu yazabilirsiniz. Bu komut o kodu veritabanına ekler. Sonra uygulamada **Kayıt ol** sayfasında “Özel kod” alanına bu kodu yazıp kayıt olursunuz.

---

## Özet kontrol listesi

| Adım | Yapılacak |
|------|------------|
| 1 | Node.js yüklü (`node -v`) |
| 2 | Firebase’de proje oluşturuldu |
| 3 | Firestore veritabanı açıldı (test mode) |
| 4 | Servis hesabı JSON anahtarı indirildi |
| 5 | JSON dosyası backend klasörüne kondu, adı `serviceAccountKey.json` yapıldı |
| 6 | `.env` dosyası oluşturuldu ve düzenlendi |
| 7 | `npm install` çalıştırıldı |
| 8 | `npm run dev` ile backend başlatıldı |
| 9 | (İsteğe bağlı) `node scripts/seed-code.js KOD` ile kayıt kodu eklendi |

---

## Frontend’i de çalıştırmak isterseniz

Web arayüzünü (kayıt/giriş sayfaları) görmek için **frontend**’i de çalıştırmanız gerekir. **Yeni bir terminal** açın:

```bash
cd "Masaüstü/SGÖ TAKVİM PLANLAYICI/frontend"
npm install
npm run dev
```

Ardından tarayıcıda **http://localhost:5173** adresine gidin. Backend’in de aynı anda çalışıyor olması gerekir (yani bir terminalde `npm run dev` backend için açık kalsın).

---

Bir adımda takılırsanız, tam olarak hangi adımda ve ne hata mesajı aldığınızı yazarsanız, oradan devam edebiliriz.
