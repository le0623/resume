import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { prisma } from "@/lib/prisma"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { jobUrl, jobDescription, profileId } = await request.json()

    if (!jobUrl && !jobDescription) {
      return NextResponse.json(
        { error: "Either job URL or job description is required" },
        { status: 400 }
      )
    }

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      )
    }

    // Fetch profile and template from database
    const profile = await prisma.profile.findUnique({
      where: { id: profileId }
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }


    let jobInfo = ""

    if (jobUrl) {
      jobInfo = `Job URL: ${jobUrl}\n\n`
    }

    if (jobDescription) {
      jobInfo += `Job Description:\n${jobDescription}`
    }

    const prompt = `Based on the following job information and profile data, generate a professional resume that highlights relevant skills and experience. The resume should be well-structured and tailored to match the job requirements.

Job Information (Surrounded with ===========):
===========
${jobInfo}
===========

Profile Data (Surrounded with ===========):
===========
${profile.profile}
===========

Please generate a complete resume in the following EXACT format with square brackets:

[Name]
[Extract and use the actual name from the profile data]
[Name]

[Email]
[Extract and use the actual email from the profile data]
[Email]

[Phone]
[Extract and use the actual phone from the profile data]
[Phone]

[Location]
[Extract and use the actual location from the profile data]
[Location]

[PROFESSIONAL SUMMARY]
Write 2-3 sentences highlighting key qualifications and career objectives based on the profile and job requirements.
[PROFESSIONAL SUMMARY]

[TECHNICAL SKILLS]
List relevant technical skills, programming languages, tools, etc. from the profile that match the job requirements.
[TECHNICAL SKILLS]

[PROFESSIONAL EXPERIENCE]
Include 3-4 relevant work experiences from the profile, tailored to job requirements with bullet points highlighting achievements.
Do not list current/ongoing company names or job titles; treat the latest job as ending a few months ago and include gaps between jobs to reflect realistic timelines.
[PROFESSIONAL EXPERIENCE]

[EDUCATION]
Include relevant educational background from the profile.
[EDUCATION]

[PROJECTS]
Include 2-3 relevant projects from the profile with descriptions.
[PROJECTS]

[CERTIFICATIONS]
Include only the 3-5 most relevant certifications from the profile that match the job requirements. Do not include more than 5 certifications.
[CERTIFICATIONS]

IMPORTANT INSTRUCTIONS:
- Use the EXACT bracket format shown above: [SectionName] content [SectionName]
- Extract actual data from the profile (name, email, phone, location)
- Do NOT use placeholder text or generic examples
- Avoid job-post-style phrasing in the summary (e.g., "remote-ready" or "seeking [Role]"); focus on skills, experience, and achievements only.
- Keep certifications limited to maximum 5 items
- Make sure the resume is tailored to the specific job requirements and uses industry-standard formatting.
- For all other sections (work experience, projects, education, certifications, skills), fabricate realistic, professional-sounding details that match the candidate's persona and the target job requirements.
- Never ask the user for more details.
- The output must always be a polished, ready-to-use resume.
- Each section must be properly enclosed with matching opening and closing brackets.`

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

    // Save the generated resume to the database
    await prisma.resume.create({
      data: {
        jobUrl: jobUrl || null,
        jobDescription: jobDescription || "",
        generatedResume: resume,
        profile: {
          connect: {
            id: profileId
          }
        }
      }
    })

    return NextResponse.json({ 
      resume,
    })
  } catch (error) {
    console.error("Error generating resume:", error)
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    )
  }
}
