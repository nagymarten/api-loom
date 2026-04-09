# 🚀 Backend nélküli deployment útmutató

Az API Loom három módon deployolható backend nélkül. Az alkalmazás **localStorage-ban működik**, így nem szükséges szerver.

---

## ✅ Amit eddig csináltam

1. ✅ **Standalone konfiguráció** létrehozva (Keycloak nélkül)
2. ✅ **GitHub Actions workflow** beállítva GitHub Pages-hez
3. ✅ **ApiDataService standalone** verzió (csak localStorage)
4. ✅ **Build script** hozzáadva: `npm run build:standalone`

---

## 🎯 Opció 1: GitHub Pages (ajánlott - INGYENES)

### Előfeltételek
- GitHub repository
- GitHub Actions engedélyezve

### Deployment lépések:

1. **GitHub Pages bekapcsolása:**
   - Menj a repository **Settings** > **Pages**
   - Source: `GitHub Actions`

2. **Push a kód:**
   ```bash
   git add .
   git commit -m "Add standalone deployment configuration"
   git push origin main
   ```

3. **Várj a GitHub Actions-re:**
   - Menj a **Actions** tabra
   - Nézd meg a workflow futását
   - Sikeresen lefut? ✅

4. **Ellenőrzés:**
   - URL: `https://<username>.github.io/api-loom/`
   - Az app betöltődik és localStorage-ban működik

### Lokális tesztelés GitHub Pages előtt:

```bash
npm run build:standalone -- --base-href /api-loom/
cd dist/api-conf/browser
npx http-server -p 8080
```

Nyisd meg: `http://localhost:8080/api-loom/`

---

## 🎯 Opció 2: Netlify (INGYENES, egyszerű)

### Deployment lépések:

1. **Netlify fiók létrehozása:**
   - [netlify.com](https://netlify.com)
   - GitHub bejelentkezés

2. **Build beállítások:**
   ```
   Build command: npm run build:standalone
   Publish directory: dist/api-conf/browser
   ```

3. **Deploy:**
   - Netlify automatikusan buildelés minden git push után
   - URL: `https://<random-name>.netlify.app`

### `netlify.toml` konfiguráció (opcionális):

```toml
[build]
  command = "npm run build:standalone"
  publish = "dist/api-conf/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🎯 Opció 3: Vercel (INGYENES, gyors)

### Deployment lépések:

1. **Vercel fiók:**
   - [vercel.com](https://vercel.com)
   - GitHub bejelentkezés

2. **Import projekt:**
   - "New Project" > Válaszd ki a repository-t

3. **Build beállítások:**
   ```
   Framework Preset: Angular
   Build Command: npm run build:standalone
   Output Directory: dist/api-conf/browser
   ```

4. **Deploy:**
   - Vercel automatikusan buildelés minden push után
   - URL: `https://<project-name>.vercel.app`

---

## 🎯 Opció 4: Saját szerver (pl. Apache/Nginx)

### Build:

```bash
npm run build:standalone
```

### Apache konfiguráció:

```apache
<VirtualHost *:80>
    ServerName api-loom.example.com
    DocumentRoot /var/www/api-loom

    <Directory /var/www/api-loom>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # Angular routing támogatás
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### Nginx konfiguráció:

```nginx
server {
    listen 80;
    server_name api-loom.example.com;

    root /var/www/api-loom;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Fájlok másolása:

```bash
npm run build:standalone
scp -r dist/api-conf/browser/* user@server:/var/www/api-loom/
```

---

## 📝 Fontos tudnivalók

### ✅ Mit csinál a standalone verzió:
- ❌ **Nincs Keycloak authentication** (nincs bejelentkezés)
- ❌ **Nincs backend szinkronizálás**
- ✅ **Teljes localStorage működés**
- ✅ **Swagger/OpenAPI szerkesztés lokálisan**
- ✅ **Import/Export működik**

### 🔧 Ha mégis kellene Keycloak/backend:
A normál build használd:
```bash
npm run build
```

És deployold backend-del együtt.

---

## 🐛 Hibaelhárítás

### Problem: "404 Not Found" oldal újratöltéskor
**Megoldás:** SPA routing beállítás hiányzik
- GitHub Pages: `404.html` másolása `index.html`-ből
- Netlify/Vercel: automatikusan kezeli

### Problem: "assets not loading"
**Megoldás:** `--base-href` hibás
```bash
npm run build:standalone -- --base-href /
```

### Problem: localStorage nem működik
**Megoldás:** HTTPS kell (ne használd `file://`)
```bash
npx http-server dist/api-conf/browser
```

---

## 📊 Összehasonlítás

| Opció         | Ár      | Sebesség | Egyszerűség | HTTPS | CI/CD |
|---------------|---------|----------|-------------|-------|-------|
| GitHub Pages  | INGYENES | ⭐⭐⭐    | ⭐⭐⭐⭐      | ✅     | ✅     |
| Netlify       | INGYENES | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐    | ✅     | ✅     |
| Vercel        | INGYENES | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐    | ✅     | ✅     |
| Saját szerver | $$      | ⭐⭐⭐    | ⭐⭐         | 🔧    | 🔧    |

---

## 🎉 Összegzés

**Legegyszerűbb:** GitHub Pages (már be van állítva!)
```bash
git push origin main
# Kész! 🚀
```

**Leggyorsabb:** Netlify vagy Vercel
- Drag & drop `dist/api-conf/browser` mappát

**Legnagyobb kontroll:** Saját szerver
- Teljes beállítási szabadság
