"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { fetcher } from "@/lib/fetcher"

interface ResumeDetail {
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

interface ResumePreviewSheetProps {
  resumeId: string | null
  isOpen: boolean
  onClose: () => void
}

export function ResumePreviewSheet({ resumeId, isOpen, onClose }: ResumePreviewSheetProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [previewHtml, setPreviewHtml] = useState("")
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  // Fetch resume details
  const { data: resume, isLoading: isLoadingResume } = useSWR<ResumeDetail>(
    resumeId ? `/api/admin/resumes/${resumeId}` : null,
    fetcher
  )

  // Fetch templates
  const { data: templates = [] } = useSWR<Template[]>("/api/templates", fetcher)

  // Reset state when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplateId("")
      setPreviewHtml("")
    }
  }, [isOpen])

  // Auto-select first template and load preview when resume loads
  useEffect(() => {
    if (resume && templates.length > 0 && !selectedTemplateId) {
      const defaultTemplate = templates[0]?.id
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate)
        loadPreview(resume, defaultTemplate)
      }
    }
  }, [resume, templates, selectedTemplateId])

  const loadPreview = async (resumeData: ResumeDetail, templateId: string) => {
    setIsLoadingPreview(true)
    setPreviewHtml("")

    try {
      const response = await fetch("/api/preview-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: resumeData.generatedResume,
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

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId)
    if (resume) {
      loadPreview(resume, templateId)
    }
  }

  const handleDownloadPDF = async () => {
    if (!resume || !selectedTemplateId) {
      alert("Please select a template first")
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
          templateId: selectedTemplateId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `resume.pdf`
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full min-w-4xl overflow-y-auto" side="left">
        <SheetHeader>
          <SheetTitle>Resume Preview</SheetTitle>
        </SheetHeader>

        {isLoadingResume ? (
          <div className="flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading resume...</p>
            </div>
          </div>
        ) : resume ? (
          <div className="p-4 pt-0 flex-1">
            <div className="h-full flex flex-col space-y-4">
              {/* Template Selector and Download */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleDownloadPDF} disabled={!selectedTemplateId}>
                  Download PDF
                </Button>
              </div>

              {/* Preview */}
              <div className="border rounded-lg bg-white overflow-hidden flex-1">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Generating preview...</p>
                    </div>
                  </div>
                ) : previewHtml ? (
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-full border-none"
                    title="Resume Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <p>Select a template to preview the resume</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

