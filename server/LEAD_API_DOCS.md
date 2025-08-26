# Lead API Documentation

## Base URL

```
http://31.97.233.21:8081/api
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Leads

**GET** `/leads`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `search` (optional): Search in firstName, lastName, email, company

**Example:**

```
GET /api/leads?page=1&limit=5&status=new&search=john
```

**Response:**

```json
{
  "success": true,
  "data": {
    "leads": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 5
    }
  }
}
```

### 2. Get Lead by ID

**GET** `/leads/:id`

**Example:**

```
GET /api/leads/1
```

**Response:**

```json
{
  "success": true,
  "data": {
    "lead": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "company": "Tech Solutions Inc.",
      "position": "CEO",
      "source": "Website",
      "status": "new",
      "notes": "Interested in our enterprise solution",
      "assignedTo": 1,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "assignedUser": {
        "id": 1,
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@crm.com"
      }
    }
  }
}
```

### 3. Create Lead

**POST** `/leads`

**Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "company": "Tech Solutions Inc.",
  "position": "CEO",
  "source": "Website",
  "status": "new",
  "notes": "Interested in our enterprise solution",
  "assignedTo": 1
}
```

**Required Fields:** firstName, lastName, email
**Optional Fields:** phone, company, position, source, status, notes, assignedTo

**Status Values:** new, contacted, qualified, proposal, negotiation, closed, lost

### 4. Update Lead

**PUT** `/leads/:id`

**Body:** Same as create lead (all fields optional except id)

**Example:**

```
PUT /api/leads/1
```

### 5. Delete Lead (Soft Delete)

**DELETE** `/leads/:id`

**Example:**

```
DELETE /api/leads/1
```

**Response:**

```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

### 6. Get Lead Statistics

**GET** `/leads/stats`

**Response:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 15,
      "new": 5,
      "contacted": 3,
      "qualified": 2,
      "proposal": 1,
      "negotiation": 1,
      "closed": 2,
      "lost": 1
    }
  }
}
```

## Sample Data

The system comes with 3 sample leads:

1. John Doe (Tech Solutions Inc.) - Status: new
2. Jane Smith (Marketing Pro) - Status: contacted
3. Mike Johnson (StartupXYZ) - Status: qualified

## Testing in Postman

1. **Login first** to get JWT token:

   ```
   POST /api/auth/login
   Body: {
     "email": "admin@crm.com",
     "password": "admin123"
   }
   ```

2. **Copy the token** from the response

3. **Add Authorization header** to all Lead API requests:

   ```
   Authorization: Bearer <your-jwt-token>
   ```

4. **Test the endpoints** in this order:
   - GET /api/leads (list all leads)
   - GET /api/leads/stats (get statistics)
   - POST /api/leads (create new lead)
   - GET /api/leads/1 (get specific lead)
   - PUT /api/leads/1 (update lead)
   - DELETE /api/leads/1 (delete lead)
