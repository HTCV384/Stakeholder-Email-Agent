import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { 
  Upload, Users, Mail, FileText, 
  ArrowRight, Sparkles, Zap, Shield 
} from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">Stakeholder Outreach</span>
          </div>
          <div>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
                <Button asChild>
                  <Link href="/workflow">
                    Go to Workflow
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Powered by AI Agents
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            Generate Personalized Stakeholder Emails with AI
          </h1>
          <p className="text-xl text-muted-foreground">
            Upload your research report and let our multi-agent AI system craft compelling, 
            personalized outreach emails for each stakeholder automatically.
          </p>
          {isAuthenticated ? (
            <Button size="lg" className="mt-4" asChild>
              <Link href="/workflow">
                Start New Workflow
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" className="mt-4" asChild>
              <a href={getLoginUrl()}>
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground">Four simple steps to personalized outreach</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Upload,
              title: "Upload Report",
              description: "Upload your customer research report containing stakeholder information",
              step: "1"
            },
            {
              icon: Users,
              title: "Select Stakeholders",
              description: "AI extracts stakeholders automatically. Choose who to contact",
              step: "2"
            },
            {
              icon: Mail,
              title: "Configure Style",
              description: "Choose from AI styles, templates, or write custom prompts",
              step: "3"
            },
            {
              icon: FileText,
              title: "Review & Export",
              description: "Review generated emails with quality scores and export as markdown",
              step: "4"
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.step} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-[100px]" />
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="absolute top-4 right-4 text-4xl font-bold text-primary/10">
                    {item.step}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground">Everything you need for effective stakeholder outreach</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: Sparkles,
              title: "Multi-Agent AI System",
              description: "Hierarchical agents work together: Orchestrator, Task Planner, and Email Writers with reflection pattern"
            },
            {
              icon: Zap,
              title: "Three Generation Modes",
              description: "Choose AI-generated styles, editable templates, or write custom prompts for full control"
            },
            {
              icon: Shield,
              title: "Quality Assurance",
              description: "Each email is self-evaluated and refined automatically with quality scores and reflection notes"
            }
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Transform your stakeholder outreach with AI-powered personalization. 
              Upload your first research report and see the magic happen.
            </p>
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link href="/workflow">
                  Launch Workflow
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>
                  Sign In to Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Powered by Google Gemini 2.5 Flash via OpenRouter</p>
          <p className="mt-2">
            <Link href="/docs">
              <span className="hover:text-primary transition-colors cursor-pointer">View Documentation</span>
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
