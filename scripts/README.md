# Scripts

This directory contains utility scripts for the ACU Apex application.

## Generate Dummy Data

The `generate-dummy-data.ts` script creates test data for your Supabase database, including:

- 5 companies (Alpha, Bravo, Charlie, Delta, Echo)
- 20 student users assigned to these companies
- Realistic test data with names, emails, phone numbers, and profiles

### Prerequisites

1. **Environment Variables**: Make sure you have the following environment variables set:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   # Optional: SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (for better permissions)
   ```

2. **Dependencies**: Install the required dependencies:
   ```bash
   pnpm install
   ```

### Usage

Run the script from the project root:

```bash
pnpm generate-dummy-data
```

Or run it directly with tsx:

```bash
npx tsx scripts/generate-dummy-data.ts
```

### What the Script Does

1. **Checks Existing Data**: First checks if companies and students already exist
2. **Creates Companies**: Creates 5 sample companies if they don't exist
3. **Creates Students**: Creates 20 student users and assigns them to companies
4. **Provides Summary**: Shows a summary of created data

### Sample Output

```
🚀 Starting dummy data generation...

📊 Existing data: 0 companies, 0 students
Creating companies...
✅ Created company: Alpha Company
✅ Created company: Bravo Company
✅ Created company: Charlie Company
✅ Created company: Delta Company
✅ Created company: Echo Company

Creating students...
✅ Created student 1/20: John Smith (john.smith@acu.edu) - Alpha Company
✅ Created student 2/20: Jane Doe (jane.doe@acu.edu) - Alpha Company
...

🎉 Dummy data generation completed!
📊 Created 5 companies and 20 students

📋 Summary:
  Alpha Company: 4 students
  Bravo Company: 4 students
  Charlie Company: 4 students
  Delta Company: 4 students
  Echo Company: 4 students
```

### Data Structure

The script creates:

**Companies:**
- Name, description, motto, vision, quote
- All companies are set as active

**Students:**
- Full user profile with name, email, phone, profiles
- Student-specific data (academic role, company role, student ID)
- Assigned to companies with realistic distribution

### Notes

- The script is idempotent - it won't create duplicate data if run multiple times
- Uses realistic test data with faker.js
- All students are assigned the 2024-2025 academic year
- Student IDs are 6-digit numbers between 100000-999999
- Email addresses use the `acu.edu` domain

### Troubleshooting

**Permission Errors**: If you get permission errors, you may need to:
1. Use the service role key instead of the anon key
2. Check your Supabase RLS (Row Level Security) policies
3. Ensure your database tables exist and have the correct structure

**Duplicate Key Errors**: The script handles duplicates gracefully, but if you encounter issues:
1. Check if the email addresses are unique
2. Verify the student_id values are unique
3. Ensure the company names are unique 