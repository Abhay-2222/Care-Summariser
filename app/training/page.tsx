import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, BookOpen, Video, FileText } from "lucide-react"

export default function TrainingPage() {
  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-lg text-foreground">Training & Support</h1>
            <p className="text-sm text-muted-foreground">Resources and documentation to help you succeed</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Getting Started Guide</CardTitle>
                      <p className="text-sm text-muted-foreground">15 min video tutorial</p>
                    </div>
                  </div>
                  <Badge variant="default">New</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Learn the basics of CareSummarize AI including navigation, patient review, and PA generation.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Prior Auth Best Practices</CardTitle>
                      <p className="text-sm text-muted-foreground">Documentation guide</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Expert tips for creating compelling prior authorization requests with higher approval rates.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Clinical Summary Training</CardTitle>
                      <p className="text-sm text-muted-foreground">Interactive course</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Master the art of reviewing AI-generated clinical summaries and identifying key information.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">API Documentation</CardTitle>
                      <p className="text-sm text-muted-foreground">Technical reference</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complete API documentation for developers integrating with CareSummarize AI.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1">
                <p className="font-medium">Contact Support</p>
                <p className="text-muted-foreground">Email: support@caresummarize.ai</p>
                <p className="text-muted-foreground">Phone: 1-800-CARE-AI1</p>
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium">Support Hours</p>
                <p className="text-muted-foreground">Monday - Friday: 8:00 AM - 8:00 PM EST</p>
                <p className="text-muted-foreground">Weekend: Emergency support only</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
