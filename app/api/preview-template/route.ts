import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { resume, template = "modern" } = await request.json()

    if (!resume) {
      return NextResponse.json(
        { error: "Resume content is required" },
        { status: 400 }
      )
    }

    // Parse resume content
    const resumeData = parseResumeContent(resume)
    
    // Load template
    const templatePath = path.join(process.cwd(), "templates", `${template}.html`)
    let templateContent = fs.readFileSync(templatePath, "utf8")
    
    // Replace placeholders with actual data
    templateContent = replacePlaceholders(templateContent, resumeData)
    
    return NextResponse.json({ html: templateContent })
  } catch (error) {
    console.error("Error generating template preview:", error)
    return NextResponse.json(
      { error: "Failed to generate template preview" },
      { status: 500 }
    )
  }
}

function parseResumeContent(resume: string) {
  const data: any = {
    NAME: "John Doe",
    TITLE: "Software Engineer",
    EMAIL: "john.doe@email.com",
    PHONE: "(555) 123-4567",
    LOCATION: "San Francisco, CA",
    SUMMARY: "Experienced software engineer with expertise in modern web technologies...",
    SKILLS: "",
    EXPERIENCE: "",
    EDUCATION: "",
    PROJECTS: "",
    CERTIFICATIONS: ""
  }

  // Extract sections using regex patterns
  const nameMatch = resume.match(/\*\*Name:\*\*\s*(.+)/i)
  if (nameMatch) data.NAME = nameMatch[1].trim()

  const emailMatch = resume.match(/\*\*Email:\*\*\s*(.+)/i)
  if (emailMatch) data.EMAIL = emailMatch[1].trim()

  const phoneMatch = resume.match(/\*\*Phone:\*\*\s*(.+)/i)
  if (phoneMatch) data.PHONE = phoneMatch[1].trim()

  const locationMatch = resume.match(/\*\*Location:\*\*\s*(.+)/i)
  if (locationMatch) data.LOCATION = locationMatch[1].trim()

  // Extract summary
  const summaryMatch = resume.match(/\*\*PROFESSIONAL SUMMARY\*\*\s*([\s\S]*?)(?=\*\*|$)/i)
  if (summaryMatch) data.SUMMARY = summaryMatch[1].trim()

  // Extract skills
  const skillsMatch = resume.match(/\*\*TECHNICAL SKILLS\*\*\s*([\s\S]*?)(?=\*\*|$)/i)
  if (skillsMatch) {
    data.SKILLS = formatSkills(skillsMatch[1].trim())
  }

  // Extract experience
  const experienceMatch = resume.match(/\*\*PROFESSIONAL EXPERIENCE\*\*\s*([\s\S]*?)(?=\*\*|$)/i)
  if (experienceMatch) {
    data.EXPERIENCE = formatExperience(experienceMatch[1].trim())
  }

  // Extract education
  const educationMatch = resume.match(/\*\*EDUCATION\*\*\s*([\s\S]*?)(?=\*\*|$)/i)
  if (educationMatch) {
    data.EDUCATION = formatEducation(educationMatch[1].trim())
  }

  // Extract projects
  const projectsMatch = resume.match(/\*\*PROJECTS\*\*\s*([\s\S]*?)(?=\*\*|$)/i)
  if (projectsMatch) {
    data.PROJECTS = formatProjects(projectsMatch[1].trim())
  }

  // Extract certifications
  const certsMatch = resume.match(/\*\*CERTIFICATIONS\*\*\s*([\s\S]*?)(?=\*\*|$)/i)
  if (certsMatch) {
    data.CERTIFICATIONS = formatCertifications(certsMatch[1].trim())
  }

  return data
}

function replacePlaceholders(template: string, data: any) {
  let result = template
  
  Object.keys(data).forEach(key => {
    const placeholder = `{{${key}}}`
    result = result.replace(new RegExp(placeholder, 'g'), data[key] || '')
  })
  
  return result
}

function formatSkills(skillsText: string) {
  const lines = skillsText.split('\n').filter(line => line.trim())
  let html = ''
  
  lines.forEach(line => {
    if (line.includes(':')) {
      const [category, skills] = line.split(':')
      html += `<div class="skill-category">
        <h4>${category.trim()}</h4>
        <div class="skill-list">${skills.trim()}</div>
      </div>`
    } else {
      html += `<div class="skill-category">
        <h4>Skills</h4>
        <div class="skill-list">${line.trim()}</div>
      </div>`
    }
  })
  
  return html
}

function formatExperience(expText: string) {
  const items = expText.split(/\n(?=\w)/).filter(item => item.trim())
  let html = ''
  
  items.forEach(item => {
    const lines = item.split('\n').filter(line => line.trim())
    if (lines.length > 0) {
      const title = lines[0]
      const company = lines[1] || ''
      const date = lines[2] || ''
      const description = lines.slice(3).join('\n')
      
      html += `<div class="experience-item">
        <div class="item-header">
          <div>
            <div class="item-title">${title}</div>
            <div class="item-company">${company}</div>
          </div>
          <div class="item-date">${date}</div>
        </div>
        <div class="item-description">${description}</div>
      </div>`
    }
  })
  
  return html
}

function formatEducation(eduText: string) {
  const items = eduText.split(/\n(?=\w)/).filter(item => item.trim())
  let html = ''
  
  items.forEach(item => {
    const lines = item.split('\n').filter(line => line.trim())
    if (lines.length > 0) {
      const degree = lines[0]
      const school = lines[1] || ''
      const date = lines[2] || ''
      
      html += `<div class="education-item">
        <div class="item-header">
          <div>
            <div class="item-title">${degree}</div>
            <div class="item-company">${school}</div>
          </div>
          <div class="item-date">${date}</div>
        </div>
      </div>`
    }
  })
  
  return html
}

function formatProjects(projText: string) {
  const items = projText.split(/\n(?=\w)/).filter(item => item.trim())
  let html = ''
  
  items.forEach(item => {
    const lines = item.split('\n').filter(line => line.trim())
    if (lines.length > 0) {
      const title = lines[0]
      const description = lines.slice(1).join('\n')
      
      html += `<div class="project-item">
        <div class="item-header">
          <div class="item-title">${title}</div>
        </div>
        <div class="item-description">${description}</div>
      </div>`
    }
  })
  
  return html
}

function formatCertifications(certText: string) {
  const items = certText.split('\n').filter(item => item.trim())
  let html = ''
  
  items.forEach(item => {
    if (item.includes(' - ')) {
      const [name, issuer] = item.split(' - ')
      html += `<div class="cert-item">
        <div class="cert-name">${name.trim()}</div>
        <div class="cert-issuer">${issuer.trim()}</div>
      </div>`
    } else {
      html += `<div class="cert-item">
        <div class="cert-name">${item.trim()}</div>
      </div>`
    }
  })
  
  return html
}
