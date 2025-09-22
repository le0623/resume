# Resume Generator

A modern web application that generates tailored resumes based on job descriptions using OpenAI's GPT models. Built with Next.js, Tailwind CSS, and shadcn/ui components.

## ✨ Features

- 🌙 **Dark/Light Mode**: Toggle between themes with a beautiful UI
- 🤖 **AI-Powered**: Uses OpenAI GPT to generate tailored resumes
- 📄 **PDF Export**: Download generated resumes as PDF files using Puppeteer
- 🎨 **Multiple Templates**: Choose from 3 beautiful resume templates
- 👁️ **Template Preview**: Preview templates before generating your resume
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- ⚡ **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## 🎨 Available Templates

### 1. Modern Template
- Clean and professional design
- Blue color scheme
- Grid-based layout for skills
- Perfect for tech professionals

### 2. Classic Template
- Traditional serif font
- Formal black and white layout
- Two-column skills layout
- Ideal for corporate environments

### 3. Creative Template
- Modern gradient design
- Colorful and eye-catching
- Creative visual elements
- Great for designers and creatives

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resume-gen
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

1. **Enter Job Information**: 
   - Optionally provide a job URL
   - Paste the job description in the text area

2. **Select Template**: 
   - Choose from 3 available templates
   - Preview templates before generating

3. **Generate Resume**: 
   - Click "Generate Resume" to create an AI-tailored resume
   - The resume will appear in the right panel

4. **Download PDF**: 
   - Click "Download as PDF" to save the resume as a PDF file
   - The PDF will be generated using the selected template

## 🔧 API Endpoints

### POST /api/generate-resume
Generates a resume based on job information.

**Request Body:**
```json
{
  "jobUrl": "https://example.com/job-posting",
  "jobDescription": "Job description text..."
}
```

**Response:**
```json
{
  "resume": "Generated resume text..."
}
```

### POST /api/generate-pdf
Converts resume text to PDF format using the selected template.

**Request Body:**
```json
{
  "resume": "Resume text to convert...",
  "template": "modern"
}
```

**Response:** PDF file download

### GET /api/templates
Returns available resume templates.

**Response:**
```json
{
  "templates": [
    {
      "id": "modern",
      "name": "Modern",
      "description": "Clean and professional design with blue accents",
      "preview": "/templates/modern.html",
      "file": "modern.html"
    }
  ]
}
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **AI**: OpenAI GPT-3.5-turbo
- **PDF Generation**: Puppeteer
- **Theme**: next-themes
- **Icons**: Lucide React

## 📁 Project Structure

```
resume-gen/
├── app/
│   ├── api/
│   │   ├── generate-resume/
│   │   ├── generate-pdf/
│   │   └── templates/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── theme/
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   └── switch.tsx
│   └── resume-generator.tsx
├── templates/
│   ├── modern.html
│   ├── classic.html
│   ├── creative.html
│   └── templates.json
├── public/
│   └── templates/
│       ├── modern.html
│       ├── classic.html
│       └── creative.html
└── lib/
    └── utils.ts
```

## 🎯 Template Customization

Templates are located in the `/templates` directory. Each template uses placeholder variables:

- `{{NAME}}` - Candidate name
- `{{TITLE}}` - Job title
- `{{EMAIL}}` - Email address
- `{{PHONE}}` - Phone number
- `{{LOCATION}}` - Location
- `{{SUMMARY}}` - Professional summary
- `{{SKILLS}}` - Technical skills (HTML formatted)
- `{{EXPERIENCE}}` - Work experience (HTML formatted)
- `{{EDUCATION}}` - Education (HTML formatted)
- `{{PROJECTS}}` - Projects (HTML formatted)
- `{{CERTIFICATIONS}}` - Certifications (HTML formatted)

## 🚀 Deployment

The application can be deployed to any platform that supports Next.js:

1. **Vercel** (Recommended)
2. **Netlify**
3. **Railway**
4. **DigitalOcean App Platform**

Make sure to set the `OPENAI_API_KEY` environment variable in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
