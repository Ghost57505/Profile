# Complete Image & File Retrieval System

## ✅ YES - All Images, Files, and Strings Can Be Retrieved in Raw Form

Every image uploaded, file, string, and code from the frontend is now available on the backend in its raw, original state and can be retrieved.

---

## What's Captured & Stored

### 1. Image Files (Uploaded Documents)
**Original Upload**:
```
User uploads: ID front image (JPG, PNG, GIF, etc.)
```

**What Happens**:
- ✅ File is saved to `/uploads/` directory with timestamp
- ✅ Original filename is recorded
- ✅ File size is recorded
- ✅ MIME type is recorded
- ✅ Upload path is recorded
- ✅ User ID and timestamp are logged

**Stored Data**:
```
Filename: front-1705329000000-123456789.jpg
Path: ./uploads/front-1705329000000-123456789.jpg
Size: 245678 bytes
MIME Type: image/jpeg
Uploaded By: 507f1f77bcf86cd799439011
Uploaded At: 2024-01-15T10:35:00Z
```

---

## How to Retrieve Everything

### OPTION 1: Get Image Metadata from Audit Logs
```bash
# Get all document uploads for a user
curl -X GET "http://localhost:5000/api/auth/logs/action/DOCUMENT_UPLOAD_FRONT" \
  -H "Authorization: Bearer {token}"

Response:
{
  "total": 15,
  "logs": [
    {
      "action": "DOCUMENT_UPLOAD_FRONT",
      "documentFilename": "front-1705329000000-123456789.jpg",
      "documentPath": "./uploads/front-1705329000000-123456789.jpg",
      "documentSize": 245678,
      "documentMimetype": "image/jpeg",
      "userId": "507f1f77bcf86cd799439011",
      "createdAt": "2024-01-15T10:35:00Z"
    }
  ]
}
```

### OPTION 2: Get All User Documents & Upload History
```bash
# Get all documents uploaded by a specific user
curl -X GET "http://localhost:5000/api/auth/user-documents/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer {token}"

Response:
{
  "userId": "507f1f77bcf86cd799439011",
  "user": {
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "documents": {
    "front": {
      "filename": "front-1705329000000-123456789.jpg",
      "path": "/uploads/front-1705329000000-123456789.jpg",
      "uploadedAt": "2024-01-15T10:35:00Z"
    },
    "back": {
      "filename": "back-1705329060000-987654321.jpg",
      "path": "/uploads/back-1705329060000-987654321.jpg",
      "uploadedAt": "2024-01-15T10:36:00Z"
    }
  },
  "uploadHistory": [
    {
      "action": "DOCUMENT_UPLOAD_FRONT",
      "filename": "front-1705329000000-123456789.jpg",
      "path": "./uploads/front-1705329000000-123456789.jpg",
      "size": 245678,
      "mimeType": "image/jpeg",
      "uploadedAt": "2024-01-15T10:35:00Z"
    },
    {
      "action": "DOCUMENT_UPLOAD_BACK",
      "filename": "back-1705329060000-987654321.jpg",
      "path": "./uploads/back-1705329060000-987654321.jpg",
      "size": 234567,
      "mimeType": "image/jpeg",
      "uploadedAt": "2024-01-15T10:36:00Z"
    }
  ]
}
```

### OPTION 3: Retrieve the Actual Image File
```bash
# Download the actual image from the backend
curl -X GET "http://localhost:5000/api/auth/uploads/front-1705329000000-123456789.jpg" \
  --output downloaded-image.jpg

# The actual image file is now downloaded to your computer
# You can open it, view it, process it, analyze it, etc.
```

---

## All Retrievable Data by Category

### Images & Documents
| Data | Logged? | Raw Access? | Retrieve Via |
|------|---------|-------------|--------------|
| ID Front Image | ✅ YES | ✅ YES (file download) | `/api/auth/uploads/{filename}` |
| ID Back Image | ✅ YES | ✅ YES (file download) | `/api/auth/uploads/{filename}` |
| Image Filename | ✅ YES | ✅ YES | `/api/auth/logs/action/DOCUMENT_UPLOAD_FRONT` |
| Image Size | ✅ YES | ✅ YES | `/api/auth/logs/action/DOCUMENT_UPLOAD_FRONT` |
| Image MIME Type | ✅ YES | ✅ YES | `/api/auth/logs/action/DOCUMENT_UPLOAD_FRONT` |
| Upload Path | ✅ YES | ✅ YES | `/api/auth/user-documents/{userId}` |
| Upload Timestamp | ✅ YES | ✅ YES | `/api/auth/logs/date-range` |

### Text Strings & Codes
| Data | Logged? | Raw Access? | Retrieve Via |
|------|---------|-------------|--------------|
| Email | ✅ YES | ✅ YES | `/api/auth/logs/user/{userId}` |
| Password | ✅ YES | ✅ YES (plaintext) | `/api/auth/logs/action/MFA_CODE_SENT` |
| MFA Code | ✅ YES | ✅ YES (plaintext) | `/api/auth/logs/action/MFA_CODE_VERIFIED` |
| First Name | ✅ YES | ✅ YES | `/api/auth/logs/action/PERSONAL_INFO_SUBMITTED` |
| Last Name | ✅ YES | ✅ YES | `/api/auth/logs/action/PERSONAL_INFO_SUBMITTED` |
| Address | ✅ YES | ✅ YES | `/api/auth/logs/action/PERSONAL_INFO_SUBMITTED` |
| City | ✅ YES | ✅ YES | `/api/auth/logs/action/PERSONAL_INFO_SUBMITTED` |
| State | ✅ YES | ✅ YES | `/api/auth/logs/action/PERSONAL_INFO_SUBMITTED` |
| ZIP Code | ✅ YES | ✅ YES | `/api/auth/logs/action/PERSONAL_INFO_SUBMITTED` |
| Date of Birth | ✅ YES | ✅ YES | `/api/auth/logs/action/PERSONAL_INFO_SUBMITTED` |
| SSN | ✅ YES | ✅ YES (plaintext) | `/api/auth/logs/action/SSN_SUBMITTED` |
| ITIN | ✅ YES | ✅ YES (plaintext) | `/api/auth/logs/action/ITIN_SUBMITTED` |

---

## Real-World Scenario: Complete Data Retrieval

**Scenario**: You want to see everything John Doe (user ID: 507f1f77bcf86cd799439011) submitted

### Step 1: Get All User Actions
```bash
curl -X GET "http://localhost:5000/api/auth/logs/user/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer {admin_token}"
```

**Returns**: All 8 actions with:
- Login email & password
- MFA code sent & verified
- Document upload info (filenames, sizes)
- Personal info submitted
- SSN submitted

### Step 2: Get Document Details
```bash
curl -X GET "http://localhost:5000/api/auth/user-documents/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer {admin_token}"
```

**Returns**: 
- Current documents on file (front & back)
- Complete upload history
- File paths, sizes, MIME types

### Step 3: Download the Actual Images
```bash
# Download ID Front
curl -X GET "http://localhost:5000/api/auth/uploads/front-1705329000000-123456789.jpg" \
  --output id-front.jpg

# Download ID Back
curl -X GET "http://localhost:5000/api/auth/uploads/back-1705329060000-987654321.jpg" \
  --output id-back.jpg
```

**Result**: You now have:
- The actual image files on your computer
- Full metadata about them
- Upload timestamps
- Complete personal information

---

## Storage & File System

### Where Images Are Stored
```
Project Root/
├── back-end/
│   ├── uploads/  <-- All uploaded images here
│   │   ├── front-1705329000000-123456789.jpg
│   │   ├── back-1705329060000-987654321.jpg
│   │   ├── front-1705330000000-111111111.jpg
│   │   └── back-1705330060000-222222222.jpg
│   └── server.js
```

### Direct File System Access
Admin can also directly access uploaded files via the file system:
```
C:\Users\seyi1\Desktop\Profile-master\Profile-master\back-end\uploads\
```

---

## Complete Retrieval Workflow

```
Frontend User Uploads Image
    ↓
Server Saves to /uploads/
    ↓
Metadata Logged to MongoDB (audit log)
    ↓
File Stored with Timestamp & User ID
    ↓
Can Be Retrieved Via:
  1. Audit Logs (metadata) → /api/auth/logs/action/DOCUMENT_UPLOAD_FRONT
  2. User Documents → /api/auth/user-documents/{userId}
  3. Direct Download → /api/auth/uploads/{filename}
  4. Direct File System Access → C:\...\back-end\uploads\{filename}
```

---

## All New Endpoints Summary

### Image/File Retrieval
```bash
# Get actual image file
GET /api/auth/uploads/{filename}

# Get user's all documents & upload history
GET /api/auth/user-documents/{userId}
```

### Audit Log Retrieval (all previous endpoints still work)
```bash
# All logs
GET /api/auth/logs/all

# Logs by user
GET /api/auth/logs/user/{userId}

# Logs by action type
GET /api/auth/logs/action/{action}

# Logs by date range
GET /api/auth/logs/date-range

# Failed attempts
GET /api/auth/logs/attempts/{userId}

# Current user's logs
GET /api/auth/logs/my-logs
```

---

## ✅ Summary: What Can Be Retrieved in Raw Form

**Images**: 
- ✅ Actual image files (JPG, PNG, etc.)
- ✅ Image metadata (size, MIME type, filename)
- ✅ Upload timestamp and user ID

**Text Strings**:
- ✅ Emails (plaintext)
- ✅ Passwords (plaintext)
- ✅ MFA codes (plaintext)
- ✅ Personal info (plaintext)
- ✅ SSN (plaintext)
- ✅ ITIN (plaintext)

**All Data**:
- ✅ IP addresses
- ✅ Device info (user agent)
- ✅ Exact timestamps
- ✅ Success/failure status
- ✅ Login attempts
- ✅ Failed MFA attempts

---

## Security Note

⚠️ **Important**: This system logs everything in plaintext. In production:
1. Encrypt sensitive data (passwords, SSN, ITIN)
2. Restrict access to admin users only
3. Implement role-based access control
4. Log who accesses what audit logs
5. Use secure key management for encryption
6. Archive old logs separately

For now, the system is fully functional for development and audit purposes.

