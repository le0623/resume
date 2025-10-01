"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DataPagination } from "@/components/pagination"
import { ResumePreviewSheet } from "@/components/admin/resume-preview-sheet"
import { fetcher } from "@/lib/fetcher"

interface Resume {
  id: string
  jobUrl?: string
  createdAt: string
  profile: {
    id: string
    name: string
  }
}

interface ResumesResponse {
  data: Resume[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function ResumeList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState("")
 
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1) // Reset to first page on new search
    }, 300)

    return () => clearTimeout(handler)
  }, [searchTerm])

  // Fetch resumes with pagination and search
  const { data: resumesData, error, isLoading } = useSWR<ResumesResponse>(
    `/api/admin/resumes?page=${page}&limit=10&search=${encodeURIComponent(debouncedSearch)}`,
    fetcher
  )

  const resumes = resumesData?.data || []
  const pagination = resumesData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 }

  const handlePreview = (resumeId: string) => {
    setSelectedResumeId(resumeId)
    setIsPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setSelectedResumeId(null)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-500">Failed to load resumes</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Generated Resumes</h2>
      </div>

      {/* Search and Pagination Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job URL or job description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div>
          <DataPagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Job URL</TableHead>
              <TableHead className="w-[200px]">Date Created</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: 10 }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`}>
                  <TableCell>
                    <Skeleton className="h-5 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[300px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[150px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-[80px] ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : resumes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No resumes found
                </TableCell>
              </TableRow>
            ) : (
              resumes.map((resume) => (
                <TableRow key={resume.id}>
                  <TableCell className="font-medium">
                    {resume.profile.name}
                  </TableCell>
                  <TableCell>
                    {resume.jobUrl ? (
                      <a
                        href={resume.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block max-w-[400px]"
                        title={resume.jobUrl}
                      >
                        {resume.jobUrl}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(resume.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePreview(resume.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {resumes.length > 0 ? ((page - 1) * pagination.limit + 1) : 0} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} results
      </div>

      {/* Resume Preview Sheet */}
      <ResumePreviewSheet
        resumeId={selectedResumeId}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </div>
  )
}
