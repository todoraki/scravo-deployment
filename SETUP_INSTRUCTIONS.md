# 📤 GitHub Upload Instructions

## For the Project Owner (Vignesh)

### 1. Initialize Git Repository

```bash
cd "/Users/vignesh/Downloads/bits books/scravo_base1"
git init
```

### 2. Add All Files

```bash
git add .
```

### 3. Create Initial Commit

```bash
git commit -m "Initial commit: Scravo - Scrap Material Trading Platform"
```

### 4. Create Repository on GitHub

1. Go to https://github.com
2. Click "+" icon → "New repository"
3. Name: `scravo_base1`
4. Description: "Full-stack MERN app for scrap material trading"
5. Keep it **Private** (or Public if you want)
6. **Don't** initialize with README (we already have one)
7. Click "Create repository"

### 5. Link Local Repository to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/scravo_base1.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 6. Push to GitHub

```bash
git branch -M main
git push -u origin main
```

### 7. Verify Upload

Go to your GitHub repository and check if all files are uploaded.

---

## For Team Members

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/scravo_base1.git
cd scravo_base1
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 3. Setup Environment Variables

#### Backend (.env)
```bash
cd backend
touch .env
```

Add:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/scravo
JWT_SECRET=your_secret_key_here
```

### 4. Start MongoDB

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access Application

Open browser: http://localhost:5173

---

## 🔄 Pull Latest Changes

```bash
git pull origin main
```

## 🌿 Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

## 📤 Push Your Changes

```bash
git add .
git commit -m "Your commit message"
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub!
