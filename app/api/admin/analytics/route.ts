import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    // Require both start and end dates
    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: "Both startDate and endDate are required" },
        { status: 400 }
      )
    }

    const startDate = new Date(startDateParam)
    const endDate = new Date(endDateParam)
    
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999)

    // Get resume generation counts
    const whereClause = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    const resumeCounts = await prisma.resume.groupBy({
      by: ['createdAt'],
      where: whereClause,
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get total counts
    const totalResumes = await prisma.resume.count()
    const totalProfiles = await prisma.profile.count()
    const totalTemplates = await prisma.template.count()

    return NextResponse.json({
      startDate,
      endDate,
      resumeCounts,
      totals: {
        resumes: totalResumes,
        profiles: totalProfiles,
        templates: totalTemplates
      }
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
