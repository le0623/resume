import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseResumeContent, replacePlaceholders } from "@/lib/resume-utils"

export async function POST(request: NextRequest) {
  try {
    const { resume, templateId } = await request.json()

    if (!resume) {
      return NextResponse.json(
        { error: "Resume content is required" },
        { status: 400 }
      )
    }

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    // Parse resume content
    const resumeData = parseResumeContent(resume)
    
    // Load template from database
    const template = await prisma.template.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }
    
    // Replace placeholders with actual data
    const templateContent = replacePlaceholders(template.html, resumeData)
    
    return NextResponse.json({ html: templateContent })
  } catch (error) {
    console.error("Error generating template preview:", error)
    return NextResponse.json(
      { error: "Failed to generate template preview" },
      { status: 500 }
    )
  }
}

