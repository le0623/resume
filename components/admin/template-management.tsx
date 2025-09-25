"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { fetcher } from "@/lib/fetcher"

interface Template {
  id: string
  name: string
  html: string
  createdAt: string
  updatedAt: string
}

export function TemplateManagement() {
  const { data: templates = [], error, isLoading } = useSWR<Template[]>("/api/templates", fetcher)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    html: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingTemplate 
        ? `/api/templates/${editingTemplate.id}`
        : "/api/templates"
      
      const method = editingTemplate ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Revalidate the templates data
        mutate("/api/templates")
        setIsDialogOpen(false)
        setEditingTemplate(null)
        setFormData({
          name: "",
          html: ""
        })
      }
    } catch (error) {
      console.error("Error saving template:", error)
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      html: template.html
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await fetch(`/api/templates/${id}`, { method: "DELETE" })
        // Revalidate the templates data
        mutate("/api/templates")
      } catch (error) {
        console.error("Error deleting template:", error)
      }
    }
  }

  const handleNewTemplate = () => {
    setEditingTemplate(null)
    setFormData({
      name: "",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .resume {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h2 {
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }
    </style>
</head>
<body>
    <div class="resume">
        <div class="header">
            <h1>{{name}}</h1>
            <div class="contact-info">
                <span>{{email}}</span>
                <span>{{phone}}</span>
                <span>{{address}}</span>
            </div>
        </div>
        
        <div class="section">
            <h2>Professional Summary</h2>
            <p>{{summary}}</p>
        </div>
        
        <div class="section">
            <h2>Skills</h2>
            <p>{{skills}}</p>
        </div>
        
        <div class="section">
            <h2>Experience</h2>
            <p>{{experience}}</p>
        </div>
        
        <div class="section">
            <h2>Education</h2>
            <p>{{education}}</p>
        </div>
        
        <div class="section">
            <h2>Projects</h2>
            <p>{{projects}}</p>
        </div>
        
        <div class="section">
            <h2>Certifications</h2>
            <p>{{certifications}}</p>
        </div>
    </div>
</body>
</html>`
    })
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div>Loading templates...</div>
  }

  if (error) {
    return <div>Failed to load templates</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Template Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Add New Template"}
              </DialogTitle>
              <DialogDescription>
                {editingTemplate ? "Update template information and HTML" : "Create a new resume template"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="html">HTML Template *</Label>
                <Textarea
                  id="html"
                  value={formData.html}
                  onChange={(e) => setFormData({ ...formData, html: e.target.value })}
                  rows={20}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use placeholders like {"{{name}}"}, {"{{email}}"}, {"{{summary}}"}, etc. for dynamic content
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>Resume template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Created:</strong> {new Date(template.createdAt).toLocaleDateString()}</p>
                <p><strong>Updated:</strong> {new Date(template.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
