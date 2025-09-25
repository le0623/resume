"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FileText, BarChart3, Settings } from "lucide-react"
import { ProfileManagement } from "@/components/admin/profile-management"
import { TemplateManagement } from "@/components/admin/template-management"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"
import { ResumeList } from "@/components/admin/resume-list"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("analytics")

  return (
    <main className="container mx-auto py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Profiles
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="resumes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Resumes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="profiles" className="space-y-6">
          <ProfileManagement />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplateManagement />
        </TabsContent>

        <TabsContent value="resumes" className="space-y-6">
          <ResumeList />
        </TabsContent>
      </Tabs>
    </main>
  )
}
