"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Loader2, FileText, Download, Palette, Eye } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  preview: string
  file: string
}

export function ResumeGenerator() {
  const [jobUrl, setJobUrl] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResume, setGeneratedResume] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("modern")
  const [templates, setTemplates] = useState<Template[]>([])
  const [previewHtml, setPreviewHtml] = useState("")
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates")
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error("Error fetching templates:", error)
    }
  }

  const handleGenerate = async () => {
    if (!jobUrl && !jobDescription) {
      alert("Please provide either a job URL or job description")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobUrl,
          jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate resume")
      }

      const data = await response.json()
      setGeneratedResume(data.resume)

      // Auto-generate preview with default template
      await generatePreview("modern")
    } catch (error) {
      console.error("Error generating resume:", error)
      alert("Failed to generate resume. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePreview = async (templateId: string) => {
    if (!generatedResume) return

    setIsLoadingPreview(true)
    try {
      const response = await fetch("/api/preview-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: generatedResume,
          template: templateId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate preview")
      }

      const data = await response.json()
      setPreviewHtml(data.html)
    } catch (error) {
      console.error("Error generating preview:", error)
      alert("Failed to generate preview. Please try again.")
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleTemplateChange = async (templateId: string) => {
    setSelectedTemplate(templateId)
    await generatePreview(templateId)
    setIsSheetOpen(false)
  }

  const handleDownloadPDF = async () => {
    if (!generatedResume) return

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: generatedResume,
          template: selectedTemplate,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `resume-${selectedTemplate}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Section - Job Input */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Job Information
            </CardTitle>
            <CardDescription>
              Provide either a job URL or paste the job description
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-url">Job URL (Optional)</Label>
              <Input
                id="job-url"
                type="url"
                placeholder="https://example.com/job-posting"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                placeholder="Paste the job description here..."
                className="max-h-96 overflow-y-auto"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || (!jobUrl && !jobDescription)}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Resume...
                </>
              ) : (
                "Generate Resume"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Right Section - Preview */}
      <div className="min-h-[calc(100vh-128px)]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Resume Preview
              </div>
              <Button variant="outline" onClick={() => setIsSheetOpen(true)}>
                <Palette className="h-4 w-4" />
                Browse Templates
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Preview Area */}
            {isLoadingPreview ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border border-gray-300"
                title="Resume Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                {generatedResume
                  ? "Select a template to preview your resume"
                  : "Generate a resume to see preview here"
                }
              </div>
            )}
          </CardContent>
          <CardFooter>
            {generatedResume && (
              <Button
                onClick={handleDownloadPDF}
                className="w-full"
                disabled={isLoadingPreview}
              >
                <Download className="mr-2 h-4 w-4" />
                Download as PDF
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Template Selection Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Choose Template
            </SheetTitle>
            <SheetDescription>
              Select a template for your resume
            </SheetDescription>
          </SheetHeader>
          <div className="p-6 space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedTemplate === template.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
                  }`}
                onClick={() => handleTemplateChange(template.id)}
              >
                <div className="space-y-2">
                  <div className="font-medium text-lg">{template.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {template.description}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    Click to preview
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
