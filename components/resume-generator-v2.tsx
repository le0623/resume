"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, FileText, Download, Palette, Eye, User } from "lucide-react"
import { fetcher } from "@/lib/fetcher"

interface Template {
  id: string
  name: string
  description: string
  preview: string
  file: string
}

interface Profile {
  id: string
  name: string
  profile: string
}

export function ResumeGeneratorV2() {
  const [jobUrl, setJobUrl] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResume, setGeneratedResume] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedProfile, setSelectedProfile] = useState("")
  const [previewHtml, setPreviewHtml] = useState("")
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  // Fetch templates using SWR
  const { data: templates = [] } = useSWR("/api/templates", fetcher)

  // Fetch profiles using SWR
  const { data: profiles = [] } = useSWR<Profile[]>("/api/admin/profiles", fetcher)

  // Set default profile selection when data loads
  if (profiles.length > 0 && !selectedProfile) {
    setSelectedProfile(profiles[0].id)
  }

  const handleGenerate = async () => {
    if (!jobUrl && !jobDescription) {
      alert("Please provide either a job URL or job description")
      return
    }

    if (!selectedProfile) {
      alert("Please select a profile")
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
          profileId: selectedProfile,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate resume")
      }

      const data = await response.json()
      setGeneratedResume(data.resume)

      // Clear any previous template selection
      setSelectedTemplate("")
      setPreviewHtml("")
    } catch (error) {
      console.error("Error generating resume:", error)
      alert("Failed to generate resume. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePreview = async (resumeContent: string, templateId: string) => {
    if (!resumeContent) return

    setIsLoadingPreview(true)
    try {
      const response = await fetch("/api/preview-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: resumeContent,
          templateId: templateId,
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
    if (generatedResume) {
      await generatePreview(generatedResume, templateId)
    }
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
          templateId: selectedTemplate,
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
              <Label htmlFor="profile">Select Profile</Label>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {profile.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              disabled={isGenerating || (!jobUrl && !jobDescription) || !selectedProfile}
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
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Resume Preview
            </CardTitle>
            {generatedResume && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="template-select">Select Template</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template to preview" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template: Template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          {template.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select a template to preview your resume. You can change it anytime.
                </p>
              </div>
            )}
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
                  ? "Select a template above to preview your resume"
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
                disabled={isLoadingPreview || !selectedTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                {selectedTemplate ? "Download as PDF" : "Select Template First"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

    </div>
  )
}
