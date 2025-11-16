# 🚗 Car Rental System

A full-stack web application for managing car rentals with user, owner, and admin dashboards. Built with modern technologies including React, Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### User Features
- User registration and authentication
- Browse available cars with filtering options
- View detailed car information
- Book cars for specific dates
- Manage personal bookings
- User profile management

### Owner Features
- Owner registration and account verification
- Add and manage fleet of cars
- Track bookings for owned vehicles
- Manage car availability and pricing
- Upload car images
- View booking history

### Admin Features
- Manage all users and owners
- Approve/reject owner verification requests
- Monitor all bookings
- Manage car listings across the platform
- View analytics and platform statistics

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **ESLint** - Code linting
- **React Router** - Client-side routing
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **ImageKit** - Image hosting and optimization

### Tools & Services
- **ImageKit** - Image management
- **MongoDB Atlas** - Cloud database
- **Git/GitHub** - Version control

## 📁 Project Structure

```
Car-Rental-System/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── Admin/               # Admin dashboard components
│   │   │   ├── owner/               # Owner dashboard components
│   │   │   ├── Banner.jsx
│   │   │   ├── CarCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ...
│   │   ├── pages/                   # Page components
│   │   │   ├── Admin/               # Admin pages
│   │   │   ├── owner/               # Owner pages
│   │   │   ├── Home.jsx
│   │   │   ├── Cars.jsx
│   │   │   └── ...
│   │   ├── assets/                  # Images and SVG icons
│   │   ├── context/                 # React context
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── server/                          # Backend Node.js application
│   ├── controllers/                 # Route handlers
│   │   ├── adminController.js
│   │   ├── bookingController.js
│   │   ├── ownerController.js
│   │   ├── userController.js
│   │   └── verificationController.js
│   ├── models/                      # MongoDB schemas
│   │   ├── User.js
│   │   ├── Car.js
│   │   ├── Booking.js
│   │   └── VerificationRequest.js
│   ├── routes/                      # API routes
│   │   ├── userRoutes.js
│   │   ├── ownerRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── adminRoutes.js
│   │   └── verificationRoutes.js
│   ├── middleware/                  # Express middleware
│   │   ├── auth.js                  # Authentication middleware
│   │   └── multer.js                # File upload middleware
│   ├── configs/                     # Configuration files
│   │   ├── db.js                    # Database connection
│   │   └── imageKit.js              # ImageKit configuration
│   ├── server.js                    # Main server file
│   └── package.json
│
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas account)
- ImageKit account (for image uploads)
- Git

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
VITE_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

## ⚙️ Configuration

### MongoDB Setup
1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster and database
3. Copy the connection string and add it to your `.env` file

### ImageKit Setup
1. Create an ImageKit account at [https://imagekit.io](https://imagekit.io)
2. Get your public key, private key, and URL endpoint
3. Add these to both `.env` files

### JWT Secret
Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📦 Running the Application

### Development Mode

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm start
```
The server will run on `http://localhost:5000`

**Terminal 2 - Start Frontend Development Server:**
```bash
cd client
npm run dev
```
The frontend will run on `http://localhost:5173`

### Production Build

**Frontend:**
```bash
cd client
npm run build
```

**Backend:**
Ensure all environment variables are set and run:
```bash
cd server
npm start
```

## 🔌 API Endpoints

### User Routes
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Owner Routes
- `POST /api/owners/register` - Register as owner
- `POST /api/owners/login` - Owner login
- `GET /api/owners/dashboard` - Get owner dashboard
- `POST /api/owners/cars` - Add new car
- `GET /api/owners/cars` - Get owner's cars
- `PUT /api/owners/cars/:id` - Update car
- `DELETE /api/owners/cars/:id` - Delete car

### Booking Routes
- `POST /api/bookings/create` - Create new booking
- `GET /api/bookings/user` - Get user's bookings
- `GET /api/bookings/owner` - Get owner's bookings
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Admin Routes
- `GET /api/admin/users` - Get all users
- `GET /api/admin/owners` - Get all owners
- `DELETE /api/admin/users/:id` - Delete user
- `DELETE /api/admin/owners/:id` - Delete owner
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/cars` - Get all cars

### Verification Routes
- `POST /api/verification/submit` - Submit verification request
- `GET /api/verification/requests` - Get verification requests
- `PUT /api/verification/:id/approve` - Approve verification
- `PUT /api/verification/:id/reject` - Reject verification

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Author

- **Niku Basumatary** - Initial work

## 🙏 Acknowledgments

- React and Vite communities for excellent tools
- MongoDB for reliable database services
- ImageKit for image management solutions
- All contributors and users of this project

---

**Note:** This is a full-stack application. Make sure both frontend and backend servers are running for the application to work properly.

For issues, questions, or suggestions, please open an issue on GitHub.
