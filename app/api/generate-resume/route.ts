import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { jobUrl, jobDescription } = await request.json()

    if (!jobUrl && !jobDescription) {
      return NextResponse.json(
        { error: "Either job URL or job description is required" },
        { status: 400 }
      )
    }

    let jobInfo = ""

    if (jobUrl) {
      jobInfo = `Job URL: ${jobUrl}\n\n`
    }

    if (jobDescription) {
      jobInfo += `Job Description:\n${jobDescription}`
    }

    const prompt = `Based on the following job information, generate a professional resume that highlights relevant skills and experience. The resume should be well-structured and tailored to match the job requirements.

${jobInfo}

Please generate a complete resume in the following format:

**Name:** Michael Estrada
**Email:** michael.edy718@gmail.com
**Phone:** +1 909-729-3383
**Location:** Corpus Christi, Texas

**PROFESSIONAL SUMMARY**
[2-3 sentences highlighting key qualifications and career objectives]

**TECHNICAL SKILLS**
[Relevant technical skills, programming languages, tools, etc.]

**PROFESSIONAL EXPERIENCE**
[3-4 relevant work experiences with bullet points highlighting achievements]

**EDUCATION**
[Relevant educational background]

**PROJECTS**
[2-3 relevant projects with descriptions]

**CERTIFICATIONS**
[Any relevant certifications]

Make sure the resume is tailored to the specific job requirements and uses industry-standard formatting.`

    const response = await openai.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
          ],
        },
      ],
    })

    const resume = response.output_text

    return NextResponse.json({ resume })
  } catch (error) {
    console.error("Error generating resume:", error)
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    )
  }
}
