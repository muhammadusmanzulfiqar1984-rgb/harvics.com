# 🚀 QUICK COMMANDS - How to See Your Website

## 1. Start Development Server (Local View)

```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
npm run dev
```

**Then open in browser:**
- http://localhost:3000
- http://localhost:3000/en
- http://localhost:3000/fr (French)
- http://localhost:3000/es (Spanish)

---

## 2. Build and Check Production Build

```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
npm run build
```

**After build, start production server:**
```bash
npm start
```

**Then open:** http://localhost:3000

---

## 3. See Deployment Package (After Running Deploy Script)

```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
ls -la deploy-package
```

**Or open the folder:**
```bash
open deploy-package
```

---

## 4. Check What's Running

```bash
# Check if port 3000 is in use
lsof -i :3000

# Check if port 5000 (backend) is in use
lsof -i :5000
```

---

## 5. View All Website Pages

**Main Pages:**
- Home: http://localhost:3000/en
- Products: http://localhost:3000/en/products
- About: http://localhost:3000/en/about
- Contact: http://localhost:3000/en/contact
- Portals: http://localhost:3000/en/portals

**Product Categories:**
- Confectionery: http://localhost:3000/en/products/confectionery
- Beverages: http://localhost:3000/en/products/beverages
- Snacks: http://localhost:3000/en/products/snacks
- Pasta: http://localhost:3000/en/products/pasta
- Bakery: http://localhost:3000/en/products/bakery
- Culinary: http://localhost:3000/en/products/culinary
- Frozen Foods: http://localhost:3000/en/products/frozenFoods

---

## 6. Quick Start Script (All-in-One)

```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
./START_SERVERS.sh
```

---

## 7. Stop Servers

```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
./STOP_SERVERS.sh
```

---

## 8. View Build Output

```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
npm run build 2>&1 | tee build-output.log
cat build-output.log
```

---

## 9. Check Deployment Status

```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
./deploy-to-harvics-com.sh
```

**After script completes, check:**
```bash
ls -la deploy-package/
```

