import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get total counts
    const totalResumes = await prisma.resume.count()
    const totalProfiles = await prisma.profile.count()
    const totalTemplates = await prisma.template.count()

    return NextResponse.json({
      totals: {
        resumes: totalResumes,
        profiles: totalProfiles,
        templates: totalTemplates
      }
    })
  } catch (error) {
    console.error("Error fetching analytics summary:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics summary" },
      { status: 500 }
    )
  }
}
