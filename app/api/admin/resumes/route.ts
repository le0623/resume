import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || ''

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { jobUrl: { contains: search, mode: 'insensitive' as const } },
            { jobDescription: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const resumes = await prisma.resume.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        jobUrl: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    const total = await prisma.resume.count({ where })

    return NextResponse.json({
      data: resumes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching resumes:", error)
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    )
  }
}
