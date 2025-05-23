// Types for our data model
export interface Student {
  id: string
  name: string
  email: string
  studentId: string
  company: string
  companyRole: "President" | "Officer" | "Member"
  score: {
    lionGames: number
    attendance: number
    leadershipRoles: number
    serviceHours: number
    apartmentChecks: number
    eventExecution: number
    grades: number
  }
  scoreChangeHistory: {
    category: "lionGames" | "attendance" | "leadershipRoles" | "serviceHours" | "apartmentChecks" | "eventExecution" | "grades"
  description: string
    pointChange: number
  date: string
  }[]
}

// Company names
const companies = [
  "Alpha Company",
  "Bravo Company",
  "Charlie Company",
  "Delta Company"
] as const

// Generate 20 students (5 per company)
export const students: Student[] = [
  // Alpha Company
  {
    id: "1",
    name: "Emma Johnson",
    email: "emma.johnson@acu.edu",
    studentId: "ACU001234",
    company: "Alpha Company",
    companyRole: "President",
    score: {
      lionGames: 95,
      attendance: 98,
      leadershipRoles: 92,
      serviceHours: 88,
      apartmentChecks: 96,
      eventExecution: 94,
      grades: 3.8
    },
    scoreChangeHistory: [
      {
        category: "lionGames",
        description: "Won intramural basketball championship",
        pointChange: 10,
        date: "2024-02-15"
      },
      {
        category: "leadershipRoles",
        description: "Led company service project",
        pointChange: 5,
        date: "2024-02-10"
      }
    ]
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@acu.edu",
    studentId: "ACU002345",
    company: "Alpha Company",
    companyRole: "Officer",
    score: {
      lionGames: 88,
      attendance: 95,
      leadershipRoles: 85,
      serviceHours: 92,
      apartmentChecks: 90,
      eventExecution: 87,
      grades: 3.9
    },
    scoreChangeHistory: [
      {
        category: "serviceHours",
        description: "Organized community food drive",
        pointChange: 8,
        date: "2024-02-12"
      }
    ]
  },
  {
    id: "3",
    name: "Sophia Martinez",
    email: "sophia.martinez@acu.edu",
    studentId: "ACU003456",
    company: "Alpha Company",
    companyRole: "Member",
    score: {
      lionGames: 82,
      attendance: 90,
      leadershipRoles: 78,
      serviceHours: 85,
      apartmentChecks: 88,
      eventExecution: 80,
      grades: 3.7
    },
    scoreChangeHistory: [
      {
        category: "attendance",
        description: "Perfect attendance for the month",
        pointChange: 5,
        date: "2024-02-01"
      }
    ]
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.wilson@acu.edu",
    studentId: "ACU004567",
    company: "Alpha Company",
    companyRole: "Member",
    score: {
      lionGames: 85,
      attendance: 88,
      leadershipRoles: 75,
      serviceHours: 82,
      apartmentChecks: 85,
      eventExecution: 78,
      grades: 3.5
    },
    scoreChangeHistory: []
  },
  {
    id: "5",
    name: "Olivia Thompson",
    email: "olivia.thompson@acu.edu",
    studentId: "ACU005678",
    company: "Alpha Company",
    companyRole: "Member",
    score: {
      lionGames: 80,
      attendance: 92,
      leadershipRoles: 76,
      serviceHours: 84,
      apartmentChecks: 87,
      eventExecution: 79,
      grades: 3.6
    },
    scoreChangeHistory: [
      {
        category: "eventExecution",
        description: "Helped organize company social",
        pointChange: 3,
        date: "2024-02-05"
      }
    ]
  },

  // Bravo Company
  {
    id: "6",
    name: "Daniel Kim",
    email: "daniel.kim@acu.edu",
    studentId: "ACU006789",
    company: "Bravo Company",
    companyRole: "President",
    score: {
      lionGames: 92,
      attendance: 96,
      leadershipRoles: 90,
      serviceHours: 94,
      apartmentChecks: 95,
      eventExecution: 91,
      grades: 3.9
    },
    scoreChangeHistory: [
      {
        category: "leadershipRoles",
        description: "Led company to victory in campus competition",
        pointChange: 8,
        date: "2024-02-14"
      }
    ]
  },
  {
    id: "7",
    name: "Ava Rodriguez",
    email: "ava.rodriguez@acu.edu",
    studentId: "ACU007890",
    company: "Bravo Company",
    companyRole: "Officer",
    score: {
      lionGames: 87,
      attendance: 94,
      leadershipRoles: 86,
      serviceHours: 90,
      apartmentChecks: 92,
      eventExecution: 88,
      grades: 3.8
    },
    scoreChangeHistory: [
      {
        category: "serviceHours",
        description: "Coordinated volunteer event",
        pointChange: 6,
        date: "2024-02-08"
      }
    ]
  },
  {
    id: "8",
    name: "Ethan Patel",
    email: "ethan.patel@acu.edu",
    studentId: "ACU008901",
    company: "Bravo Company",
    companyRole: "Member",
    score: {
      lionGames: 84,
      attendance: 89,
      leadershipRoles: 80,
      serviceHours: 86,
      apartmentChecks: 88,
      eventExecution: 82,
      grades: 3.7
    },
    scoreChangeHistory: []
  },
  {
    id: "9",
    name: "Isabella Lee",
    email: "isabella.lee@acu.edu",
    studentId: "ACU009012",
    company: "Bravo Company",
    companyRole: "Member",
    score: {
      lionGames: 81,
      attendance: 91,
      leadershipRoles: 78,
      serviceHours: 84,
      apartmentChecks: 86,
      eventExecution: 80,
      grades: 3.6
    },
    scoreChangeHistory: [
      {
        category: "grades",
        description: "Improved semester GPA",
        pointChange: 4,
        date: "2024-02-01"
      }
    ]
  },
  {
    id: "10",
    name: "Noah Garcia",
    email: "noah.garcia@acu.edu",
    studentId: "ACU010123",
    company: "Bravo Company",
    companyRole: "Member",
    score: {
      lionGames: 83,
      attendance: 88,
      leadershipRoles: 79,
      serviceHours: 85,
      apartmentChecks: 87,
      eventExecution: 81,
      grades: 3.5
    },
    scoreChangeHistory: []
  },

  // Charlie Company
  {
    id: "11",
    name: "Mia Anderson",
    email: "mia.anderson@acu.edu",
    studentId: "ACU011234",
    company: "Charlie Company",
    companyRole: "President",
    score: {
      lionGames: 94,
      attendance: 97,
      leadershipRoles: 91,
      serviceHours: 93,
      apartmentChecks: 96,
      eventExecution: 92,
      grades: 3.9
    },
    scoreChangeHistory: [
      {
        category: "eventExecution",
        description: "Successfully organized major campus event",
        pointChange: 9,
        date: "2024-02-16"
      }
    ]
  },
  {
    id: "12",
    name: "Lucas Taylor",
    email: "lucas.taylor@acu.edu",
    studentId: "ACU012345",
    company: "Charlie Company",
    companyRole: "Officer",
    score: {
      lionGames: 89,
      attendance: 95,
      leadershipRoles: 87,
      serviceHours: 91,
      apartmentChecks: 93,
      eventExecution: 89,
      grades: 3.8
    },
    scoreChangeHistory: [
      {
        category: "lionGames",
        description: "Led team to second place in tournament",
        pointChange: 7,
        date: "2024-02-13"
      }
    ]
  },
  {
    id: "13",
    name: "Charlotte Brown",
    email: "charlotte.brown@acu.edu",
    studentId: "ACU013456",
    company: "Charlie Company",
    companyRole: "Member",
    score: {
      lionGames: 86,
      attendance: 90,
      leadershipRoles: 82,
      serviceHours: 87,
      apartmentChecks: 89,
      eventExecution: 84,
      grades: 3.7
    },
    scoreChangeHistory: []
  },
  {
    id: "14",
    name: "William Clark",
    email: "william.clark@acu.edu",
    studentId: "ACU014567",
    company: "Charlie Company",
    companyRole: "Member",
    score: {
      lionGames: 82,
      attendance: 89,
      leadershipRoles: 79,
      serviceHours: 85,
      apartmentChecks: 87,
      eventExecution: 81,
      grades: 3.6
    },
    scoreChangeHistory: [
      {
        category: "apartmentChecks",
        description: "Perfect apartment check score",
        pointChange: 5,
        date: "2024-02-07"
      }
    ]
  },
  {
    id: "15",
    name: "Amelia White",
    email: "amelia.white@acu.edu",
    studentId: "ACU015678",
    company: "Charlie Company",
    companyRole: "Member",
    score: {
      lionGames: 84,
      attendance: 91,
      leadershipRoles: 80,
      serviceHours: 86,
      apartmentChecks: 88,
      eventExecution: 83,
      grades: 3.5
    },
    scoreChangeHistory: []
  },

  // Delta Company
  {
    id: "16",
    name: "Benjamin Harris",
    email: "benjamin.harris@acu.edu",
    studentId: "ACU016789",
    company: "Delta Company",
    companyRole: "President",
    score: {
      lionGames: 93,
      attendance: 96,
      leadershipRoles: 89,
      serviceHours: 92,
      apartmentChecks: 95,
      eventExecution: 90,
      grades: 3.9
    },
    scoreChangeHistory: [
      {
        category: "leadershipRoles",
        description: "Implemented new company initiative",
        pointChange: 8,
        date: "2024-02-11"
      }
    ]
  },
  {
    id: "17",
    name: "Harper Lewis",
    email: "harper.lewis@acu.edu",
    studentId: "ACU017890",
    company: "Delta Company",
    companyRole: "Officer",
    score: {
      lionGames: 88,
      attendance: 94,
      leadershipRoles: 85,
      serviceHours: 90,
      apartmentChecks: 92,
      eventExecution: 87,
      grades: 3.8
    },
    scoreChangeHistory: [
      {
        category: "serviceHours",
        description: "Organized successful fundraiser",
        pointChange: 6,
        date: "2024-02-09"
      }
    ]
  },
  {
    id: "18",
    name: "Henry Walker",
    email: "henry.walker@acu.edu",
    studentId: "ACU018901",
    company: "Delta Company",
    companyRole: "Member",
    score: {
      lionGames: 85,
      attendance: 90,
      leadershipRoles: 81,
      serviceHours: 87,
      apartmentChecks: 89,
      eventExecution: 84,
      grades: 3.7
    },
    scoreChangeHistory: []
  },
  {
    id: "19",
    name: "Evelyn Hall",
    email: "evelyn.hall@acu.edu",
    studentId: "ACU019012",
    company: "Delta Company",
    companyRole: "Member",
    score: {
      lionGames: 83,
      attendance: 88,
      leadershipRoles: 79,
      serviceHours: 85,
      apartmentChecks: 87,
      eventExecution: 82,
      grades: 3.6
    },
    scoreChangeHistory: [
      {
        category: "grades",
        description: "Achieved Dean's List",
        pointChange: 5,
        date: "2024-02-01"
      }
    ]
  },
  {
    id: "20",
    name: "Sebastian Young",
    email: "sebastian.young@acu.edu",
    studentId: "ACU020123",
    company: "Delta Company",
    companyRole: "Member",
    score: {
      lionGames: 81,
      attendance: 89,
      leadershipRoles: 78,
      serviceHours: 84,
      apartmentChecks: 86,
      eventExecution: 80,
      grades: 3.5
    },
    scoreChangeHistory: []
  }
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
    name: "Student Leader",
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

export function getStudentsByCompany(company: string) {
  return students.filter((student) => student.company === company)
}

export function getUserTypeById(id: string) {
  return userTypes.find((type) => type.id === id) || null
}

// Mock function for user role
export function useUserRole() {
  // In a real app, this would come from an auth context
  return "admin"
}
