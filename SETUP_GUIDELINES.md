# Read Colab - Smart Office Library

A modern, AI-enabled smart office library management platform built with React, TypeScript, Node.js, and PostgreSQL. Read Colab provides a comprehensive solution for managing books, borrowing, reservations, and AI-powered recommendations in a professional office environment.

## 🎯 Features

- **Book Management**: Add, update, and manage books with covers and metadata
- **Borrowing System**: Request and track book borrowings with due dates
- **Reservations**: Reserve books that are currently unavailable
- **AI-Powered Recommendations**: Get intelligent book suggestions using GitHub Models API
- **User Reviews & Ratings**: Leave and view book reviews with ratings
- **Wishlist Management**: Save books to personal wishlists
- **Analytics Dashboard**: Track library statistics and borrowing trends
- **QR Code Generation**: Generate QR codes for books linking to details page
- **Notifications**: Real-time notifications for library activities
- **Admin Dashboard**: Manage users, approvals, and library operations
- **Dark/Light Theme**: Fully responsive with theme switching support
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **PostgreSQL**: v13.0 or higher ([Download](https://www.postgresql.org/download/))
- **Git**: For version control ([Download](https://git-scm.com/))

### System Requirements

- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: At least 2GB free space
- **OS**: macOS, Linux, or Windows with WSL2

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Book
```

### 2. Install Dependencies

#### Backend Dependencies

```bash
cd backend
npm install
```

#### Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/read_colab

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secrets
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_change_in_production
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# AI Service Configuration
AI_PROVIDER=github
GITHUB_MODELS_API_KEY=your_github_models_api_key_here

# App Configuration
APP_URL=http://localhost:5175
APP_NAME=Read Colab
LOG_LEVEL=info

# Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

#### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000/api/v1

# App Configuration
VITE_APP_NAME=Read Colab
VITE_APP_URL=http://localhost:5175
```

### 4. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE read_colab;

# Create a user (optional)
CREATE USER read_colab_user WITH PASSWORD 'your_secure_password';

# Grant privileges
ALTER ROLE read_colab_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE read_colab TO read_colab_user;

# Exit psql
\q
```

#### Run Database Migrations

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

#### Seed the Database (Optional)

```bash
cd backend
# If you have a seed script
npm run seed
```

## 🏃 Running the Application

### Option 1: Run Backend and Frontend Separately

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

**Expected Output:**
```
[INFO] Server running on http://127.0.0.1:5000
[INFO] AI Service initialized with provider: GitHub Models
```

#### Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5175`

**Expected Output:**
```
  VITE v8.1.5  ready in 234 ms

  ➜  Local:   http://localhost:5175/
  ➜  press h to show help
```

### Option 2: Run Both in Parallel (if you have a root package.json)

```bash
npm run dev
```

## 📦 Available Scripts

### Backend Scripts

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test

# Database migrations
npx prisma migrate dev     # Create and run migrations
npx prisma migrate deploy  # Run migrations in production
npx prisma studio         # Open Prisma Studio (GUI database browser)

# Notification testing
npm run test:notifications
npm run smoke:notifications
```

### Frontend Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run type checking
npm run type-check

# Run linter
npm run lint

# Type-check and build
npm run build:typescript
```

## 🔐 Authentication

### Default Test Credentials

The application includes demo credentials for testing:

```
Email: admin@example.com
Password: password
Role: ADMIN

Email: user@example.com
Password: password
Role: USER
```

**Note:** Change these credentials in production!

### User Roles

- **ADMIN**: Full access to all features and admin dashboard
- **SUPER_ADMIN**: System administrator with elevated privileges
- **USER**: Regular user with standard library access

## 🌳 Project Structure

```
Book/
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Express app setup
│   │   ├── server.ts              # Server entry point
│   │   ├── admin/                 # Admin operations
│   │   ├── ai/                    # AI integration (recommendations, chat)
│   │   ├── analytics/             # Analytics and statistics
│   │   ├── auth/                  # Authentication (JWT, passwords)
│   │   ├── books/                 # Book management
│   │   ├── borrow/                # Borrowing operations
│   │   ├── common/                # Shared utilities
│   │   ├── config/                # Configuration files
│   │   ├── middleware/            # Express middleware
│   │   ├── notifications/         # Notification system
│   │   ├── repositories/          # Data access layer
│   │   ├── reservation/           # Book reservations
│   │   ├── review/                # Reviews and ratings
│   │   ├── users/                 # User management
│   │   ├── wishlist/              # Wishlist functionality
│   │   └── routes/                # API routes
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Database migrations
│   ├── uploads/                   # Book cover uploads
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                       # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx               # React entry point
│   │   ├── api/                   # API client and endpoints
│   │   ├── components/            # Reusable React components
│   │   ├── context/               # React Context for state
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── layouts/               # Layout components
│   │   ├── pages/                 # Page components
│   │   ├── routes/                # Route definitions
│   │   ├── services/              # Business logic services
│   │   ├── theme/                 # Material-UI theme
│   │   ├── types/                 # TypeScript type definitions
│   │   ├── utils/                 # Utility functions
│   │   ├── index.css              # Global styles
│   │   └── vite-env.d.ts          # Vite environment types
│   ├── public/                    # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env                       # Environment variables
│
├── SPECIFICATIONS.md              # Detailed specifications
├── AI_ARCHITECTURE_SUMMARY.md     # AI integration details
├── BOOK_MODULE.md                 # Book management details
├── AUTHENTICATION_IMPLEMENTATION.md
├── LIBRARY_OPERATIONS.md
└── README.md                      # This file
```

## 🛠 Technology Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Available at `/api/v1/docs` (if Swagger is configured)
- **AI Integration**: GitHub Models API
- **Real-time**: Socket.io (for notifications)

### Frontend

- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5+
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Routing**: React Router v6+
- **Theme**: Custom Material-UI theme with dark/light modes
- **Form Handling**: React Hook Form
- **Validation**: Zod

## 🔑 API Endpoints

### Authentication

```
POST   /api/v1/auth/register        # Register new user
POST   /api/v1/auth/login           # Login user
POST   /api/v1/auth/refresh-token   # Refresh JWT token
POST   /api/v1/auth/logout          # Logout user
```

### Books

```
GET    /api/v1/books                # List all books
GET    /api/v1/books/:id            # Get book details
POST   /api/v1/books                # Create new book (admin)
PUT    /api/v1/books/:id            # Update book (admin)
DELETE /api/v1/books/:id            # Delete book (admin)
POST   /api/v1/books/:id/cover      # Upload book cover
DELETE /api/v1/books/:id/cover      # Remove book cover
POST   /api/v1/books/:id/qr-code    # Generate QR code
```

### Borrowing

```
POST   /api/v1/borrow/request       # Request to borrow book
GET    /api/v1/borrow/active        # Get active borrows
GET    /api/v1/borrow/history       # Get borrow history
POST   /api/v1/borrow/:id/return    # Return borrowed book
GET    /api/v1/borrow/user/due-soon # Get books due soon
```

### Reservations

```
POST   /api/v1/reservation          # Reserve a book
GET    /api/v1/reservation          # Get user reservations
DELETE /api/v1/reservation/:id      # Cancel reservation
```

### Reviews

```
POST   /api/v1/reviews              # Create review
GET    /api/v1/books/:id/reviews    # Get book reviews
PUT    /api/v1/reviews/:id          # Update review
DELETE /api/v1/reviews/:id          # Delete review
GET    /api/v1/books/:id/rating     # Get average rating
```

### AI Endpoints

```
POST   /api/v1/ai/chat              # Chat with AI assistant
POST   /api/v1/ai/recommendations   # Get book recommendations
POST   /api/v1/ai/summarize         # Summarize book
POST   /api/v1/ai/compare           # Compare books
POST   /api/v1/ai/search            # Semantic search
```

### Analytics

```
GET    /api/v1/analytics/stats                    # Overall statistics
GET    /api/v1/analytics/user-stats               # User statistics
GET    /api/v1/analytics/trending-books           # Trending books
GET    /api/v1/analytics/borrows/status-distribution
GET    /api/v1/analytics/borrows/due-soon         # Due soon analysis
GET    /api/v1/analytics/wishlist/count           # Wishlist analytics
GET    /api/v1/analytics/activity/recent          # Recent activities
```

### Notifications

```
GET    /api/v1/notifications                  # Get notifications
GET    /api/v1/notifications/unread-count     # Get unread count
PUT    /api/v1/notifications/:id/read         # Mark as read
```

### Wishlist

```
POST   /api/v1/wishlist                       # Add to wishlist
DELETE /api/v1/wishlist/:bookId               # Remove from wishlist
GET    /api/v1/wishlist/book/:bookId/status   # Check if in wishlist
GET    /api/v1/wishlist                       # Get user wishlist
```

## 🌐 Accessing the Application

### Frontend

Open your browser and navigate to:
```
http://localhost:5175
```

### Backend API

Base URL:
```
http://localhost:5000/api/v1
```

Health Check:
```
curl http://localhost:5000/health
```

## 📝 Testing

### Manual Testing

1. **Register a new account** at `/register`
2. **Login** with credentials at `/login`
3. **Browse books** on the home page
4. **Perform library operations**: borrow, reserve, review
5. **Test AI features**: recommendations, chat
6. **Admin testing**: Access admin dashboard and manage content

### Automated Testing

```bash
# Backend tests
cd backend
npm test

# Notification integration test
npm run test:notifications

# Smoke flow test
npm run smoke:notifications
```

## 🐛 Troubleshooting

### Common Issues

#### 1. **Port Already in Use**

If port 5000 or 5175 is already in use:

```bash
# macOS/Linux - Find and kill process using port 5000
lsof -i :5000
kill -9 <PID>

# Or change the port in your .env file
PORT=5001
```

#### 2. **Database Connection Error**

```bash
# Verify PostgreSQL is running
psql -U postgres

# Check DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@localhost:5432/read_colab

# Run migrations
cd backend
npx prisma migrate deploy
```

#### 3. **CORS Errors**

Ensure the frontend `.env` has the correct backend URL:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

#### 4. **npm Dependencies Issues**

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 5. **TypeScript Compilation Errors**

```bash
# Type checking
npm run type-check

# Rebuild
npm run build
```

#### 6. **Hot Reload Not Working**

```bash
# Restart dev server
Ctrl+C
npm run dev
```

#### 7. **AI API Rate Limiting**

The GitHub Models API has rate limits. If you see:
```
Error: GitHub Models API error: 429 Too Many Requests
```

Wait a while before making new requests. The app gracefully handles rate limits with fallback messages.

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Passwords**: Change default test passwords in production
3. **JWT Secrets**: Use strong, randomly generated secrets
4. **Database**: Restrict PostgreSQL access to localhost in development
5. **CORS**: Configure proper CORS origins for production
6. **API Keys**: Keep GitHub Models API key secure and regenerate if exposed

## 📱 Responsive Design

The application is fully responsive and tested on:

- **Desktop**: 1920px, 1440px, 1024px
- **Tablet**: 768px (iPad, Android tablets)
- **Mobile**: 375px, 414px (iPhone, Android phones)
- **Ultra-wide**: 2560px and above

## 🎨 Theme Customization

The application supports light and dark themes. Customize the theme in:

```
frontend/src/theme/theme.ts
```

## 📊 Performance

- **Backend**: Optimized queries, caching, and pagination
- **Frontend**: Code splitting, lazy loading, and optimized bundle size
- **Database**: Indexed queries and efficient schema design

## 🚀 Production Deployment

### Backend Deployment

```bash
cd backend

# Build
npm run build

# Start production server
NODE_ENV=production npm start
```

### Frontend Deployment

```bash
cd frontend

# Build
npm run build

# The dist/ folder contains production-ready files
# Deploy to Vercel, Netlify, or your server
```

## 📚 Additional Resources

- [Read Colab Specifications](./SPECIFICATIONS.md)
- [AI Architecture Guide](./AI_ARCHITECTURE_SUMMARY.md)
- [Book Module Details](./BOOK_MODULE.md)
- [Authentication Implementation](./AUTHENTICATION_IMPLEMENTATION.md)
- [Library Operations](./LIBRARY_OPERATIONS.md)

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For issues, questions, or suggestions, please open an issue on the repository or contact the development team.

## 🎯 Next Steps

1. **First Run**: Follow the Quick Start section above
2. **Database**: Ensure PostgreSQL is running with the correct credentials
3. **Environment**: Set up `.env` files in both frontend and backend
4. **Development**: Start with `npm run dev` in both directories
5. **Testing**: Verify the application is working by testing basic flows
6. **Customization**: Modify themes, add features, or deploy to production

---

**Happy Reading with Read Colab! 📖✨**

Last Updated: July 2026
