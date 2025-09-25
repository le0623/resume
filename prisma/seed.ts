import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Read template files and create template records
  const templatesDir = path.join(process.cwd(), 'public/templates')
  const templateFiles = ['modern.html', 'classic.html', 'creative.html']

  for (const templateFile of templateFiles) {
    const templatePath = path.join(templatesDir, templateFile)

    if (fs.existsSync(templatePath)) {
      const html = fs.readFileSync(templatePath, 'utf8')
      const templateName = templateFile.replace('.html', '').charAt(0).toUpperCase() + templateFile.replace('.html', '').slice(1)

      // Check if template already exists
      const existingTemplate = await prisma.template.findFirst({
        where: { name: templateName }
      })

      if (!existingTemplate) {
        await prisma.template.create({
          data: {
            name: templateName,
            html: html
          }
        })
        console.log(`Created template: ${templateName}`)
      } else {
        console.log(`Template already exists: ${templateName}`)
      }
    }
  }

  console.log('Database seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
