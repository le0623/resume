/**
 * Utility functions for parsing and formatting resume content
 * Used by both preview-template and generate-pdf APIs
 */

export interface ResumeData {
  NAME: string
  TITLE: string
  EMAIL: string
  PHONE: string
  LOCATION: string
  SUMMARY: string
  SKILLS: string
  EXPERIENCE: string
  EDUCATION: string
  PROJECTS: string
  CERTIFICATIONS: string
}

/**
 * Parse resume content using the new bracket format
 * Handles multi-line content within each section
 */
export function parseResumeContent(resume: string): ResumeData {
  const data: ResumeData = {
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

  // Extract sections using regex patterns - handle multi-line content
  const nameMatch = resume.match(/\[Name\]\s*([\s\S]*?)\s*\[Name\]/i)
  if (nameMatch) data.NAME = nameMatch[1].trim()

  const emailMatch = resume.match(/\[Email\]\s*([\s\S]*?)\s*\[Email\]/i)
  if (emailMatch) data.EMAIL = emailMatch[1].trim()

  const phoneMatch = resume.match(/\[Phone\]\s*([\s\S]*?)\s*\[Phone\]/i)
  if (phoneMatch) data.PHONE = phoneMatch[1].trim()

  const locationMatch = resume.match(/\[Location\]\s*([\s\S]*?)\s*\[Location\]/i)
  if (locationMatch) data.LOCATION = locationMatch[1].trim()

  // Extract summary
  const summaryMatch = resume.match(/\[PROFESSIONAL SUMMARY\]\s*([\s\S]*?)\s*\[PROFESSIONAL SUMMARY\]/i)
  if (summaryMatch) data.SUMMARY = formatTextWithLineBreaks(summaryMatch[1].trim())

  // Extract skills
  const skillsMatch = resume.match(/\[TECHNICAL SKILLS\]\s*([\s\S]*?)\s*\[TECHNICAL SKILLS\]/i)
  if (skillsMatch) {
    data.SKILLS = formatSkills(skillsMatch[1].trim())
  }

  // Extract experience
  const experienceMatch = resume.match(/\[PROFESSIONAL EXPERIENCE\]\s*([\s\S]*?)\s*\[PROFESSIONAL EXPERIENCE\]/i)
  if (experienceMatch) {
    data.EXPERIENCE = formatExperience(experienceMatch[1].trim())
  }

  // Extract education
  const educationMatch = resume.match(/\[EDUCATION\]\s*([\s\S]*?)\s*\[EDUCATION\]/i)
  if (educationMatch) {
    data.EDUCATION = formatEducation(educationMatch[1].trim())
  }

  // Extract projects
  const projectsMatch = resume.match(/\[PROJECTS\]\s*([\s\S]*?)\s*\[PROJECTS\]/i)
  if (projectsMatch) {
    data.PROJECTS = formatProjects(projectsMatch[1].trim())
  }

  // Extract certifications
  const certsMatch = resume.match(/\[CERTIFICATIONS\]\s*([\s\S]*?)\s*\[CERTIFICATIONS\]/i)
  if (certsMatch) {
    data.CERTIFICATIONS = formatCertifications(certsMatch[1].trim())
  }

  return data
}

/**
 * Replace placeholders in template with actual resume data
 */
export function replacePlaceholders(template: string, data: ResumeData): string {
  let result = template
  
  Object.keys(data).forEach(key => {
    const placeholder = `{{${key}}}`
    result = result.replace(new RegExp(placeholder, 'g'), data[key as keyof ResumeData] || '')
  })
  
  return result
}

/**
 * Format text with line breaks for HTML display
 */
export function formatTextWithLineBreaks(text: string): string {
  return text.replace(/\n/g, '<br>')
}

/**
 * Format skills section with categories
 */
export function formatSkills(skillsText: string): string {
  const lines = skillsText.split('\n').filter(line => line.trim())
  let html = ''
  
  lines.forEach(line => {
    if (line.includes(':')) {
      const [category, skills] = line.split(':')
      html += `<div class="skill-category">
        <h4>${category.trim()}</h4>
        <div class="skill-list">${formatTextWithLineBreaks(skills.trim())}</div>
      </div>`
    } else {
      html += `<div class="skill-category">
        <h4>Skills</h4>
        <div class="skill-list">${formatTextWithLineBreaks(line.trim())}</div>
      </div>`
    }
  })
  
  return html
}

/**
 * Format experience section with job entries
 */
export function formatExperience(expText: string): string {
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
        <div class="item-description">${formatTextWithLineBreaks(description)}</div>
      </div>`
    }
  })
  
  return html
}

/**
 * Format education section with degree entries
 */
export function formatEducation(eduText: string): string {
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

/**
 * Format projects section with project entries
 */
export function formatProjects(projText: string): string {
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
        <div class="item-description">${formatTextWithLineBreaks(description)}</div>
      </div>`
    }
  })
  
  return html
}

/**
 * Format certifications section with certification entries
 * Limits to 3 items to prevent taking up too much space
 */
export function formatCertifications(certText: string): string {
  const items = certText.split('\n').filter(item => item.trim()).slice(0, 3) // Limit to 3 items
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

/**
 * Remove placeholder brackets from GPT response
 * Removes [text], {text}, or (text) patterns
 */
export function removePlaceholders(text: string): string {
  return text
    .replace(/\[[^\]]*\]/g, '') // Remove [text] patterns
    .replace(/\{[^}]*\}/g, '') // Remove {text} patterns
    .replace(/\([^)]*\)/g, '') // Remove (text) patterns
    .trim()
}
