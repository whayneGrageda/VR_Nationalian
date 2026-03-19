# API Documentation

Base URL: `http://localhost:3000/api`

## Health Check

### System Health
Check the health status of all system services.

**Endpoint:** `GET /health`

**Success Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "api": {
      "status": "online",
      "uptime": 3600
    },
    "database": {
      "status": "online",
      "responseTime": "45ms"
    },
    "vrSessions": {
      "status": "online",
      "active": 5
    }
  }
}
```

**Error Response (503):**
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": "Database connection failed"
}
```

---

## Authentication

### Login
Authenticate a user and get session token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "userId": 1,
  "username": "prof1",
  "roleId": 2,
  "roleName": "professor",
  "firstName": "John",
  "middleInitial": "M",
  "lastName": "Doe",
  "sectionId": null,
  "sessionToken": "abc123..."
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

**Error Response (401):**
```json
{
  "error": "Students cannot access the web portal"
}
```

---

## Sections

### Create Section
Create a new section/class.

**Endpoint:** `POST /sections`

**Request Body:**
```json
{
  "sectionName": "CS101-A",
  "professorId": 1
}
```

**Success Response (201):**
```json
{
  "sectionId": 1
}
```

**Error Response (400):**
```json
{
  "error": "Error message"
}
```

---

### Get Sections by Professor
Get all sections for a specific professor.

**Endpoint:** `GET /sections/professor/:professorId`

**URL Parameters:**
- `professorId` (number) - Professor's user ID

**Success Response (200):**
```json
[
  {
    "sectionId": 1,
    "sectionName": "CS101-A",
    "professorId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "sectionId": 2,
    "sectionName": "CS102-B",
    "professorId": 1,
    "createdAt": "2024-01-16T14:20:00.000Z"
  }
]
```

---

### Update Section
Update a section's name.

**Endpoint:** `PUT /sections/:id`

**URL Parameters:**
- `id` (number) - Section ID

**Request Body:**
```json
{
  "sectionName": "CS101-A (Updated)"
}
```

**Success Response (200):**
```json
{
  "success": true
}
```

---

### Delete Section
Delete a section and unassign all students.

**Endpoint:** `DELETE /sections/:id`

**URL Parameters:**
- `id` (number) - Section ID

**Success Response (200):**
```json
{
  "success": true
}
```

---

## Students

### Create Student
Create a new student account.

**Endpoint:** `POST /students`

**Request Body:**
```json
{
  "username": "student123",
  "password": "password123",
  "firstName": "Jane",
  "middleInitial": "M",
  "lastName": "Smith",
  "sectionId": 1
}
```

**Note:** `middleInitial` is optional.

**Success Response (201):**
```json
{
  "userId": 5
}
```

---

### Get Students by Section
Get all students in a specific section.

**Endpoint:** `GET /students/section/:sectionId`

**URL Parameters:**
- `sectionId` (number) - Section ID

**Success Response (200):**
```json
[
  {
    "userId": 5,
    "username": "student123",
    "roleId": 1,
    "roleName": "student",
    "firstName": "Jane",
    "middleInitial": "M",
    "lastName": "Smith",
    "sectionId": 1
  }
]
```

---

### Update Student
Update student information.

**Endpoint:** `PUT /students/:id`

**URL Parameters:**
- `id` (number) - Student's user ID

**Request Body:**
```json
{
  "username": "student123",
  "firstName": "Jane",
  "middleInitial": "M",
  "lastName": "Smith",
  "sectionId": 1
}
```

**Note:** Password cannot be updated via this endpoint.

**Success Response (200):**
```json
{
  "success": true
}
```

---

### Delete Student
Delete a student account.

**Endpoint:** `DELETE /students/:id`

**URL Parameters:**
- `id` (number) - Student's user ID

**Success Response (200):**
```json
{
  "success": true
}
```

---

## Professors (Admin Only)

### Create Professor
Create a new professor account.

**Endpoint:** `POST /professors`

**Request Body:**
```json
{
  "username": "prof2",
  "password": "password123",
  "firstName": "John",
  "middleInitial": "D",
  "lastName": "Doe"
}
```

**Note:** `firstName`, `middleInitial`, and `lastName` are optional.

**Success Response (201):**
```json
{
  "userId": 3
}
```

---

### Get All Professors
Get all professor accounts.

**Endpoint:** `GET /professors`

**Success Response (200):**
```json
[
  {
    "userId": 1,
    "username": "prof1",
    "firstName": "John",
    "middleInitial": "M",
    "lastName": "Doe",
    "createdAt": "2024-01-10T08:00:00.000Z"
  },
  {
    "userId": 3,
    "username": "prof2",
    "firstName": "Jane",
    "middleInitial": null,
    "lastName": "Smith",
    "createdAt": "2024-01-12T10:30:00.000Z"
  }
]
```

---

### Update Professor
Update professor information.

**Endpoint:** `PUT /professors/:id`

**URL Parameters:**
- `id` (number) - Professor's user ID

**Request Body:**
```json
{
  "username": "prof2",
  "firstName": "John",
  "middleInitial": "D",
  "lastName": "Doe"
}
```

**Note:** Password cannot be updated via this endpoint.

**Success Response (200):**
```json
{
  "success": true
}
```

---

### Delete Professor
Delete a professor account.

**Endpoint:** `DELETE /professors/:id`

**URL Parameters:**
- `id` (number) - Professor's user ID

**Success Response (200):**
```json
{
  "success": true
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Descriptive error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Data Types

### User Object
```typescript
{
  userId: number;
  username: string;
  roleId: number;        // 1=student, 2=professor, 3=admin
  roleName: string;      // "student", "professor", "admin"
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  sectionId?: number;    // Only for students
  sessionToken?: string; // Only on login
}
```

### Section Object
```typescript
{
  sectionId: number;
  sectionName: string;
  professorId?: number;
  createdAt: string;     // ISO 8601 date string
}
```

### Professor Object
```typescript
{
  userId: number;
  username: string;
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  createdAt?: string;    // ISO 8601 date string
}
```

---

## Testing with cURL

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"prof1","password":"password123"}'
```

### Create Section
```bash
curl -X POST http://localhost:3000/api/sections \
  -H "Content-Type: application/json" \
  -d '{"sectionName":"CS101-A","professorId":1}'
```

### Get Sections
```bash
curl http://localhost:3000/api/sections/professor/1
```

### Create Student
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "username":"student1",
    "password":"pass123",
    "firstName":"John",
    "lastName":"Doe",
    "sectionId":1
  }'
```

### Get Students
```bash
curl http://localhost:3000/api/students/section/1
```

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting in production:
- Login: 5 attempts per 15 minutes
- API calls: 100 requests per minute per IP

---

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

---

## Authentication Flow

1. User submits login credentials
2. Backend validates against Supabase `fn_login()`
3. Backend checks role (blocks students)
4. Backend returns user object with session token
5. Frontend stores user in context/localStorage
6. Frontend includes token in subsequent requests (if needed)

---

## Notes

- All timestamps are in UTC
- Passwords are currently stored as plain text (development only)
- Session tokens are MD5 hashes (development only)
- For production, implement proper JWT tokens and password hashing
