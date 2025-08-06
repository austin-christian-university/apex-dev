# Populi API Documentation

## Overview

Populi provides a RESTful API for integrating with student information systems. This documentation focuses on the endpoints and operations needed for student grade and financial data retrieval.

**Base URL**: `https://[your-school].populiweb.com/api/`
**Authentication**: Token-based authentication
**Content-Type**: `application/json`

---

## Authentication

### API Token Authentication
```http
Authorization: Bearer YOUR_API_TOKEN
```

### Getting an API Token
API tokens are generated from the Populi administration interface under:
- **Settings** → **API** → **Generate New Token**

---

## Core Concepts

### Student Identification
Students can be identified by:
- `student_id` - Internal Populi ID
- `student_number` - School-assigned student number
- `email` - Student email address

### Academic Terms
- `term_id` - Unique identifier for academic terms
- Terms include fall, spring, summer sessions
- Use `/terms` endpoint to get available terms

---

## Student Data Endpoints

### Get Student Information
```http
GET /students/{student_id}
```

**Parameters:**
- `student_id` (required) - The student's ID

**Response:**
```json
{
  "id": 12345,
  "student_number": "STU001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@school.edu",
  "status": "active",
  "program_id": 1,
  "program_name": "Computer Science"
}
```

### Search Students
```http
GET /students?search={query}
```

**Parameters:**
- `search` - Search by name, email, or student number
- `status` - Filter by student status (active, inactive, graduated)
- `program_id` - Filter by program

---

## Academic/Grade Endpoints

### Get Student Courses
```http
GET /students/{student_id}/courses
```

**Parameters:**
- `student_id` (required)
- `term_id` (optional) - Filter by specific term
- `status` (optional) - enrolled, completed, dropped

**Response:**
```json
{
  "courses": [
    {
      "course_id": 101,
      "course_name": "Introduction to Programming",
      "course_code": "CS101",
      "term_id": 202401,
      "term_name": "Fall 2024",
      "credits": 3,
      "status": "enrolled",
      "instructor": "Dr. Smith",
      "enrollment_date": "2024-08-15"
    }
  ]
}
```

### Get Student Grades
```http
GET /students/{student_id}/grades
```

**Parameters:**
- `student_id` (required)
- `term_id` (optional) - Filter by specific term
- `course_id` (optional) - Filter by specific course

**Response:**
```json
{
  "grades": [
    {
      "course_id": 101,
      "course_name": "Introduction to Programming",
      "course_code": "CS101",
      "term_id": 202401,
      "term_name": "Fall 2024",
      "credits": 3,
      "final_grade": "A",
      "grade_points": 4.0,
      "status": "completed",
      "assignments": [
        {
          "assignment_id": 1001,
          "name": "Homework 1",
          "points_possible": 100,
          "points_earned": 95,
          "percentage": 95.0,
          "due_date": "2024-09-15",
          "submitted_date": "2024-09-14"
        }
      ]
    }
  ]
}
```

### Get GPA Information
```http
GET /students/{student_id}/gpa
```

**Parameters:**
- `student_id` (required)
- `term_id` (optional) - Specific term GPA
- `cumulative` (optional) - Include cumulative GPA

**Response:**
```json
{
  "student_id": 12345,
  "term_gpa": {
    "term_id": 202401,
    "gpa": 3.85,
    "credits_attempted": 15,
    "credits_earned": 15,
    "quality_points": 57.75
  },
  "cumulative_gpa": {
    "gpa": 3.67,
    "total_credits_attempted": 60,
    "total_credits_earned": 58,
    "total_quality_points": 212.86
  }
}
```

---

## Financial Endpoints

### Get Student Financial Summary
```http
GET /students/{student_id}/financial-summary
```

**Parameters:**
- `student_id` (required)
- `term_id` (optional) - Filter by specific term

**Response:**
```json
{
  "student_id": 12345,
  "total_charges": 15750.00,
  "total_payments": 12000.00,
  "total_financial_aid": 3000.00,
  "account_balance": 750.00,
  "last_payment_date": "2024-08-15",
  "last_payment_amount": 2500.00
}
```

### Get Detailed Charges
```http
GET /students/{student_id}/charges
```

**Parameters:**
- `student_id` (required)
- `term_id` (optional)
- `charge_type` (optional) - tuition, fees, room, board, other

**Response:**
```json
{
  "charges": [
    {
      "charge_id": 5001,
      "term_id": 202401,
      "term_name": "Fall 2024",
      "charge_type": "tuition",
      "description": "Fall 2024 Tuition",
      "amount": 12500.00,
      "date_posted": "2024-07-15",
      "due_date": "2024-08-15"
    },
    {
      "charge_id": 5002,
      "term_id": 202401,
      "term_name": "Fall 2024",
      "charge_type": "fees",
      "description": "Student Activity Fee",
      "amount": 250.00,
      "date_posted": "2024-07-15",
      "due_date": "2024-08-15"
    }
  ]
}
```

### Get Payment History
```http
GET /students/{student_id}/payments
```

**Parameters:**
- `student_id` (required)
- `term_id` (optional)
- `payment_type` (optional) - cash, check, credit_card, financial_aid

**Response:**
```json
{
  "payments": [
    {
      "payment_id": 3001,
      "amount": 2500.00,
      "payment_type": "credit_card",
      "payment_method": "Visa ending in 1234",
      "date_posted": "2024-08-15",
      "description": "Fall 2024 Payment",
      "transaction_id": "TXN123456"
    },
    {
      "payment_id": 3002,
      "amount": 3000.00,
      "payment_type": "financial_aid",
      "payment_method": "Pell Grant",
      "date_posted": "2024-08-20",
      "description": "Federal Pell Grant"
    }
  ]
}
```

### Get Financial Aid Information
```http
GET /students/{student_id}/financial-aid
```

**Parameters:**
- `student_id` (required)
- `aid_year` (optional) - Academic year (e.g., "2024-2025")
- `aid_type` (optional) - grants, loans, scholarships, work_study

**Response:**
```json
{
  "financial_aid": [
    {
      "aid_id": 4001,
      "aid_year": "2024-2025",
      "aid_type": "grant",
      "aid_name": "Federal Pell Grant",
      "total_awarded": 6000.00,
      "fall_amount": 3000.00,
      "spring_amount": 3000.00,
      "disbursed_amount": 3000.00,
      "remaining_amount": 3000.00,
      "status": "active"
    }
  ]
}
```

---

## Error Handling

### Standard HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (student/resource not found)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "Student with ID 12345 not found",
    "details": {
      "student_id": 12345
    }
  }
}
```

---

## Code Examples

### JavaScript/Node.js Example
```javascript
class PopuliAPI {
  constructor(baseURL, apiToken) {
    this.baseURL = baseURL;
    this.apiToken = apiToken;
  }

  async getStudentGrades(studentId, termId = null) {
    const url = new URL(`${this.baseURL}/students/${studentId}/grades`);
    if (termId) url.searchParams.set('term_id', termId);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async getStudentFinances(studentId, termId = null) {
    const url = new URL(`${this.baseURL}/students/${studentId}/financial-summary`);
    if (termId) url.searchParams.set('term_id', termId);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

// Usage
const api = new PopuliAPI('https://yourschool.populiweb.com/api', 'your-api-token');
const grades = await api.getStudentGrades(12345);
const finances = await api.getStudentFinances(12345);
```

---

## Implementation Notes

### For Grade Data Integration
1. **Real-time vs Cached**: Consider caching grade data for 15-30 minutes to reduce API load
2. **Assignment Details**: Use detailed assignments endpoint for comprehensive grade breakdowns
3. **GPA Calculations**: Use the dedicated GPA endpoint rather than calculating manually

### For Financial Data Integration
1. **Security**: Financial data should be accessed with elevated permissions
2. **Real-time Requirements**: Account balances should be as real-time as possible
3. **Payment Processing**: Never cache payment-related data for more than a few minutes

### Error Scenarios to Handle
- Student not found (404)
- No grades available for term
- Financial data access restrictions
- API rate limiting
- Network timeouts

---

*Last Updated: January 2025*
*API Version: v2.0*
*Documentation Status: Complete for Grades & Finances*