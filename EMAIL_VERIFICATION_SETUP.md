# Email Verification System Setup Guide

## Overview
This document outlines the email verification system that requires users to verify their email address before accessing the platform. The system uses verification tokens with 24-hour expiry and Nodemailer for email delivery.

## System Architecture

### Backend Components

#### 1. **User Model** (`backend/models/User.js`)
Added three new fields to track email verification:
- `emailVerified` (Boolean, default: false) - Tracks if user has verified their email
- `verificationToken` (String) - Stores the verification token
- `verificationTokenExpiry` (Date) - Token expiration timestamp (24 hours from creation)

#### 2. **Authentication Controller** (`backend/controllers/authController.js`)

**Key Functions:**

- **`generateVerificationToken()`**
  - Generates a cryptographically secure 32-byte hex token
  - Used during user registration

- **`sendVerificationEmail(email, token, userName)`**
  - Sends HTML-formatted verification email
  - Includes clickable verification link: `{FRONTEND_URL}/verify-email/{token}`
  - Requires `FRONTEND_URL` environment variable

- **`register` (Modified)**
  - Creates user with `emailVerified: false`
  - Generates verification token with 24-hour expiry
  - Sends verification email
  - Returns `requiresVerification: true` flag in response
  - Does NOT auto-login user

- **`login` (Modified)**
  - Checks `emailVerified` field before allowing login
  - Returns 403 status if email not verified
  - Sets `requiresVerification: true` in error response

- **`verifyEmail(token)` (New)**
  - Validates token format and expiry
  - Marks user as verified
  - Automatically generates JWT and logs user in
  - Returns token and user data

- **`resendVerificationEmail(email)` (New)**
  - Checks if user exists and not yet verified
  - Regenerates verification token
  - Resends verification email

#### 3. **Authentication Routes** (`backend/routes/auth.js`)
- `GET /auth/verify-email/:token` - Verify email token and mark user as verified
- `POST /auth/resend-verification` - Resend verification email (request body: `{email}`)

### Frontend Components

#### 1. **VerifyEmail Page** (`frontend/src/pages/VerifyEmail.jsx`)
- Extracts token from URL parameter
- Calls `/auth/verify-email/:token` endpoint
- Displays loading, error, and success states
- Auto-redirects to home on success after 2 seconds
- Stores JWT and user data in localStorage

#### 2. **Register Page** (Modified: `frontend/src/pages/Register.jsx`)
- Detects `requiresVerification` flag in response
- Shows verification message instead of redirecting
- Displays registered email address
- Provides "Back to Login" button

#### 3. **Login Page** (Modified: `frontend/src/pages/Login.jsx`)
- Detects 403 status with `requiresVerification` flag
- Shows unverified email UI
- Offers "Resend Email" button
- Allows user to try another email

#### 4. **App Routing** (`frontend/src/App.jsx`)
- Added route: `<Route path="/verify-email/:token" element={<VerifyEmail />} />`
- Route is public and accessible without authentication

#### 5. **Styling** (`frontend/src/styles/verify-email.css`)
- Responsive card design with gradient background
- Loading spinner animation
- Success/error state styling
- Button hover effects

## Environment Variables Required

### Backend (`.env`)
```
# Email Configuration
EMAIL_SERVICE=gmail    # or your email service provider
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Use app-specific password for Gmail
FRONTEND_URL=http://localhost:5173  # URL where frontend is running
```

### Important Notes:
- **Gmail Users**: Use [App Passwords](https://myaccount.google.com/apppasswords) instead of regular password
- **FRONTEND_URL**: Must be accessible to users clicking email links
- Update FRONTEND_URL for production deployment (e.g., `https://yourdomain.com`)

## Email Verification Flow

### Registration Flow
```
1. User fills registration form
2. Submits to POST /auth/register
3. Backend creates user with emailVerified=false
4. Generates 32-byte hex token with 24-hour expiry
5. Sends email with verification link: {FRONTEND_URL}/verify-email/{token}
6. Frontend shows "Check your email" message
7. User clicks email link (valid for 24 hours)
8. Frontend extracts token and calls GET /auth/verify-email/:token
9. Backend validates token and marks user as verified
10. User is automatically logged in and redirected to home
```

### Login Flow (Unverified User)
```
1. User enters email/password
2. Submits to POST /auth/login
3. If emailVerified=false:
   - Returns 403 status
   - Sets requiresVerification=true
4. Frontend shows unverified email message
5. User can:
   - Click "Resend Email" → POST /auth/resend-verification
   - Click "Try Another Email" → Clear and try different credentials
6. After verification email arrives, user clicks link
7. User logs in normally
```

## Testing Email Verification

### Manual Testing
```bash
# 1. Start backend and frontend servers

# 2. Register a new user
# - Go to /register
# - Fill form and submit
# - See "Verify Your Email" message

# 3. Check email inbox for verification email
# - Look for email from your EMAIL_USER
# - Click verification link

# 4. Should be automatically logged in and redirected to home

# 5. Test unverified login
# - Log out
# - Try login with unverified account (before verification)
# - Should see unverified email message
# - Click "Resend Email" to get new verification email
```

### Testing Edge Cases
```
1. Expired Token (older than 24 hours)
   - Manually edit DB to set verificationTokenExpiry to past date
   - Try to verify
   - Should see error message

2. Invalid Token
   - Try /verify-email/invalidentoken
   - Should see error message

3. Already Verified User
   - User already verified can login normally
   - emailVerified=true in database
```

## Verification Status in Database

### Check User Verification Status
```bash
# MongoDB
db.users.findOne({email: "user@example.com"})

# Look for:
{
  ...other fields...,
  "emailVerified": true|false,
  "verificationToken": "hex_string_or_null",
  "verificationTokenExpiry": "ISODate(...)|null"
}
```

## Admin Considerations

### Manually Verify User (Emergency)
```javascript
// In MongoDB or admin script
db.users.updateOne(
  {email: "user@example.com"},
  {
    $set: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null
    }
  }
)
```

### Reset Verification for User
```javascript
// Invalidate current token
db.users.updateOne(
  {email: "user@example.com"},
  {
    $set: {
      emailVerified: false,
      verificationToken: null,
      verificationTokenExpiry: null
    }
  }
)
// User can then use "Resend Email" to get new token
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Email not delivered | SMTP credentials wrong | Check EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD |
| Token expired (24h+) | User took too long to verify | User clicks "Resend Email" on login page |
| Invalid token format | Corrupted/wrong token | Link in email is incorrect or token was modified |
| 403 on login with verified email | Bug or DB inconsistency | Check emailVerified field in database |
| Verification link 404 | Frontend route not registered | Verify VerifyEmail route exists in App.jsx |

## Security Considerations

1. **Token Generation**: Uses `crypto.randomBytes(32)` - cryptographically secure
2. **Token Storage**: Never transmitted in URL path (only in query params sent via email)
3. **Token Expiry**: 24 hours prevents indefinite access via old tokens
4. **No Email Bypass**: Login endpoint checks emailVerified before allowing access
5. **Resend Limit**: Consider adding rate limiting to /auth/resend-verification in production

## Production Checklist

- [ ] Set `FRONTEND_URL` to production domain
- [ ] Configure real email service (Gmail, SendGrid, AWS SES, etc.)
- [ ] Update EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD in production .env
- [ ] Test full verification flow end-to-end
- [ ] Set up email delivery monitoring
- [ ] Consider adding email verification failure logs
- [ ] Test with real users in staging environment
- [ ] Add rate limiting to resend-verification endpoint
- [ ] Monitor email bounce/spam rates

## Files Modified/Created

| File | Change |
|------|--------|
| `backend/models/User.js` | Added verification fields |
| `backend/controllers/authController.js` | Added verification logic |
| `backend/routes/auth.js` | Added verification routes |
| `frontend/src/pages/VerifyEmail.jsx` | Created verification page |
| `frontend/src/pages/Register.jsx` | Show verification message |
| `frontend/src/pages/Login.jsx` | Handle unverified email |
| `frontend/src/App.jsx` | Added VerifyEmail route |
| `frontend/src/styles/verify-email.css` | Created styling |

## Support

For issues or questions:
1. Check the error logs in backend console
2. Verify environment variables are set correctly
3. Check MongoDB database for user verification status
4. Review email provider logs (Gmail, SendGrid, etc.)
5. Test token generation with `crypto.randomBytes(32).toString('hex')`
