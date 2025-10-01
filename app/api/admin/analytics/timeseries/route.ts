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

    const startDate = new Date(startDateParam + 'T00:00:00.000Z')
    const endDate = new Date(endDateParam + 'T23:59:59.999Z')

    // Get resume count grouped by creation timestamp
    const resumes = await prisma.resume.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Return raw timestamps for frontend aggregation
    const resumeCounts = resumes.map(resume => ({
      createdAt: resume.createdAt.toISOString(),
      _count: { id: 1 }
    }))

    return NextResponse.json({
      startDate: startDateParam,
      endDate: endDateParam,
      resumeCounts
    })
  } catch (error) {
    console.error("Error fetching analytics timeseries:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics timeseries" },
      { status: 500 }
    )
  }
}
