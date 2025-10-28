# 🏢 Scravo - Scrap Material Trading Platform

A full-stack MERN application for buying and selling scrap materials. This platform connects buyers with sellers, facilitating secure transactions of recyclable materials.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Contributing](#contributing)
- [Team](#team)

## ✨ Features

### For Buyers
- 🛒 Browse marketplace with filters
- 📦 Place orders for materials
- 📍 View seller locations
- ✅ Confirm delivery after receiving materials
- 📊 Track order history

### For Sellers
- ➕ Create and manage listings
- 💼 Receive and manage offers
- 🚚 Update order status (Confirm → Ship)
- 💰 Track revenue and sales
- 📈 View listing analytics

### For Admins
- 👥 Manage all users
- 📦 Oversee all listings
- 🛒 Monitor all orders
- 📊 View platform statistics
- 🗑️ Delete users/listings

### General Features
- 🔐 Secure authentication with JWT
- 🎨 Responsive design (Mobile, Tablet, Desktop)
- 🌓 Collapsible sidebar navigation
- 📱 Mobile-friendly interface
- 🖼️ Image upload for listings
- 🔍 Search and filter functionality

## 🛠️ Tech Stack

### Frontend
- **React** (v18+) - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/scravo_base1.git
cd scravo_base1
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Add the following environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/scravo

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# File Upload Configuration
MAX_FILE_SIZE=5242880
```

### Frontend Configuration (Optional)

Create a `.env` file in the `frontend` directory if needed:

```bash
cd ../frontend
touch .env
```

Add:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🏃 Running the Application

### Start MongoDB

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Start Backend Server

```bash
cd backend
npm start
```

The backend will run on `http://localhost:5000`

### Start Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### Access the Application

Open your browser and go to: `http://localhost:5173`

## 📁 Project Structure
// Update 0
// Update 1
// Update 2
// Update 3
// Update 4
// Update 5
// Update 6
// Update 7
// Update 8
// Update 9
// Update 10
// Update 11
// Update 12
// Update 13
// Update 14
// Update 15
// Update 0
// Update 1
// Update 2
// Update 3
// Update 4
// Update 5
// Update 6
// Update 7
// Update 8
// Update 9
// Update 10
// Update 11
// Update 12
// Update 13
// Update 0
// Update 1
// Update 2
// Update 3
// Update 4
// Update 5
// Update 6
// Update 7
// Update 8
// Update 9
// Update 10
// Update 11
// Update 12
// Update 13
// Update 14
