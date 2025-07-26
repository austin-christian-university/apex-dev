# .cursor Configuration

This folder contains Cursor IDE configuration files for the apex-dev project.

## Files

### `rules`
Contains coding rules and best practices for the project, including:
- Next.js App Router best practices
- Project-specific guidelines
- UI component standards (Shadcn)
- Monorepo structure guidelines
- Code style and performance requirements

### `mcp_servers.json`
Configuration for Model Context Protocol (MCP) servers.

#### Supabase MCP Server
The Supabase MCP server provides access to your Supabase database and services directly within Cursor.

**Required Environment Variables:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

**Setup:**
1. Add these environment variables to your shell profile or `.env` file
2. Restart Cursor to load the MCP server configuration
3. The Supabase MCP server will be available for database queries and operations

**Usage:**
The Supabase MCP server allows you to:
- Query your database directly from Cursor
- Get schema information
- Execute SQL statements
- Access Supabase services

## Environment Setup

Make sure you have the following environment variables set:

```bash
export SUPABASE_URL="your-supabase-project-url"
export SUPABASE_ANON_KEY="your-supabase-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

Or add them to your `.env` file in the project root.

## Notes

- The `.cursorrules` file in the project root is deprecated in favor of the `.cursor/rules` file
- MCP servers require Cursor to be restarted after configuration changes
- Make sure you have the necessary permissions and keys for your Supabase project 