# Dummy Data Generation Setup

This guide will help you set up and run the dummy data generation script for your Supabase database.

## Prerequisites

1. **Supabase Project**: You need a Supabase project with the following tables:
   - `users` - User profiles and authentication
   - `students` - Student-specific data (references users and companies)
   - `companies` - Company information

2. **Environment Variables**: You need to set up your Supabase credentials.

## Step 1: Set Up Environment Variables

1. **Copy the environment template**:
   ```bash
   cp env.template .env.local
   ```

2. **Edit `.env.local`** and add your Supabase credentials:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   
   # Optional: Service Role Key (for better permissions)
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Get your Supabase credentials**:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the "Project URL" and "anon/public" key
   - For the service role key, copy the "service_role" key (optional but recommended)

## Step 2: Install Dependencies

The script requires some additional dependencies. They should already be installed, but if not:

```bash
pnpm install
```

## Step 3: Run the Script

Now you can run the dummy data generation script:

```bash
pnpm generate-dummy-data
```

## What the Script Creates

### Companies (5 total)
- **Alpha Company**: Technology and leadership development
- **Bravo Company**: Teamwork and strategic thinking  
- **Charlie Company**: Academic and professional development
- **Delta Company**: Character and leadership skills
- **Echo Company**: Innovation and creative problem solving

### Students (20 total)
- **4 students per company** (distributed evenly)
- **Realistic data** including:
  - Names, emails (@acu.edu domain), phone numbers
  - DISC, Myers-Briggs, and Enneagram profiles
  - Academic roles (Freshman, Sophomore, Junior, Senior)
  - Company roles (Member, Team Lead, Project Manager, Coordinator)
  - Student IDs (6-digit numbers)
  - Academic year 2024-2025

## Troubleshooting

### Permission Errors
If you get permission errors, you may need to:

1. **Use the service role key** instead of the anon key:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Check RLS policies** in your Supabase dashboard:
   - Go to Authentication > Policies
   - Make sure the tables allow insert operations

3. **Verify table structure**:
   - Ensure your tables match the expected schema
   - Check that required columns exist

### Duplicate Key Errors
The script handles duplicates gracefully, but if you encounter issues:

1. **Check email uniqueness**: The script generates unique emails
2. **Verify student_id uniqueness**: Generated IDs are 6-digit numbers
3. **Ensure company names are unique**: Script checks for existing companies

### Environment Variable Issues
If the script can't find your environment variables:

1. **Check file location**: Make sure `.env.local` is in the project root
2. **Verify variable names**: Use exact names from the template
3. **Restart terminal**: Sometimes environment variables need a fresh terminal

## Sample Output

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
✅ Created student 3/20: Mike Johnson (mike.johnson@acu.edu) - Alpha Company
✅ Created student 4/20: Sarah Wilson (sarah.wilson@acu.edu) - Alpha Company
✅ Created student 5/20: David Brown (david.brown@acu.edu) - Bravo Company
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

## Next Steps

After running the script, you can:

1. **Test your application** with the dummy data
2. **Verify the data** in your Supabase dashboard
3. **Use the data** for development and testing
4. **Modify the script** to add more specific test data if needed

## Notes

- The script is **idempotent** - you can run it multiple times safely
- It **checks for existing data** before creating new records
- All students are **assigned to companies** automatically
- The data is **realistic** and suitable for testing
- **Email addresses** use the `acu.edu` domain for authenticity 