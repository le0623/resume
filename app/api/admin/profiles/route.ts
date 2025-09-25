import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        resumes: {
          select: {
            id: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json(profiles)
  } catch (error) {
    console.error("Error fetching profiles:", error)
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const profile = await prisma.profile.create({
      data: {
        name: data.name,
        profile: data.profile
      }
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error("Error creating profile:", error)
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    )
  }
}
