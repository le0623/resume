"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { fetcher } from "@/lib/fetcher"

interface Profile {
  id: string
  name: string
  profile: string
  createdAt: string
  updatedAt: string
  resumes: Array<{ id: string; createdAt: string }>
}

export function ProfileManagement() {
  const { data: profiles = [], error, isLoading } = useSWR<Profile[]>("/api/admin/profiles", fetcher)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    profile: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingProfile
        ? `/api/admin/profiles/${editingProfile.id}`
        : "/api/admin/profiles"

      const method = editingProfile ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Revalidate the profiles data
        mutate("/api/admin/profiles")
        setIsDialogOpen(false)
        setEditingProfile(null)
        setFormData({
          name: "",
          profile: ""
        })
      }
    } catch (error) {
      console.error("Error saving profile:", error)
    }
  }

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile)
    setFormData({
      name: profile.name,
      profile: profile.profile
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this profile?")) {
      try {
        await fetch(`/api/admin/profiles/${id}`, { method: "DELETE" })
        // Revalidate the profiles data
        mutate("/api/admin/profiles")
      } catch (error) {
        console.error("Error deleting profile:", error)
      }
    }
  }

  const handleNewProfile = () => {
    setEditingProfile(null)
    setFormData({
      name: "",
      profile: ""
    })
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div>Loading profiles...</div>
  }

  if (error) {
    return <div>Failed to load profiles</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profile Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewProfile}>
              <Plus className="h-4 w-4 mr-2" />
              Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? "Edit Profile" : "Add New Profile"}
              </DialogTitle>
              <DialogDescription>
                {editingProfile ? "Update profile information" : "Create a new profile for resume generation"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Profile Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter a name to identify this profile"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile">Profile Information *</Label>
                <Textarea
                  id="profile"
                  value={formData.profile}
                  onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                  rows={20}
                  placeholder="Enter profile information in plain text format. Include name, email, phone, address etc."
                  required
                  className="font-mono text-sm max-h-96 overflow-y-auto"
                />
                <p className="text-xs text-muted-foreground">
                  Enter all profile information in plain text. The AI will extract and format this information when generating resumes.
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProfile ? "Update Profile" : "Create Profile"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile.id} className="gap-4 py-4">
            <CardHeader>
              <CardTitle className="text-lg">{profile.name}</CardTitle>
              <CardDescription>
                {profile.profile.split('\n')[0] || 'No profile information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Resumes:</strong> {profile.resumes.length}</p>
                <p><strong>Created:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {profile.profile}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(profile)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(profile.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
