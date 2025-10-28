# CRM Authentication System

A comprehensive CRM system with full user authentication, role management, and token expiry handling built with React, Node.js, Express, JWT, and PostgreSQL , followed with microservices architecture.

## 🚀 Features

### Authentication & Security
- **JWT-based Authentication**: Secure token-based authentication with automatic expiry handling
- **Role-Based Access Control (RBAC)**: Granular permissions system with role management
- **Token Expiry Management**: Automatic token validation and expiry handling
- **Secure API Endpoints**: Protected routes with middleware validation
- **Password Hashing**: Bcrypt password encryption for security

### User Management
- **User CRUD Operations**: Create, read, update, delete users
- **Role Assignment**: Assign multiple roles to users
- **User Activity Tracking**: Last login tracking and user status management
- **Profile Management**: User profile information and permissions display

### Role & Permission System
- **Dynamic Role Creation**: Create custom roles with specific permissions
- **Permission Groups**: Organized by modules (Users, Roles, Permissions, Dashboard)
- **Visual Permission Management**: Intuitive UI for managing role permissions
- **Role-based UI Rendering**: Menu and content visibility based on user permissions

### Modern UI/UX
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Professional Interface**: Clean, modern CRM-style interface
- **Interactive Components**: Smooth animations and micro-interactions
- **Loading States**: Proper loading indicators and error handling
- **Form Validation**: Comprehensive client-side and server-side validation

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons
- **Context API** for state management

### Backend
- **NestJS** (Node.js) with **TypeScript**
- **Prisma ORM** with **PostgreSQL**
- **JWT** for authentication, **Passport** strategies
- **Bcrypt** for password hashing
- **class-validator** for DTO validation
- **Helmet**, **CORS**, **Rate Limiting** via Nest middleware/interceptors
- **Morgan-like logging** via interceptor

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd crm-authentication-system
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd server
npm install
```

### 3. Database Setup

1. Create a PostgreSQL database named `crm_db`
2. Update the database configuration in `server/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_db
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 4. Start the Application

#### Start Backend Server (NestJS)
```bash
npm --prefix api run start:dev
```
The backend server will run on `http://localhost:3001` (base path `/api`).

#### Start Frontend Development Server
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## 🔐 Default Login Credentials

After the initial setup, use these credentials to log in:

- **Email**: admin@crm.com
- **Password**: admin123

## 📊 Database Schema

### Users Table
- id (Primary Key)
- email (Unique)
- password (Hashed)
- firstName
- lastName
- isActive
- lastLogin
- createdAt, updatedAt

### Roles Table
- id (Primary Key)
- name (Unique)
- description
- isActive
- createdAt, updatedAt

### Permissions Table
- id (Primary Key)
- name
- key (Unique)
- description
- module
- createdAt, updatedAt

### Junction Tables
- user_roles (Many-to-Many: Users ↔ Roles)
- role_permissions (Many-to-Many: Roles ↔ Permissions)

## 🔒 Security Features

### API Security
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Server-side validation using Express Validator
- **SQL Injection Prevention**: Sequelize ORM provides protection
- **XSS Protection**: Proper input sanitization

### Authentication Security
- **JWT Tokens**: Stateless authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Token Expiry**: Automatic token expiration
- **Secure Headers**: Authentication headers
- **Session Management**: Proper logout and token cleanup

## 🚦 API Endpoints

### Authentication Routes
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User Management Routes
- `GET /api/users` - Get all users (requires: user.read)
- `POST /api/users` - Create user (requires: user.create)

### Role Management Routes
- `GET /api/roles` - Get all roles (requires: role.read)
- `POST /api/roles` - Create role (requires: role.create)
- `GET /api/permissions` - Get all permissions (requires: permission.read)
- `PUT /api/users/:userId/role` - Assign role to user (requires: user.update)

## 🎯 Permission System

### Default Permissions
- **Users Module**: user.read, user.create, user.update, user.delete
- **Roles Module**: role.read, role.create, role.update, role.delete
- **Permissions Module**: permission.read
- **Dashboard Module**: dashboard.read

### Default Roles
- **Admin**: Full system access with all permissions
- **User**: Limited access with basic permissions (dashboard.read, user.read)

## 🔄 Development Workflow

### Adding New Features
1. Define new permissions in the permissions seeder
2. Create API endpoints with proper middleware protection
3. Add frontend components with permission checks
4. Update the UI to conditionally render based on permissions

### Testing Authentication
1. Log in with admin credentials
2. Test role-based access to different pages
3. Verify token expiry handling
4. Test logout functionality

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray shades

### Typography
- **Headings**: Inter font family with proper hierarchy
- **Body**: 150% line height for readability
- **Labels**: 120% line height for headings

## 🚀 Production Deployment

### Environment Variables
Update production environment variables:
```env
NODE_ENV=production
JWT_SECRET=strong-production-secret
DB_HOST=production-db-host
CORS_ORIGINS=https://yourdomain.com
```

### Build Commands
```bash
# Build frontend
npm run build

# Build backend
cd server
npm run build
```

### Database Migration
Ensure PostgreSQL is set up in production and run:
```bash
npm --prefix api run prisma:migrate
npm --prefix api run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database `crm_db` exists

2. **Token Expiry Issues**
   - Check JWT_SECRET configuration
   - Verify system time is correct
   - Clear browser localStorage if needed

3. **Permission Denied Errors**
   - Verify user has been assigned appropriate roles
   - Check if permissions are properly seeded
   - Confirm API endpoints have correct middleware

4. **CORS Errors**
   - Update CORS configuration in server
   - Verify frontend URL is whitelisted
   - Check if credentials are being sent

## 📞 Support

For support, please create an issue in the repository or contact the development team.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Express.js for the web framework
- Sequelize for the ORM
- JWT for secure authentication