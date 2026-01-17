# GRAMS MERN Stack Project - Complete Setup Guide

## ✅ Project Status

Your complete MERN stack project is now ready! All folders and files have been created with a production-ready structure.

## 📁 Project Structure

```
grams/
├── client/                    # React frontend (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components (Login, Register, Dashboard, etc.)
│   │   ├── store/            # Zustand state management
│   │   ├── api/              # Axios API client
│   │   ├── utils/            # Utility functions
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── tailwind.config.js    # TailwindCSS configuration
│   └── .env.example          # Environment variables template
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── models/           # Database schemas (User, Grievance)
│   │   ├── controllers/      # Route handlers
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth middleware
│   │   ├── config/           # Database configuration
│   │   ├── utils/            # Utility functions
│   │   └── index.js          # Express server entry point
│   ├── package.json          # Backend dependencies
│   └── .env.example          # Environment variables template
│
├── package.json              # Root package.json (monorepo)
├── README.md                 # Project documentation
└── .gitignore               # Git ignore rules
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Install all dependencies** (run from root directory):
```bash
npm run install-all
```

This will install dependencies for root, server, and client.

### Environment Configuration

#### 1. Server Environment (.env)
Create `server/.env` file:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grams
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
```

#### 2. Client Environment (.env)
Create `client/.env` file:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### Running the Project

#### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

#### Frontend Only
```bash
npm run client
```
Access at: `http://localhost:5173`

#### Backend Only
```bash
npm run server
```
Server runs at: `http://localhost:5000`

#### Production Build
```bash
npm run build
```

## 🔐 Authentication

The project includes JWT-based authentication:
- User registration with validation
- Secure password hashing with bcryptjs
- JWT token generation and verification
- Protected routes with middleware

### Login Credentials (for testing)
After registering, use your credentials to login.

## 📊 Features

### User Features
- ✅ Register and Login
- ✅ Create Grievances
- ✅ View Personal Grievances
- ✅ Track Grievance Status
- ✅ Add Comments to Grievances
- ✅ Update Grievance Information

### Admin Features
- ✅ Dashboard with Statistics
- ✅ View All Grievances
- ✅ Filter by Status/Category
- ✅ Assign Grievances
- ✅ Manage User Roles
- ✅ View All Users

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Grievances
- `GET /api/grievances` - Get user's grievances
- `GET /api/grievances/all` - Get all grievances
- `POST /api/grievances` - Create grievance
- `GET /api/grievances/:id` - Get grievance details
- `PUT /api/grievances/:id` - Update grievance
- `DELETE /api/grievances/:id` - Delete grievance
- `POST /api/grievances/:id/comment` - Add comment

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/grievances` - Get all grievances (with filters)
- `POST /api/admin/assign-grievance` - Assign grievance
- `PUT /api/admin/user-role` - Update user role

## 🛠 Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first CSS
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Zustand** - State management

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin handling

## 📝 Project Pages

### Public Pages
- **Home** - Landing page with features overview
- **Login** - User login
- **Register** - User registration

### Protected Pages
- **Dashboard** - User's grievances and creation form
- **Admin Panel** - Admin statistics and management

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs (10 salt rounds)
- Protected API routes with middleware
- CORS configuration for security
- Environment variables for sensitive data

## 🧪 Testing the API

You can test the API using Postman or cURL:

### Example: Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'
```

### Example: Create Grievance
```bash
curl -X POST http://localhost:5000/api/grievances \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Issue","description":"Details","category":"academic","priority":"medium"}'
```

## 📚 Grievance Categories
- Academic
- Infrastructure
- Health
- Administrative
- Other

## 🎯 Priority Levels
- Low
- Medium
- High
- Critical

## 📈 Grievance Status
- Open
- In-Progress
- Resolved
- Closed
- Rejected

## 🚨 Common Issues & Solutions

### MongoDB Connection Error
- Ensure MongoDB is running locally or provide correct MongoDB Atlas URI
- Check MONGODB_URI in server/.env

### Port Already in Use
- Change PORT in server/.env or kill the process using that port

### CORS Errors
- Ensure client and server URLs match in CORS configuration
- Check VITE_API_BASE_URL in client/.env

### Module Not Found Errors
- Run `npm run install-all` again
- Delete node_modules and run `npm install`

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, Render, AWS
- **Database**: MongoDB Atlas

## 📄 License

MIT License - feel free to use this project for educational and commercial purposes.

## 🤝 Support

For issues or questions:
1. Check the error messages carefully
2. Review the API endpoints documentation
3. Ensure all environment variables are set correctly
4. Check browser console for frontend errors
5. Check server logs for backend errors

## ✨ Next Steps

1. Install dependencies: `npm run install-all`
2. Set up MongoDB (local or Atlas)
3. Create `.env` files for server and client
4. Run the project: `npm run dev`
5. Access the application at http://localhost:5173
6. Register a new account
7. Test the features

Happy coding! 🎉
