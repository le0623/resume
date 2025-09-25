"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, Download, Search, Palette } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetcher } from "@/lib/fetcher"

interface Resume {
  id: string
  jobUrl?: string
  jobDescription?: string
  generatedResume: string
  createdAt: string
  updatedAt: string
  profile: {
    id: string
    name: string
    profile: string
  }
}

interface Template {
  id: string
  name: string
  html: string
  createdAt: string
  updatedAt: string
}

export function ResumeList() {
  const { data: resumes = [], error, isLoading } = useSWR<Resume[]>("/api/admin/resumes", fetcher)
  const { data: templates = [] } = useSWR("/api/templates", fetcher)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedTemplateForResume, setSelectedTemplateForResume] = useState<Record<string, string>>({})
  const [previewHtml, setPreviewHtml] = useState("")
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  const filteredResumes = resumes.filter(resume =>
    resume.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.profile.profile.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePreview = async (resume: Resume) => {
    const selectedTemplate = selectedTemplateForResume[resume.id]
    if (!selectedTemplate) {
      alert("Please select a template for this resume first")
      return
    }
    
    setSelectedResume(resume)
    setIsPreviewOpen(true)
    setIsLoadingPreview(true)
    
    try {
      const response = await fetch("/api/preview-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: resume.generatedResume,
          templateId: selectedTemplate,
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

  const handleDownload = async (resume: Resume) => {
    const selectedTemplate = selectedTemplateForResume[resume.id]
    if (!selectedTemplate) {
      alert("Please select a template for this resume first")
      return
    }

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: resume.generatedResume,
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
      a.download = `resume-${resume.profile.name.replace(/\s+/g, '-')}-${resume.id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  if (isLoading) {
    return <div>Loading resumes...</div>
  }

  if (error) {
    return <div>Failed to load resumes</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Generated Resumes</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resumes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredResumes.map((resume) => (
          <Card key={resume.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{resume.profile.name}</CardTitle>
                  <CardDescription>{resume.profile.profile.split('\n')[0] || 'No profile info'}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {resume.jobUrl && (
                  <p><strong>Job URL:</strong> 
                    <a href={resume.jobUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                      {resume.jobUrl}
                    </a>
                  </p>
                )}
                {resume.jobDescription && (
                  <div>
                    <strong>Job Description:</strong>
                    <p className="mt-1 text-muted-foreground line-clamp-2">
                      {resume.jobDescription}
                    </p>
                  </div>
                )}
                <div>
                  <strong>Generated Resume:</strong>
                  <p className="mt-1 text-muted-foreground line-clamp-3">
                    {resume.generatedResume}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="text-sm font-medium">Select Template:</span>
                </div>
                <Select 
                  value={selectedTemplateForResume[resume.id] || ""} 
                  onValueChange={(value) => setSelectedTemplateForResume(prev => ({ ...prev, [resume.id]: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template: Template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreview(resume)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(resume)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResumes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No resumes found</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
            <DialogDescription>
              Preview of resume for {selectedResume?.profile.name}
            </DialogDescription>
          </DialogHeader>
          {selectedResume && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Profile:</strong> {selectedResume.profile.name}
                </div>
                <div>
                  <strong>Template:</strong> {templates.find((t: Template) => t.id === selectedTemplateForResume[selectedResume.id])?.name || "Not selected"}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(selectedResume.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong>Updated:</strong> {new Date(selectedResume.updatedAt).toLocaleString()}
                </div>
              </div>
              
              {selectedResume.jobUrl && (
                <div>
                  <strong>Job URL:</strong>
                  <a href={selectedResume.jobUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    {selectedResume.jobUrl}
                  </a>
                </div>
              )}
              
              {selectedResume.jobDescription && (
                <div>
                  <strong>Job Description:</strong>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                    {selectedResume.jobDescription}
                  </div>
                </div>
              )}
              
              {isLoadingPreview ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Generating preview...</p>
                  </div>
                </div>
              ) : previewHtml ? (
                <div>
                  <strong>Resume Preview:</strong>
                  <div className="mt-2 border rounded-md">
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full h-[600px] border-none"
                      title="Resume Preview"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <strong>Generated Resume:</strong>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm whitespace-pre-wrap">
                    {selectedResume.generatedResume}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
