import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const templatesPath = path.join(process.cwd(), "templates", "templates.json")
    const templatesData = fs.readFileSync(templatesPath, "utf8")
    const templates = JSON.parse(templatesData)
    
    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error loading templates:", error)
    return NextResponse.json(
      { error: "Failed to load templates" },
      { status: 500 }
    )
  }
}
