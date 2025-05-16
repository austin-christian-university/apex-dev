// Types for our data model
export interface Student {
  id: string
  name: string
  email: string
  studentId: string
  major: string
  minor: string
  year: number
  gpa: number
  profileImage?: string
  pillars: {
    christCentered: number
    excellence: number
    service: number
    community: number
  }
  history: {
    date: string
    christCentered: number
    excellence: number
    service: number
    community: number
  }[]
  academicRecords: {
    academicStanding: "good" | "warning" | "probation"
    totalCredits: number
    creditsAttempted: number
    creditsEarned: number
    gpa: number
    courses: Course[]
  }
  financialStanding: {
    tuitionTotal: number
    tuitionPaid: number
    accountBalance: number
    financialAid: FinancialAid[]
    transactions: Transaction[]
  }
  achievements: Achievement[]
}

export interface Course {
  id: string
  code: string
  name: string
  semester: "Fall" | "Spring" | "Summer"
  year: number
  credits: number
  grade?: "A" | "B" | "C" | "D" | "F" | "W" | "I"
  status: "in-progress" | "completed"
}

export interface FinancialAid {
  id: string
  type: "scholarship" | "grant" | "loan"
  name: string
  amount: number
  status: "awarded" | "disbursed" | "pending"
}

export interface Transaction {
  id: string
  date: string
  description: string
  type: "payment" | "financial aid" | "refund"
  amount: number
}

export interface Achievement {
  id: string
  name: string
  type: "academic" | "service" | "leadership" | "athletic"
  description: string
  date: string
}

// Student data with more variability in Four Pillars scores
export const students: Student[] = [
  {
    id: "1",
    name: "Emma Johnson",
    email: "emma.johnson@acu.edu",
    studentId: "ACU001234",
    major: "Psychology",
    minor: "Biblical Studies",
    year: 3,
    gpa: 3.8,
    pillars: {
      christCentered: 92,
      excellence: 87,
      service: 68,
      community: 78,
    },
    history: [
      { date: "2023-01", christCentered: 88, excellence: 82, service: 65, community: 72 },
      { date: "2023-02", christCentered: 89, excellence: 84, service: 66, community: 74 },
      { date: "2023-03", christCentered: 90, excellence: 85, service: 67, community: 75 },
      { date: "2023-04", christCentered: 92, excellence: 87, service: 68, community: 78 },
    ],
    academicRecords: {
      academicStanding: "good" as const,
      totalCredits: 85,
      creditsAttempted: 90,
      creditsEarned: 85,
      gpa: 3.8,
      courses: [
        {
          id: "101",
          code: "PSY201",
          name: "Introduction to Psychology",
          semester: "Fall",
          year: 2022,
          credits: 3,
          grade: "A",
          status: "completed",
        },
        {
          id: "102",
          code: "BIB101",
          name: "Old Testament Survey",
          semester: "Spring",
          year: 2023,
          credits: 3,
          grade: "B",
          status: "completed",
        },
        {
          id: "103",
          code: "ENG101",
          name: "Freshman Composition",
          semester: "Fall",
          year: 2023,
          credits: 3,
          status: "in-progress",
        },
      ],
    },
    financialStanding: {
      tuitionTotal: 30000,
      tuitionPaid: 25000,
      accountBalance: 5000,
      financialAid: [
        {
          id: "201",
          type: "scholarship",
          name: "Academic Scholarship",
          amount: 5000,
          status: "disbursed",
        },
        {
          id: "202",
          type: "grant",
          name: "Federal Pell Grant",
          amount: 2000,
          status: "awarded",
        },
      ],
      transactions: [
        {
          id: "301",
          date: "2023-08-15",
          description: "Tuition Payment",
          type: "payment",
          amount: -10000,
        },
        {
          id: "302",
          date: "2023-08-20",
          description: "Academic Scholarship",
          type: "financial aid",
          amount: 5000,
        },
      ],
    },
    achievements: [
      {
        id: "401",
        name: "Dean's List",
        type: "academic",
        description: "Fall 2022",
        date: "2023-01-15",
      },
      {
        id: "402",
        name: "Volunteer of the Year",
        type: "service",
        description: "Habitat for Humanity",
        date: "2023-04-20",
      },
    ],
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@acu.edu",
    studentId: "ACU002345",
    major: "Computer Science",
    minor: "Mathematics",
    year: 2,
    gpa: 3.9,
    pillars: {
      christCentered: 75,
      excellence: 94,
      service: 82,
      community: 68,
    },
    history: [
      { date: "2023-01", christCentered: 70, excellence: 90, service: 78, community: 62 },
      { date: "2023-02", christCentered: 72, excellence: 91, service: 79, community: 64 },
      { date: "2023-03", christCentered: 73, excellence: 93, service: 80, community: 66 },
      { date: "2023-04", christCentered: 75, excellence: 94, service: 82, community: 68 },
    ],
    academicRecords: {
      academicStanding: "good" as const,
      totalCredits: 55,
      creditsAttempted: 60,
      creditsEarned: 55,
      gpa: 3.9,
      courses: [
        {
          id: "104",
          code: "CS101",
          name: "Introduction to Computer Science",
          semester: "Fall",
          year: 2022,
          credits: 3,
          grade: "A",
          status: "completed",
        },
        {
          id: "105",
          code: "MAT201",
          name: "Calculus I",
          semester: "Spring",
          year: 2023,
          credits: 4,
          grade: "A",
          status: "completed",
        },
        {
          id: "106",
          code: "CS201",
          name: "Data Structures",
          semester: "Fall",
          year: 2023,
          credits: 3,
          status: "in-progress",
        },
      ],
    },
    financialStanding: {
      tuitionTotal: 30000,
      tuitionPaid: 30000,
      accountBalance: 0,
      financialAid: [
        {
          id: "203",
          type: "scholarship",
          name: "Merit Scholarship",
          amount: 7000,
          status: "disbursed",
        },
        {
          id: "204",
          type: "grant",
          name: "State Grant",
          amount: 3000,
          status: "disbursed",
        },
      ],
      transactions: [
        {
          id: "303",
          date: "2023-08-15",
          description: "Tuition Payment",
          type: "payment",
          amount: -15000,
        },
        {
          id: "304",
          date: "2023-08-20",
          description: "Merit Scholarship",
          type: "financial aid",
          amount: 7000,
        },
      ],
    },
    achievements: [
      {
        id: "403",
        name: "Hackathon Winner",
        type: "academic",
        description: "Best Mobile App",
        date: "2023-05-10",
      },
    ],
  },
  {
    id: "3",
    name: "Sophia Martinez",
    email: "sophia.martinez@acu.edu",
    studentId: "ACU003456",
    major: "Business Administration",
    minor: "Communication",
    year: 4,
    gpa: 3.7,
    pillars: {
      christCentered: 88,
      excellence: 82,
      service: 91,
      community: 85,
    },
    history: [
      { date: "2023-01", christCentered: 84, excellence: 78, service: 87, community: 80 },
      { date: "2023-02", christCentered: 85, excellence: 79, service: 88, community: 82 },
      { date: "2023-03", christCentered: 87, excellence: 81, service: 90, community: 83 },
      { date: "2023-04", christCentered: 88, excellence: 82, service: 91, community: 85 },
    ],
    academicRecords: {
      academicStanding: "good" as const,
      totalCredits: 115,
      creditsAttempted: 120,
      creditsEarned: 115,
      gpa: 3.7,
      courses: [
        {
          id: "107",
          code: "BUS301",
          name: "Marketing Management",
          semester: "Fall",
          year: 2022,
          credits: 3,
          grade: "B",
          status: "completed",
        },
        {
          id: "108",
          code: "COM201",
          name: "Public Speaking",
          semester: "Spring",
          year: 2023,
          credits: 3,
          grade: "A",
          status: "completed",
        },
        {
          id: "109",
          code: "BUS401",
          name: "Strategic Management",
          semester: "Fall",
          year: 2023,
          credits: 3,
          status: "in-progress",
        },
      ],
    },
    financialStanding: {
      tuitionTotal: 30000,
      tuitionPaid: 30000,
      accountBalance: 0,
      financialAid: [
        {
          id: "205",
          type: "scholarship",
          name: "Leadership Scholarship",
          amount: 6000,
          status: "disbursed",
        },
      ],
      transactions: [
        {
          id: "305",
          date: "2023-08-15",
          description: "Tuition Payment",
          type: "payment",
          amount: -15000,
        },
        {
          id: "306",
          date: "2023-08-20",
          description: "Leadership Scholarship",
          type: "financial aid",
          amount: 6000,
        },
      ],
    },
    achievements: [
      {
        id: "404",
        name: "Student Government President",
        type: "leadership",
        description: "2022-2023",
        date: "2023-05-01",
      },
    ],
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.wilson@acu.edu",
    studentId: "ACU004567",
    major: "Engineering",
    minor: "Physics",
    year: 1,
    gpa: 3.5,
    pillars: {
      christCentered: 65,
      excellence: 79,
      service: 88,
      community: 72,
    },
    history: [
      { date: "2023-01", christCentered: 60, excellence: 74, service: 84, community: 67 },
      { date: "2023-02", christCentered: 62, excellence: 76, service: 85, community: 69 },
      { date: "2023-03", christCentered: 63, excellence: 77, service: 87, community: 70 },
      { date: "2023-04", christCentered: 65, excellence: 79, service: 88, community: 72 },
    ],
    academicRecords: {
      academicStanding: "good" as const,
      totalCredits: 28,
      creditsAttempted: 30,
      creditsEarned: 28,
      gpa: 3.5,
      courses: [
        {
          id: "110",
          code: "ENG101",
          name: "Introduction to Engineering",
          semester: "Fall",
          year: 2022,
          credits: 3,
          grade: "C",
          status: "completed",
        },
        {
          id: "111",
          code: "PHY101",
          name: "Physics I",
          semester: "Spring",
          year: 2023,
          credits: 4,
          grade: "B",
          status: "completed",
        },
        {
          id: "112",
          code: "MAT101",
          name: "Calculus I",
          semester: "Fall",
          year: 2023,
          credits: 4,
          status: "in-progress",
        },
      ],
    },
    financialStanding: {
      tuitionTotal: 30000,
      tuitionPaid: 15000,
      accountBalance: 15000,
      financialAid: [],
      transactions: [
        {
          id: "307",
          date: "2023-08-15",
          description: "Tuition Payment",
          type: "payment",
          amount: -15000,
        },
      ],
    },
    achievements: [],
  },
  {
    id: "5",
    name: "Olivia Thompson",
    email: "olivia.thompson@acu.edu",
    studentId: "ACU005678",
    major: "Education",
    minor: "Psychology",
    year: 3,
    gpa: 3.6,
    pillars: {
      christCentered: 93,
      excellence: 85,
      service: 72,
      community: 91,
    },
    history: [
      { date: "2023-01", christCentered: 89, excellence: 80, service: 68, community: 86 },
      { date: "2023-02", christCentered: 90, excellence: 82, service: 69, community: 88 },
      { date: "2023-03", christCentered: 92, excellence: 83, service: 71, community: 89 },
      { date: "2023-04", christCentered: 93, excellence: 85, service: 72, community: 91 },
    ],
    academicRecords: {
      academicStanding: "good" as const,
      totalCredits: 88,
      creditsAttempted: 93,
      creditsEarned: 88,
      gpa: 3.6,
      courses: [
        {
          id: "113",
          code: "EDU201",
          name: "Educational Psychology",
          semester: "Fall",
          year: 2022,
          credits: 3,
          grade: "B",
          status: "completed",
        },
        {
          id: "114",
          code: "PSY201",
          name: "Child Development",
          semester: "Spring",
          year: 2023,
          credits: 3,
          grade: "B",
          status: "completed",
        },
        {
          id: "115",
          code: "EDU301",
          name: "Curriculum Development",
          semester: "Fall",
          year: 2023,
          credits: 3,
          status: "in-progress",
        },
      ],
    },
    financialStanding: {
      tuitionTotal: 30000,
      tuitionPaid: 20000,
      accountBalance: 10000,
      financialAid: [
        {
          id: "206",
          type: "loan",
          name: "Federal Student Loan",
          amount: 10000,
          status: "disbursed",
        },
      ],
      transactions: [
        {
          id: "308",
          date: "2023-08-15",
          description: "Tuition Payment",
          type: "payment",
          amount: -10000,
        },
        {
          id: "309",
          date: "2023-08-20",
          description: "Federal Student Loan",
          type: "financial aid",
          amount: 10000,
        },
      ],
    },
    achievements: [
      {
        id: "405",
        name: "Tutor of the Year",
        type: "service",
        description: "Math Center",
        date: "2023-04-28",
      },
    ],
  },
]

// User types with avatars
export const userTypes = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full access to all features and data",
    avatar: "/placeholder.svg?height=40&width=40&text=A",
    permissions: ["view", "edit", "delete", "manage_users"],
  },
  {
    id: "leader",
    name: "Faculty Leader",
    description: "Can view and edit student data",
    avatar: "/placeholder.svg?height=40&width=40&text=L",
    permissions: ["view", "edit"],
  },
  {
    id: "student",
    name: "Student",
    description: "Can view own data only",
    avatar: "/placeholder.svg?height=40&width=40&text=S",
    permissions: ["view_own"],
  },
]

// Helper functions
export function getStudentById(id: string) {
  return students.find((student) => student.id === id) || null
}

export function getAllStudents() {
  return students
}

export function getUserTypeById(id: string) {
  return userTypes.find((type) => type.id === id) || null
}

// Mock function for user role
export function useUserRole() {
  // In a real app, this would come from an auth context
  return "admin"
}
