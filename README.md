# 🏛️ GRAMS - Grievance Redressal and Management System

<div align="center">

![GRAMS Banner](https://img.shields.io/badge/GRAMS-Grievance%20Management-blue?style=for-the-badge)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

**A Modern, Full-Stack Grievance Management Platform for Smart Cities**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation Guide](#-installation-guide)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [User Roles](#-user-roles)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**GRAMS** (Grievance Redressal and Management System) is a comprehensive, modern web application designed to streamline the process of managing citizen grievances in smart cities. Built with cutting-edge technologies, it provides real-time tracking, transparency, and efficient resolution of public issues.

### 🎯 Why GRAMS?

- ✅ **Real-time Tracking** - Citizens can track their complaints 24/7
- ✅ **Complete Transparency** - Public dashboard with budget allocation
- ✅ **Multi-role System** - Separate dashboards for Citizens, Engineers, and Admins
- ✅ **Performance Analytics** - Data-driven insights and reporting
- ✅ **Smart Assignment** - Automated grievance assignment to engineers
- ✅ **Budget Management** - Track expenses and resource allocation

---

## 🚀 Key Features

### 👥 For Citizens
- 📝 **File Grievances** - Submit complaints with images, location, and priority
- 🔍 **Track Complaints** - Real-time status updates with tracking ID
- 📊 **Transparency Dashboard** - View all public issues and resolutions
- 💰 **Budget Tracking** - See how public funds are allocated
- ⭐ **Rate Services** - Provide feedback on resolved issues
- 📧 **Email Notifications** - Stay updated on your complaint status

### 🔧 For Engineers
- 📋 **Task Dashboard** - View assigned grievances
- ✅ **Work Management** - Start, update, and complete tasks
- 📸 **Upload Proofs** - Add before/after images via Cloudinary
- 💵 **Resource Requests** - Request materials and budget
- 📈 **Performance Metrics** - Track your resolution stats

### 👨‍💼 For Admins
- 🎯 **Assignment Control** - Assign tasks to engineers
- 📊 **Analytics Dashboard** - Comprehensive performance insights
- 👥 **User Management** - Manage citizens and engineers
- 💰 **Budget Oversight** - Approve expenses and allocations
- 🔔 **Escalation Management** - Handle critical issues
- 📑 **Report Generation** - Weekly/Monthly PDF reports

---

## 💻 Tech Stack

### Frontend
```
⚛️  React 18           - UI Framework
🎨  Tailwind CSS       - Styling
🎭  Framer Motion      - Animations
🗺️  Leaflet            - Map Integration
🧭  React Router       - Navigation
🐻  Zustand            - State Management
🔥  React Hot Toast    - Notifications
```

### Backend
```
🟢  Node.js            - Runtime
🚂  Express            - Web Framework
🍃  MongoDB            - Database
🔐  JWT                - Authentication
☁️  Cloudinary         - Image Storage
📧  Nodemailer         - Email Service
🔒  Bcrypt             - Password Hashing
```

### DevOps & Tools
```
⚡  Vite               - Build Tool
🐙  Git                - Version Control
📦  npm                - Package Manager
🔧  ESLint             - Code Quality
```

---

## 📁 Project Structure

```
GRAMS/
├── 📂 client/                    # Frontend Application
│   ├── 📂 public/                # Static assets
│   ├── 📂 src/
│   │   ├── 📂 admin/             # Admin dashboard components
│   │   ├── 📂 engineer/          # Engineer dashboard components
│   │   ├── 📂 components/        # Reusable components
│   │   ├── 📂 pages/             # Page components
│   │   ├── 📂 Services/          # API services
│   │   │   └── 📂 operations/    # API operations
│   │   ├── 📂 store/             # Zustand store
│   │   ├── 📂 config/            # Configuration files
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── 📂 server/                    # Backend Application
│   ├── 📂 src/
│   │   ├── 📂 controllers/       # Route controllers
│   │   ├── 📂 models/            # MongoDB models
│   │   ├── 📂 routes/            # API routes
│   │   ├── 📂 middleware/        # Custom middleware
│   │   ├── 📂 config/            # Configuration
│   │   ├── 📂 mail/              # Email templates
│   │   └── index.js              # Server entry point
│   ├── 📂 reports/               # Generated PDF reports
│   └── package.json
│
└── README.md                     # You are here! 📍
```

---

## 🛠️ Installation Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- ✅ **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- ✅ **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **npm** or **yarn** - Comes with Node.js

### Step 1: Clone the Repository

```bash
git clone https://github.com/jamunesh15/GRAMS.git
cd GRAMS
```

### Step 2: Install Dependencies

#### Backend Setup
```bash
cd server
npm install
```

#### Frontend Setup
```bash
cd ../client
npm install
```

---

## 🔐 Environment Setup

### Backend Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/grams
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/grams

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Email Configuration (Gmail)
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-specific-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the `client` directory:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Firebase Configuration (if using)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

---

## 🚀 Running the Application

### Option 1: Run Both Servers Separately

#### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```
Server will start at: `http://localhost:5000`

#### Terminal 2 - Frontend Server
```bash
cd client
npm run dev
```
Frontend will start at: `http://localhost:5173`

### Option 2: Use Batch Scripts (Windows)

#### Backend
```bash
cd server
./start.bat
```

#### Frontend
```bash
cd client
./start.bat
```

### Option 3: Use Shell Scripts (Linux/Mac)

```bash
# Backend
cd server
chmod +x start.sh
./start.sh

# Frontend
cd client
chmod +x start.sh
./start.sh
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/logout` | User logout | ✅ |
| GET | `/auth/me` | Get current user | ✅ |
| PUT | `/auth/update-profile` | Update profile | ✅ |
| POST | `/auth/forgot-password` | Request password reset | ❌ |
| POST | `/auth/reset-password` | Reset password | ❌ |

### Grievance Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/grievances` | Get user grievances | ✅ |
| GET | `/grievances/all` | Get all grievances | ✅ |
| GET | `/grievances/:id` | Get grievance by ID | ✅ |
| POST | `/grievances` | Create grievance | ✅ |
| PUT | `/grievances/:id` | Update grievance | ✅ |
| DELETE | `/grievances/:id` | Delete grievance | ✅ |
| POST | `/grievances/:id/comment` | Add comment | ✅ |
| GET | `/grievances/track/:trackingId` | Track by ID | ❌ |

### Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/analytics/resolution-time` | Resolution time stats | ✅ |
| GET | `/analytics/engineer-performance` | Engineer metrics | ✅ |
| GET | `/analytics/status-analysis` | Status distribution | ✅ |
| GET | `/analytics/area-analysis` | Ward-wise analysis | ✅ |
| GET | `/analytics/backlog-analysis` | Backlog aging | ✅ |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/dashboard` | Dashboard stats | ✅ (Admin) |
| GET | `/admin/users` | Get all users | ✅ (Admin) |
| POST | `/admin/assign-grievance` | Assign to engineer | ✅ (Admin) |
| PUT | `/admin/user-role` | Update user role | ✅ (Admin) |
| PUT | `/admin/grievance-status` | Update status | ✅ (Admin) |

---

## 👥 User Roles

### 🙋 Citizen (Default)
- Register and login
- File grievances
- Track complaints
- View transparency data
- Receive email updates

### 👷 Engineer
- All citizen permissions
- View assigned tasks
- Update task status
- Upload work proofs
- Request resources

### 👨‍💼 Admin
- All engineer permissions
- Assign grievances
- Manage users
- View analytics
- Generate reports
- Budget management

---

## 📸 Screenshots

### 🏠 Home Page
![Home Page](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=GRAMS+Home+Page)
*Modern landing page with animated components*

### 📊 Performance Dashboard
![Performance Dashboard](https://via.placeholder.com/800x400/10B981/FFFFFF?text=Real-time+Analytics)
*Real-time analytics with category and ward-wise performance*

### 📝 File Grievance
![File Grievance](https://via.placeholder.com/800x400/F59E0B/FFFFFF?text=File+Complaint)
*User-friendly complaint submission form*

### 🗺️ Transparency Page
![Transparency](https://via.placeholder.com/800x400/EC4899/FFFFFF?text=Public+Transparency)
*Public dashboard showing all issues and resolutions*

---

## 🎨 Key Features Breakdown

### 🔒 Authentication System
- Email/Password authentication
- OTP verification
- JWT-based sessions
- Password reset functionality
- Role-based access control

### 📊 Real-time Dashboard
- Live grievance statistics
- Resolution time tracking
- Engineer performance metrics
- Ward-wise analysis
- Category-based breakdown

### 🗺️ Map Integration
- Interactive ward maps using Leaflet
- Location-based grievance tracking
- Geospatial data visualization

### 💰 Budget Management
- System-wide budget tracking
- Category-wise allocation
- Engineer salary management
- Expense approval workflow
- Public transparency view

### 📧 Email Notifications
- Grievance submission confirmation
- Status update notifications
- Assignment alerts
- Resolution confirmations
- Custom email templates

### 📄 Report Generation
- Weekly/Monthly PDF reports
- Performance analytics
- Budget summaries
- Downloadable documents

---

## 🔧 Development

### Code Structure

```javascript
// Example: Creating a new API endpoint

// 1. Define Model (server/src/models/Example.js)
const exampleSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});

// 2. Create Controller (server/src/controllers/exampleController.js)
exports.getExample = async (req, res) => {
  try {
    const data = await Example.find();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Define Route (server/src/routes/exampleRoutes.js)
router.get('/examples', auth, getExample);

// 4. Register Route (server/src/index.js)
app.use('/api/example', exampleRoutes);
```

### Adding New Features

1. **Backend**: Create model → controller → route
2. **Frontend**: Create API call → component → route
3. **Test**: Verify functionality
4. **Commit**: Add descriptive commit message

---

## 🧪 Testing

```bash
# Run backend tests (if implemented)
cd server
npm test

# Run frontend tests (if implemented)
cd client
npm test
```

---

## 🚀 Deployment

### Backend Deployment (Example: Railway/Render)

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Frontend Deployment (Example: Vercel/Netlify)

1. Build the project
```bash
cd client
npm run build
```

2. Deploy `dist` folder to hosting platform

### Database (MongoDB Atlas)

1. Create free cluster
2. Get connection string
3. Update `MONGO_URI` in `.env`

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a new branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Write clean, documented code
- Follow existing code style
- Test your changes
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Jamunesh**
- GitHub: [@jamunesh15](https://github.com/jamunesh15)
- Repository: [GRAMS](https://github.com/jamunesh15/GRAMS)

---

## 🙏 Acknowledgments

- React Team for the amazing framework
- MongoDB for the flexible database
- Tailwind CSS for beautiful styling
- Framer Motion for smooth animations
- All open-source contributors

---

## 📞 Support

If you encounter any issues or have questions:

1. Check existing [Issues](https://github.com/jamunesh15/GRAMS/issues)
2. Create a new issue if needed
3. Provide detailed information about the problem

---

## 🗺️ Roadmap

### ✅ Completed
- [x] User authentication system
- [x] Three-role dashboard (Citizen, Engineer, Admin)
- [x] Real-time grievance tracking
- [x] Email notifications
- [x] Performance analytics
- [x] Budget management
- [x] Report generation

### 🔄 In Progress
- [ ] Mobile application
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Advanced analytics with charts

### 📋 Planned
- [ ] AI-powered grievance categorization
- [ ] Chatbot support
- [ ] Voice complaint submission
- [ ] Integration with government databases

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

**Made with ❤️ for Smart Cities**

[Report Bug](https://github.com/jamunesh15/GRAMS/issues) • [Request Feature](https://github.com/jamunesh15/GRAMS/issues) • [Documentation](https://github.com/jamunesh15/GRAMS/wiki)

</div>
