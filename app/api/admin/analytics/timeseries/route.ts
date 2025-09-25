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
    const resumeCounts = await prisma.resume.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

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
