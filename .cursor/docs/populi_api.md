# Populi API v2.0 Documentation

## Overview

Populi provides a modern REST API for integrating with student information systems. This documentation focuses on the endpoints and operations needed for student grade and financial data retrieval.

**Base URL**: `https://[your-school].populiweb.com/api2/`
**Authentication**: Bearer token authentication
**Content-Type**: `application/json`
**API Version**: 2.0
**Documentation Updated**: January 2025

This is a modern REST API, allowing you to integrate most of the data in your school's Populi instance with other outside services and your own custom software. The data object format shown here is also used by webhooks coming from Populi.

---

## Authentication

### API Key Authentication
```http
Authorization: Bearer YOUR_POPULI_API_KEY
```

All API requests must contain an API Key token in the header. API Keys are managed by Populi Account Administrators and are given roles just like users, which determines what data they have access to.

### Getting an API Key
API Keys are generated from the Populi administration interface:
1. Go to **Account & Settings**
2. Under the **Account** heading, click **API**
3. Go to the **Keys** view
4. Generate a new token

API Keys can have up to two active tokens associated with them. Tokens look like: `sk_j4U265CpkDEIXSAYwAVV1ryf2hiYo`

### Rate Limiting
- Populi enforces rate limiting on API requests
- Handle 429 response codes by exponentially backing off
- Use rate limiting middleware to avoid hitting limits

---

## Request and Response Format

### URL Structure
All API calls follow this pattern:
```
https://yourschool.populiweb.com/api2/{object}/{method}
```

### Request Examples
```bash
# Simple GET request
GET https://yourschool.populiweb.com/api2/people

# GET with parameters in URL path
GET https://yourschool.populiweb.com/api2/people/55782

# POST with JSON body
POST https://yourschool.populiweb.com/api2/people/55782/phonenumbers/create
{
  "number": "555-893-0032",
  "type": "home"
}
```

### Response Format
All API responses contain JSON and will be one of:
- A single data object
- A list object containing an array of data objects  
- An error object with information about what went wrong

All responses include a `"sandbox"` property:
- `true` for validation/demo instances
- `false` for live production instances

### Data Objects
Data objects always include:
- `"object"`: The type name (e.g., `"person"`)
- `"id"`: Unique numeric identifier (e.g., `"88932"`)

---

## Core Concepts

### Person vs Student Identification
**Person Objects** can be identified by:
- `person_id` - Internal Populi person ID
- `student_id` - For students specifically
- `email` - Email address
- Search parameters

**Student Objects** extend Person data with academic information.

### Academic Terms
- `academic_term_id` - Unique identifier for academic terms
- Terms include fall, spring, summer sessions
- Use `AcademicTerm` endpoints to get available terms

### Object Relationships
- **Person** → Can have multiple **Student** records
- **Student** → Has **Enrollments** in **CourseOfferings** 
- **Enrollments** → Have **Grades** and **Attendance**
- **Person** → Has **FinancialTransactions**, **Payments**, **Charges**

---

## Person and Student Endpoints

### Get Person Information
```http
GET /api2/people/{person_id}
```

**Parameters:**
- `person_id` (required) - The person's ID

**Response:**
```json
{
  "object": "person",
  "id": "55782",
  "first_name": "John",
  "last_name": "Doe",
  "preferred_name": "Johnny",
  "middle_name": "Michael",
  "maiden_name": null,
  "deceased": false,
  "gender": "MALE",
  "birth_date": "1995-05-15",
  "social_security_number": "***-**-1234",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:22:00Z",
  "sandbox": false
}
```

### Search People
```http
GET /api2/people
```

**Optional Parameters (JSON in request body or URL parameters):**
- `first_name` - Filter by first name
- `last_name` - Filter by last name  
- `email` - Filter by email address
- `student_id` - Filter by student ID
- `active_only` - Boolean, only return active people

### Get Person by Student ID
```http
GET /api2/people/by_student_id/{student_id}
```

**Parameters:**
- `student_id` (required) - The student's ID number

### Get Student Information
```http
GET /api2/people/{person_id}/students/{student_id}
```

**Response:**
```json
{
  "object": "student",
  "id": "12345",
  "person_id": "55782",
  "student_id": "STU001",
  "status": "ENROLLED",
  "entrance_term_id": "202401",
  "exit_term_id": null,
  "exit_date": null,
  "entrance_date": "2024-01-15",
  "academic_standing": "GOOD_STANDING",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:22:00Z",
  "sandbox": false
}
```

---

## Academic Term Endpoints

### Get Academic Terms
```http
GET /api2/academicterms
```

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "academicterm",
      "id": "202401",
      "name": "Fall 2024",
      "start_date": "2024-08-15",
      "end_date": "2024-12-15",
      "registration_start_date": "2024-07-01",
      "registration_end_date": "2024-08-30",
      "status": "ACTIVE"
    }
  ]
}
```

### Get Academic Term Details
```http
GET /api2/academicterms/{academic_term_id}
```

---

## Course and Enrollment Endpoints

### Get Course Offerings for a Term
```http
GET /api2/academicterms/{academic_term_id}/courseofferings
```

**Parameters:**
- `academic_term_id` (required) - The academic term ID

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "courseoffering",
      "id": "5557",
      "academic_term_id": "202401",
      "catalog_course_id": "1234",
      "name": "Introduction to Programming",
      "abbrv": "CS101",
      "credits": 3,
      "max_students": 25,
      "enrolled_students": 18,
      "status": "ACTIVE",
      "starts": "2024-08-15",
      "ends": "2024-12-15"
    }
  ]
}
```

### Get Course Offering Details
```http
GET /api2/courseofferings/{course_offering_id}
```

### Get Enrollments for a Course
```http
GET /api2/courseofferings/{course_offering_id}/enrollments
```

**Response:**
```json
{
  "object": "list", 
  "data": [
    {
      "object": "enrollment",
      "id": "78901",
      "person_id": "55782",
      "course_offering_id": "5557",
      "status": "ENROLLED",
      "enrolled_date": "2024-08-15",
      "final_grade": null,
      "grade_points": null,
      "credits_earned": 0,
      "attendance_status": "PRESENT"
    }
  ]
}
```

### Get Student's Enrollments
```http
GET /api2/people/{person_id}/enrollments
```

**Optional Parameters:**
- `academic_term_id` - Filter by specific term
- `status` - Filter by enrollment status (ENROLLED, COMPLETED, DROPPED, etc.)

---

## Grade and Assignment Endpoints

### Get Enrollment Details with Grades
```http
GET /api2/enrollments/{enrollment_id}
```

**Response:**
```json
{
  "object": "enrollment",
  "id": "78901",
  "person_id": "55782", 
  "course_offering_id": "5557",
  "status": "COMPLETED",
  "enrolled_date": "2024-08-15",
  "final_grade": "A",
  "grade_points": 4.0,
  "credits_earned": 3,
  "grade_date": "2024-12-15"
}
```

### Get Assignments for a Course
```http
GET /api2/courseofferings/{course_offering_id}/assignments
```

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "assignment",
      "id": "1001",
      "course_offering_id": "5557",
      "name": "Homework 1",
      "description": "Basic programming concepts",
      "points_possible": 100,
      "due_date": "2024-09-15",
      "assignment_type": "HOMEWORK",
      "published": true
    }
  ]
}
```

### Get Assignment Grades
```http
GET /api2/assignments/{assignment_id}/grades
```

### Get Specific Student's Assignment Grade
```http
GET /api2/assignments/{assignment_id}/grades/{person_id}
```

**Response:**
```json
{
  "object": "assignmentgrade",
  "assignment_id": "1001",
  "person_id": "55782",
  "points_earned": 95,
  "percentage": 95.0,
  "letter_grade": "A",
  "passed": true,
  "submitted_date": "2024-09-14",
  "graded_date": "2024-09-16"
}
```

---

## Student Academic Progress

### Get Student Transcript
```http
GET /api2/people/{person_id}/students/{student_id}/transcript
```

### Export Grade Report
```http
GET /api2/people/{person_id}/students/{student_id}/export_grade_report
```

**Optional Parameters:**
- `academic_term_id` - Specific term
- `format` - Export format (PDF, etc.)

### Export Transcript  
```http
GET /api2/people/{person_id}/students/{student_id}/export_transcript
```

---

## Financial Endpoints

### Get Financial Transactions
```http
GET /api2/financialtransactions
```

**Optional Parameters:**
- `person_id` - Filter by specific person
- `academic_term_id` - Filter by academic term
- `start_date` - Start date for date range (YYYY-MM-DD)
- `end_date` - End date for date range (YYYY-MM-DD)
- `transaction_type` - Filter by type (CHARGE, PAYMENT, CREDIT, etc.)

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "financialtransaction",
      "id": "45678",
      "person_id": "55782",
      "academic_term_id": "202401",
      "transaction_type": "CHARGE",
      "amount": 12500.00,
      "posted_date": "2024-07-15",
      "due_date": "2024-08-15",
      "description": "Fall 2024 Tuition",
      "category": "TUITION",
      "applied_balance": 0.00,
      "remaining_balance": 12500.00
    }
  ]
}
```

### Get Specific Financial Transaction
```http
GET /api2/financialtransactions/{transaction_id}
```

### Get Student Account Balances
```http
GET /api2/people/{person_id}/students/{student_id}/balances
```

**Response:**
```json
{
  "object": "student",
  "person_id": "55782",
  "student_id": "STU001",
  "current_balance": 750.00,
  "total_charges": 15750.00,
  "total_payments": 12000.00,
  "total_financial_aid": 3000.00,
  "pending_charges": 0.00,
  "account_balances": [
    {
      "academic_term_id": "202401",
      "term_name": "Fall 2024",
      "balance": 750.00,
      "charges": 12750.00,
      "payments": 10000.00,
      "financial_aid": 2000.00
    }
  ]
}
```

---

## Payment Endpoints

### Get Payments
```http
GET /api2/payments
```

**Optional Parameters:**
- `person_id` - Filter by specific person
- `start_date` - Start date for date range
- `end_date` - End date for date range

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "payment",
      "id": "33456",
      "person_id": "55782",
      "amount": 2500.00,
      "payment_method": "CREDIT_CARD",
      "payment_type": "TUITION_PAYMENT",
      "posted_date": "2024-08-15",
      "reference_number": "CC123456",
      "description": "Fall 2024 Payment",
      "processor_transaction_id": "TXN_ABC123"
    }
  ]
}
```

### Get Payments for a Person
```http
GET /api2/people/{person_id}/payments
```

### Get Payment Details
```http
GET /api2/payments/{payment_id}
```

---

## Financial Aid Endpoints

### Get Aid Awards
```http
GET /api2/aidawards
```

**Optional Parameters:**
- `person_id` - Filter by specific person
- `aid_year_id` - Filter by aid year
- `aid_type_id` - Filter by aid type

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "aidaward",
      "id": "67890",
      "person_id": "55782",
      "aid_year_id": "2024-2025",
      "aid_type_id": "PELL",
      "aid_type_name": "Federal Pell Grant",
      "total_awarded": 6000.00,
      "total_disbursed": 3000.00,
      "remaining_amount": 3000.00,
      "status": "ACTIVE",
      "awarded_date": "2024-06-01"
    }
  ]
}
```

### Get Aid Awards by Student
```http
GET /api2/aidawards/index_by_student/{person_id}
```

### Get Aid Disbursements
```http
GET /api2/aiddisbursements
```

**Optional Parameters:**
- `aid_award_id` - Filter by specific aid award
- `person_id` - Filter by specific person
- `disbursement_date` - Filter by disbursement date

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "aiddisbursement",
      "id": "78901",
      "aid_award_id": "67890",
      "person_id": "55782",
      "amount": 3000.00,
      "disbursement_date": "2024-08-20",
      "academic_term_id": "202401",
      "status": "DISBURSED",
      "disbursement_type": "DIRECT_CREDIT"
    }
  ]
}
```

### Get Aid Types
```http
GET /api2/aidtypes
```

### Get Aid Years
```http
GET /api2/aidyears
```

---

## Invoice and Billing Endpoints

### Get Invoices
```http
GET /api2/invoices
```

**Optional Parameters:**
- `person_id` - Filter by specific person
- `academic_term_id` - Filter by academic term
- `status` - Filter by invoice status

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "invoice",
      "id": "INV001",
      "person_id": "55782",
      "academic_term_id": "202401",
      "invoice_number": "2024-001-55782",
      "invoice_date": "2024-07-15",
      "due_date": "2024-08-15",
      "total_amount": 12750.00,
      "balance_due": 750.00,
      "status": "UNPAID"
    }
  ]
}
```

### Get Invoice Details
```http
GET /api2/invoices/{invoice_id}
```

### Get Student Payment Link
```http
GET /api2/people/{person_id}/students/{student_id}/get_online_payment_link
```

**Response:**
```json
{
  "payment_url": "https://yourschool.populiweb.com/payments/student/55782/pay",
  "expires_at": "2024-08-30T23:59:59Z"
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

## Lists and Paging

Most endpoints that return multiple objects use pagination. List responses include pagination information:

```json
{
  "object": "list",
  "data": [...],
  "has_more": true,
  "after": "cursor_string",
  "before": "cursor_string"
}
```

Use the `after` or `before` parameters to navigate pages:
```http
GET /api2/people?after=cursor_string&limit=50
```

---

## Expandable Objects

Some objects can be expanded to include related data using the `expand` parameter:

```http
GET /api2/people/55782?expand=student,emailaddresses,phonenumbers
```

Common expandable relationships:
- **Person**: `student`, `emailaddresses`, `phonenumbers`, `addresses`
- **Enrollment**: `person`, `courseoffering`, `assignments`
- **CourseOffering**: `catalogcourse`, `academicterm`, `enrollments`

---

## Code Examples

### JavaScript/Node.js Example
```javascript
class PopuliAPIv2 {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL; // https://yourschool.populiweb.com/api2
    this.apiKey = apiKey;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error ${response.status}: ${error.message || response.statusText}`);
    }

    return await response.json();
  }

  // Get person information
  async getPerson(personId, expand = null) {
    const params = expand ? `?expand=${expand}` : '';
    return await this.request(`/people/${personId}${params}`);
  }

  // Get student enrollments  
  async getStudentEnrollments(personId, academicTermId = null) {
    const params = academicTermId ? `?academic_term_id=${academicTermId}` : '';
    return await this.request(`/people/${personId}/enrollments${params}`);
  }

  // Get student financial transactions
  async getFinancialTransactions(personId, startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (personId) params.append('person_id', personId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/financialtransactions${queryString}`);
  }

  // Get student account balance
  async getStudentBalance(personId, studentId) {
    return await this.request(`/people/${personId}/students/${studentId}/balances`);
  }

  // Get course grades for a student
  async getEnrollmentGrades(enrollmentId) {
    return await this.request(`/enrollments/${enrollmentId}`);
  }

  // Get assignments for a course
  async getCourseAssignments(courseOfferingId) {
    return await this.request(`/courseofferings/${courseOfferingId}/assignments`);
  }

  // Get assignment grade for specific student
  async getAssignmentGrade(assignmentId, personId) {
    return await this.request(`/assignments/${assignmentId}/grades/${personId}`);
  }
}

// Usage Example
const api = new PopuliAPIv2(
  'https://yourschool.populiweb.com/api2',
  'sk_your_api_key_here'
);

// Get student information with expanded details
const student = await api.getPerson(55782, 'student,emailaddresses');

// Get current term enrollments
const enrollments = await api.getStudentEnrollments(55782, '202401');

// Get financial transactions for date range
const transactions = await api.getFinancialTransactions(
  55782, 
  '2024-01-01', 
  '2024-12-31'
);

// Get current account balance
const balance = await api.getStudentBalance(55782, 'STU001');
```

### Python Example
```python
import requests
from typing import Optional, Dict, Any

class PopuliAPIv2:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url  # https://yourschool.populiweb.com/api2
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })

    def request(self, endpoint: str, method: str = 'GET', **kwargs) -> Dict[Any, Any]:
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, **kwargs)
        
        if not response.ok:
            try:
                error_data = response.json()
                raise Exception(f"API Error {response.status_code}: {error_data.get('message', response.reason)}")
            except ValueError:
                raise Exception(f"API Error {response.status_code}: {response.reason}")
        
        return response.json()

    def get_person(self, person_id: str, expand: Optional[str] = None) -> Dict[Any, Any]:
        params = {'expand': expand} if expand else {}
        return self.request(f"/people/{person_id}", params=params)

    def get_student_enrollments(self, person_id: str, academic_term_id: Optional[str] = None) -> Dict[Any, Any]:
        params = {'academic_term_id': academic_term_id} if academic_term_id else {}
        return self.request(f"/people/{person_id}/enrollments", params=params)

    def get_financial_transactions(self, person_id: Optional[str] = None, 
                                 start_date: Optional[str] = None, 
                                 end_date: Optional[str] = None) -> Dict[Any, Any]:
        params = {}
        if person_id:
            params['person_id'] = person_id
        if start_date:
            params['start_date'] = start_date
        if end_date:
            params['end_date'] = end_date
        
        return self.request("/financialtransactions", params=params)

# Usage
api = PopuliAPIv2(
    'https://yourschool.populiweb.com/api2',
    'sk_your_api_key_here'
)

# Get student data
student = api.get_person('55782', 'student,emailaddresses')
enrollments = api.get_student_enrollments('55782', '202401')
transactions = api.get_financial_transactions('55782', '2024-01-01', '2024-12-31')
```

---

## Implementation Notes

### Authentication Best Practices
1. **API Key Security**: Store API keys securely, never in client-side code
2. **Key Rotation**: Populi supports up to 2 active tokens per key for rotation
3. **Permissions**: Assign minimal necessary permissions to API keys
4. **Monitoring**: Set up log viewers to monitor API usage

### Rate Limiting Strategy
1. **Implement Exponential Backoff**: When receiving 429 responses
2. **Request Batching**: Combine related requests when possible
3. **Caching**: Cache relatively static data (terms, courses) for 15-30 minutes
4. **Real-time Requirements**: Don't cache financial balances or real-time grade data

### Data Integration Patterns
1. **Person-Centric Design**: Always start with Person ID as the primary key
2. **Relationship Mapping**: Use expand parameters to reduce API calls
3. **Pagination Handling**: Implement proper pagination for large datasets
4. **Error Recovery**: Handle network errors and API timeouts gracefully

### Performance Optimization
1. **Use Expand Parameters**: Reduce round trips by expanding related objects
2. **Filter Early**: Use query parameters to limit data returned
3. **Parallel Requests**: Make independent API calls concurrently
4. **Connection Pooling**: Reuse HTTP connections when making multiple requests

### Error Scenarios to Handle
- **400 Bad Request**: Invalid parameters or request format
- **401 Unauthorized**: Invalid or expired API key
- **403 Forbidden**: Insufficient permissions for requested data
- **404 Not Found**: Resource (person, enrollment, etc.) not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Temporary server issues

### Security Considerations
1. **Data Privacy**: Follow FERPA guidelines when handling student data
2. **Audit Logging**: Log all API access for compliance
3. **Secure Transport**: Always use HTTPS for API communications
4. **Data Retention**: Implement appropriate data retention policies

---

*Last Updated: January 2025*  
*API Version: v2.0*  
*Documentation Status: Complete for Students, Grades, and Finances*  
*Source: Official Populi API Documentation (populi.co/api)*