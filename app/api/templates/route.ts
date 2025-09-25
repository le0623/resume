import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/templates - Unified endpoint for fetching templates
export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error loading templates:", error)
    return NextResponse.json(
      { error: "Failed to load templates" },
      { status: 500 }
    )
  }
}

// POST /api/templates - Admin endpoint for creating templates
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const template = await prisma.template.create({
      data: {
        name: data.name,
        html: data.html
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    )
  }
}