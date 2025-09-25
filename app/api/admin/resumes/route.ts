import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const resumes = await prisma.resume.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
        include: {
          profile: {
            select: {
              id: true,
              name: true,
              profile: true
            }
          }
        }
    })

    const total = await prisma.resume.count()

    return NextResponse.json(resumes, {
      headers: {
        'X-Total-Count': total.toString(),
        'X-Page': page.toString(),
        'X-Limit': limit.toString()
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
