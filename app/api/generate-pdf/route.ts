import { NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"
import { prisma } from "@/lib/prisma"
import { 
  parseResumeContent, 
  replacePlaceholders,
} from "@/lib/resume-utils"

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
    
    const pdfBuffer = await generatePDF(templateContent)

    // Convert Uint8Array to Buffer for NextResponse
    const buffer = Buffer.from(pdfBuffer)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}

export async function generatePDF(html: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();
  
  // Set viewport for consistent rendering
  await page.setViewport({
    width: 794, // A4 width in pixels at 96 DPI
    height: 1123, // A4 height in pixels at 96 DPI
    deviceScaleFactor: 1,
  });
  
  await page.setContent(html, { 
    waitUntil: "networkidle0",
    timeout: 30000 
  });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: '15mm',
      right: '12mm',
      bottom: '15mm',
      left: '12mm'
    },
    preferCSSPageSize: true,
    displayHeaderFooter: false,
  });

  await browser.close();
  return pdf;
}