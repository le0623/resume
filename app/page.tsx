import { ResumeGenerator } from "@/components/resume-generator"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto py-2 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Resume Generator</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="container mx-auto py-8 flex-1">
        <ResumeGenerator />
      </main>
    </div>
  )
}
