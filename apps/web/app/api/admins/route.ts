import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { Admin } from "@/lib/data"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "admins.json")
    const fileContents = await fs.readFile(filePath, "utf8")
    const admins: Admin[] = JSON.parse(fileContents)
    
    return NextResponse.json(admins)
  } catch (error) {
    console.error("Error reading admins:", error)
    return new NextResponse("Error reading admin data", { status: 500 })
  }
} 