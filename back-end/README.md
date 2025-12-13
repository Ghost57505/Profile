# Social Security ID.me Authentication Backend

A complete Node.js/Express backend for the Social Security ID.me authentication system.

## Features

- **Email/Password Authentication** - Sign in with email and password
- **Multi-Factor Authentication (MFA)** - 6-digit code sent via email
- **Identity Verification** - Upload and validate ID documents
- **Personal Information Management** - Store and manage user identity information
- **Document Management** - Handle ID front/back image uploads
- **Account Security** - Login attempt limiting, account locking, password reset
- **Audit Logging** - Track all authentication events
- **JWT Token Authentication** - Secure API endpoints with JWT tokens

## Prerequisites

- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   cd back-end
   npm install
   ```

2. **Setup environment variables:**
   - Copy `.env.example` to `.env`
   - Configure the following variables:
     ```
     PORT=5000
     NODE_ENV=development
     MONGODB_URI=mongodb://localhost:27017/social-security-auth
     JWT_SECRET=your_secure_secret_key
     EMAIL_SERVICE=gmail
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASSWORD=your_app_password
     CORS_ORIGIN=http://localhost:3000
     ```

3. **Start MongoDB:**
   ```bash
   mongod
   ```

4. **Run the server:**
   ```bash
   npm start          # Production mode
   npm run dev        # Development mode with nodemon
   ```

## API Endpoints

### Authentication

#### Sign In
```
POST /api/auth/signin
Body: {
  "user": "email@example.com",
  "key": "password"
}
Response: {
  "message": "Verification code sent to your email",
  "userId": "...",
  "requiresMFA": true
}
```

#### Verify MFA Code
```
POST /api/auth/auth_code
Body: {
  "code": "123456",
  "userId": "..."
}
Response: {
  "message": "MFA verified successfully",
  "token": "jwt_token",
  "user": { ... }
}
```

#### Upload ID Front
```
POST /api/auth/auth_id_front
Headers: {
  "Authorization": "Bearer jwt_token"
}
Body: FormData with 'front' file field
Response: {
  "message": "ID front uploaded successfully",
  "file": { ... }
}
```

#### Upload ID Back
```
POST /api/auth/auth_id_back
Headers: {
  "Authorization": "Bearer jwt_token"
}
Body: FormData with 'back' file field
```

#### Submit Personal Information
```
POST /api/auth/auth_info
Headers: {
  "Authorization": "Bearer jwt_token"
}
Body: {
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15",
  "address": "123 Main St",
  "city": "Anytown",
  "state": "NY",
  "zipCode": "12345"
}
```

#### Submit ITIN
```
POST /api/auth/auth_itin
Headers: {
  "Authorization": "Bearer jwt_token"
}
Body: {
  "itin": "123-45-6789"
}
```

#### Submit SSN
```
POST /api/auth/auth_ssn
Headers: {
  "Authorization": "Bearer jwt_token"
}
Body: {
  "ssn": "123-45-6789"
}
Response: {
  "message": "Identity verification completed successfully",
  "user": { ... }
}
```

#### Get Current User
```
GET /api/auth/me
Headers: {
  "Authorization": "Bearer jwt_token"
}
```

#### Get Verification Status
```
GET /api/auth/verification-status
Headers: {
  "Authorization": "Bearer jwt_token"
}
Response: {
  "verificationStage": 3,
  "mfaVerified": true,
  "identityVerified": false,
  "hasFrontDocument": true,
  "hasBackDocument": true,
  "hasPersonalInfo": false
}
```

#### Resend MFA Code
```
POST /api/auth/resend-mfa
Body: {
  "email": "email@example.com"
}
```

#### Request Password Reset
```
POST /api/auth/reset-password-request
Body: {
  "email": "email@example.com"
}
```

#### Logout
```
POST /api/auth/logout
Headers: {
  "Authorization": "Bearer jwt_token"
}
```

## Verification Stages

- **Stage 0**: Email/Password verified
- **Stage 1**: MFA code verified
- **Stage 2**: ID front document uploaded
- **Stage 3**: ID back document uploaded
- **Stage 4**: Personal information submitted
- **Stage 5**: SSN verified (Full identity verification complete)

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Account locking after 5 failed login attempts
- 30-minute lockout period
- MFA code expiration (10 minutes)
- Audit logging for all actions
- File upload validation
- Input validation and sanitization
- CORS protection

## Project Structure

```
back-end/
├── config/           # Configuration files (database, email)
├── controllers/      # Route controllers
├── models/          # MongoDB schemas (User, MFA, AuditLog)
├── routes/          # API route definitions
├── middleware/      # Authentication, validation, error handling
├── utils/           # Utility functions (tokens, file upload config)
├── uploads/         # User uploaded files
├── server.js        # Main server file
├── package.json     # Dependencies
└── .env             # Environment variables
```

## Environment Variables

See `.env.example` for all available options.

## Development Notes

- MongoDB must be running for the application to start
- Email functionality requires proper SMTP credentials
- JWT secret should be changed in production
- Sensitive data (SSN, ITIN) should be encrypted before storage in production
- File uploads are stored locally; consider cloud storage (AWS S3) for production

## Testing

Run tests with:
```bash
npm test
```

## License

ISC
