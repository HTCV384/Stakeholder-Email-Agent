import { useState, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Upload, Users, Mail, Download, AlertCircle, 
  CheckCircle2, Loader2, FileText, Bug 
} from "lucide-react";
import { validateAndFixTemplate } from "@/lib/templateValidator";

type WorkflowStep = "upload" | "extract" | "select" | "configure" | "generate" | "review";

export default function WorkflowPage() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("upload");
  const [workflowId, setWorkflowId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStakeholderIds, setSelectedStakeholderIds] = useState<Set<number>>(new Set());
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [templateFormData, setTemplateFormData] = useState({ name: "", description: "", promptTemplate: "" });
  const [showDebugConsole, setShowDebugConsole] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showTemplatePreviewModal, setShowTemplatePreviewModal] = useState(false);
  const [templatePreviewData, setTemplatePreviewData] = useState<any>(null);

  // tRPC mutations and queries
  const uploadMutation = trpc.workflow.uploadReport.useMutation();
  const extractMutation = trpc.workflow.extractStakeholders.useMutation();
  const updateSelectionMutation = trpc.workflow.updateStakeholderSelection.useMutation();
  const generateMutation = trpc.workflow.generateEmails.useMutation();
  const previewMutation = trpc.workflow.previewEmail.useMutation();
  const createTemplateMutation = trpc.template.createTemplate.useMutation();
  const updateTemplateMutation = trpc.template.updateTemplate.useMutation();
  const previewTemplateMutation = trpc.template.previewTemplate.useMutation();
  
  const { data: templatesData, refetch: refetchTemplates } = trpc.template.listTemplates.useQuery();
  const templates = templatesData?.templates || [];
  
  const { data: workflowData, refetch: refetchWorkflow } = trpc.workflow.getWorkflow.useQuery(
    { workflowId: workflowId! },
    { enabled: workflowId !== null, refetchInterval: currentStep === "extract" || currentStep === "generate" ? 2000 : false }
  );

  const { data: exportData } = trpc.workflow.exportEmails.useQuery(
    { workflowId: workflowId! },
    { enabled: false }
  );

  // Sync selected stakeholders from database when workflow data loads
  useEffect(() => {
    if (workflowData?.stakeholders) {
      const selectedIds = new Set(
        workflowData.stakeholders
          .filter(s => s.selected)
          .map(s => s.id)
      );
      setSelectedStakeholderIds(selectedIds);
    }
  }, [workflowData?.stakeholders]);

  // File upload handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const base64Content = content.split(",")[1]; // Remove data:text/plain;base64, prefix

        const result = await uploadMutation.mutateAsync({
          filename: selectedFile.name,
          content: base64Content,
        });

        setWorkflowId(result.workflowId);
        setCurrentStep("extract");
        toast.success("Report uploaded successfully");
        
        // Automatically start extraction
        setTimeout(() => handleExtract(result.workflowId), 500);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    }
  };

  const handleExtract = async (wfId?: number) => {
    const id = wfId || workflowId;
    if (!id) return;

    try {
      await extractMutation.mutateAsync({ workflowId: id });
      await refetchWorkflow();
      setCurrentStep("select");
      toast.success("Stakeholders extracted successfully");
    } catch (error: any) {
      toast.error(`Extraction failed: ${error.message}`);
    }
  };

  const handleStakeholderToggle = async (stakeholderId: number, selected: boolean) => {
    try {
      await updateSelectionMutation.mutateAsync({ stakeholderId, selected });
      setSelectedStakeholderIds(prev => {
        const newSet = new Set(prev);
        if (selected) {
          newSet.add(stakeholderId);
        } else {
          newSet.delete(stakeholderId);
        }
        return newSet;
      });
    } catch (error: any) {
      toast.error(`Failed to update selection: ${error.message}`);
    }
  };

  const handleContinueToConfig = () => {
    if (selectedStakeholderIds.size === 0) {
      toast.error("Please select at least one stakeholder");
      return;
    }
    setCurrentStep("configure");
  };

  const handleGenerate = async () => {
    if (!workflowId) return;

    if (!selectedTemplateId) {
      toast.error("Please select a template");
      return;
    }

    const modeConfig = { template_id: selectedTemplateId };

    try {
      setCurrentStep("generate");
      await generateMutation.mutateAsync({
        workflowId,
        generationMode: "template",
        modeConfig,
      });
      await refetchWorkflow();
      setCurrentStep("review");
      toast.success("Emails generated successfully");
    } catch (error: any) {
      toast.error(`Generation failed: ${error.message}`);
      setCurrentStep("configure");
    }
  };

  const handlePreview = async () => {
    if (!workflowId || selectedStakeholderIds.size === 0) return;

    if (!selectedTemplateId) {
      toast.error("Please select a template");
      return;
    }

    const modeConfig = { template_id: selectedTemplateId };

    try {
      // Get first selected stakeholder for preview
      const firstStakeholderId = Array.from(selectedStakeholderIds)[0];
      
      const result = await previewMutation.mutateAsync({
        workflowId,
        stakeholderId: firstStakeholderId,
        generationMode: "template",
        modeConfig,
      });
      
      setPreviewData(result);
      setShowPreviewModal(true);
      toast.success("Preview generated successfully");
    } catch (error: any) {
      toast.error(`Preview failed: ${error.message}`);
    }
  };

  const handleExport = async () => {
    if (!workflowId) return;
    
    try {
      const result = await trpc.workflow.exportEmails.useQuery({ workflowId }).refetch();
      if (result.data) {
        const blob = new Blob([result.data.markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Emails exported successfully");
      }
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  const stakeholders = workflowData?.stakeholders || [];
  const emails = workflowData?.emails || [];
  const logs = workflowData?.logs || [];

  // Helper function to determine if user can proceed to a specific step
  const canProceedToStep = (step: WorkflowStep): boolean => {
    switch (step) {
      case "upload":
        return true; // Can always go to upload
      case "extract":
        return workflowId !== null; // Need workflow ID
      case "select":
        return stakeholders.length > 0; // Need extracted stakeholders
      case "configure":
        return selectedStakeholderIds.size > 0; // Need selected stakeholders
      case "generate":
        return selectedStakeholderIds.size > 0; // Need selected stakeholders
      case "review":
        return emails.length > 0; // Need generated emails
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Stakeholder Email Outreach</h1>
          <p className="text-muted-foreground">Generate personalized emails using AI-powered agents</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-between">
          {[
            { key: "upload" as WorkflowStep, label: "Upload", icon: Upload },
            { key: "extract" as WorkflowStep, label: "Extract", icon: Users },
            { key: "select" as WorkflowStep, label: "Select", icon: CheckCircle2 },
            { key: "configure" as WorkflowStep, label: "Configure", icon: Mail },
            { key: "generate" as WorkflowStep, label: "Generate", icon: Loader2 },
            { key: "review" as WorkflowStep, label: "Review", icon: FileText },
          ].map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const stepOrder = ["upload", "extract", "select", "configure", "generate", "review"];
            const currentIndex = stepOrder.indexOf(currentStep);
            const isPast = currentIndex > index;
            const isClickable = isPast || (index === currentIndex + 1 && canProceedToStep(step.key));
            
            const handleStepClick = () => {
              if (isPast) {
                // Can always go back to completed steps
                setCurrentStep(step.key);
              } else if (index === currentIndex + 1 && canProceedToStep(step.key)) {
                // Can proceed to next step if conditions are met
                setCurrentStep(step.key);
              }
            };
            
            return (
              <div key={step.key} className="flex items-center">
                <button
                  onClick={handleStepClick}
                  disabled={!isClickable && !isActive}
                  className={`flex flex-col items-center ${isActive ? "text-primary" : isPast ? "text-green-600" : "text-muted-foreground"} ${isClickable ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed"} transition-opacity`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? "bg-primary text-primary-foreground" : isPast ? "bg-green-600 text-white" : "bg-muted"}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm mt-2 font-medium">{step.label}</span>
                </button>
                {index < 5 && <div className={`h-0.5 w-16 mx-2 ${isPast ? "bg-green-600" : "bg-muted"}`} />}
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Step 1: Upload */}
            {currentStep === "upload" && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload Research Report</CardTitle>
                  <CardDescription>Upload a research report (PDF, HTML, or text file) containing customer research and stakeholder information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <input
                      type="file"
                      accept=".txt,.md,.pdf,.html,.htm"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                    {selectedFile && (
                      <p className="mt-4 text-sm text-muted-foreground">
                        Selected: <span className="font-medium">{selectedFile.name}</span>
                      </p>
                    )}
                  </div>
                  <Button 
                    className="w-full mt-6" 
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                    ) : (
                      <>Upload & Extract Stakeholders</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Extracting */}
            {currentStep === "extract" && (
              <Card>
                <CardHeader>
                  <CardTitle>Extracting Stakeholders</CardTitle>
                  <CardDescription>AI agents are analyzing your research report...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">This may take a few moments</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Select Stakeholders */}
            {currentStep === "select" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Select Stakeholders</CardTitle>
                      <CardDescription>Choose which stakeholders to generate emails for</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          if (selectedStakeholderIds.size === stakeholders.length) {
                            // Deselect all - update database for each stakeholder
                            await Promise.all(
                              stakeholders.map(s => 
                                updateSelectionMutation.mutateAsync({ stakeholderId: s.id, selected: false })
                              )
                            );
                            setSelectedStakeholderIds(new Set());
                            toast.success("All stakeholders deselected");
                          } else {
                            // Select all - update database for each stakeholder
                            await Promise.all(
                              stakeholders.map(s => 
                                updateSelectionMutation.mutateAsync({ stakeholderId: s.id, selected: true })
                              )
                            );
                            setSelectedStakeholderIds(new Set(stakeholders.map(s => s.id)));
                            toast.success(`All ${stakeholders.length} stakeholders selected`);
                          }
                        } catch (error: any) {
                          toast.error(`Failed to update selections: ${error.message}`);
                        }
                      }}
                    >
                      {selectedStakeholderIds.size === stakeholders.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {stakeholders.map((stakeholder) => (
                        <div key={stakeholder.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                          <Checkbox
                            checked={selectedStakeholderIds.has(stakeholder.id)}
                            onCheckedChange={(checked) => handleStakeholderToggle(stakeholder.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{stakeholder.name}</div>
                            {stakeholder.title && (
                              <div className="text-sm text-muted-foreground">{stakeholder.title}</div>
                            )}
                            {stakeholder.details && (
                              <p className="text-sm text-muted-foreground mt-2">{stakeholder.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Button 
                    className="w-full mt-6" 
                    onClick={handleContinueToConfig}
                    disabled={selectedStakeholderIds.size === 0}
                  >
                    Continue ({selectedStakeholderIds.size} selected)
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Configure Generation Mode */}
            {currentStep === "configure" && (
              <Card>
                <CardHeader>
                  <CardTitle>Configure Email Generation</CardTitle>
                  <CardDescription>Choose how you want emails to be generated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-select">Select Email Template</Label>
                      <Select 
                        value={selectedTemplateId?.toString() || ""} 
                        onValueChange={(v) => setSelectedTemplateId(parseInt(v))}
                      >
                        <SelectTrigger id="template-select">
                          <SelectValue placeholder="Choose a template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              <div className="flex items-center gap-2">
                                <span>{template.name}</span>
                                {template.isDefault && (
                                  <Badge variant="secondary" className="text-xs">Default</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedTemplateId && templates.find(t => t.id === selectedTemplateId)?.description && (
                        <p className="text-sm text-muted-foreground">
                          {templates.find(t => t.id === selectedTemplateId)?.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setTemplateFormData({ name: "", description: "", promptTemplate: "" });
                          setEditingTemplateId(null);
                          setShowTemplateDialog(true);
                        }}
                      >
                        + New Template
                      </Button>
                      {selectedTemplateId && (
                        <>
                          {templates.find(t => t.id === selectedTemplateId)?.isDefault ? (
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                const template = templates.find(t => t.id === selectedTemplateId);
                                if (template) {
                                  setEditingTemplateId(null);
                                  setTemplateFormData({
                                    name: `${template.name} (Copy)`,
                                    description: template.description || "",
                                    promptTemplate: template.promptTemplate,
                                  });
                                  setShowTemplateDialog(true);
                                }
                              }}
                            >
                              Duplicate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                const template = templates.find(t => t.id === selectedTemplateId);
                                if (template) {
                                  setEditingTemplateId(template.id);
                                  setTemplateFormData({
                                    name: template.name,
                                    description: template.description || "",
                                    promptTemplate: template.promptTemplate,
                                  });
                                  setShowTemplateDialog(true);
                                }
                              }}
                            >
                              Edit Template
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button 
                      variant="outline"
                      className="flex-1" 
                      onClick={handlePreview}
                      disabled={previewMutation.isPending || selectedStakeholderIds.size === 0}
                    >
                      {previewMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Preview...</>
                      ) : (
                        <>Preview Sample</>
                      )}
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={handleGenerate}
                      disabled={generateMutation.isPending}
                    >
                      {generateMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                      ) : (
                        <>Generate All Emails</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Generating */}
            {currentStep === "generate" && (
              <Card>
                <CardHeader>
                  <CardTitle>Generating Emails</CardTitle>
                  <CardDescription>AI agents are crafting personalized emails...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">This may take a few moments</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Review Emails */}
            {currentStep === "review" && (
              <ReviewEmailsSection
                emails={emails}
                stakeholders={stakeholders}
                workflowId={workflowId!}
                onExport={handleExport}
                onStartNew={() => setCurrentStep("upload")}
              />
            )}
          </div>

          {/* Sidebar: Debug Console */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="w-5 h-5" />
                    Debug Console
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDebugConsole(!showDebugConsole)}
                  >
                    {showDebugConsole ? "Hide" : "Show"}
                  </Button>
                </div>
                <CardDescription>Real-time agent logs and errors</CardDescription>
              </CardHeader>
              {showDebugConsole && (
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2 text-xs font-mono">
                      {logs.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No logs yet</p>
                      ) : (
                        logs.map((log) => (
                          <div key={log.id} className={`p-2 rounded ${
                            log.level === "error" ? "bg-red-500/10 text-red-600" :
                            log.level === "warning" ? "bg-yellow-500/10 text-yellow-600" :
                            log.level === "debug" ? "bg-blue-500/10 text-blue-600" :
                            "bg-muted"
                          }`}>
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold">[{log.agent}]</span>
                              {log.testId && (
                                <Badge variant="outline" className="text-[10px] h-4">
                                  {log.testId}
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1">{log.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Template Creation Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={(open) => {
        setShowTemplateDialog(open);
        if (!open) {
          setEditingTemplateId(null);
          setTemplateFormData({ name: "", description: "", promptTemplate: "" });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplateId ? "Edit Email Template" : "Create New Email Template"}</DialogTitle>
            <DialogDescription>
              {editingTemplateId 
                ? "Update your custom email template with a new structure or style." 
                : "Create a custom email template with your own structure and style. The template will be saved and available for future use."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="template-name">Template Name *</Label>
              <input
                id="template-name"
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="e.g., Partnership Outreach Template"
                value={templateFormData.name}
                onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                className="mt-1"
                placeholder="Describe when to use this template..."
                value={templateFormData.description}
                onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="template-prompt">Template Prompt *</Label>
              <Textarea
                id="template-prompt"
                className="mt-1 font-mono text-sm"
                placeholder={`Example:

You are writing a partnership proposal email to a healthcare leader.

**Email Structure:**
1. Opening: Acknowledge their work on {stakeholder_details}
2. Partnership Value: Explain how our solution aligns with {company_name}'s goals
3. Specific Benefits: Reference insights from {relevant_context}
4. Call to Action: Suggest a brief exploratory call

**Tone:** Professional, collaborative, forward-thinking
**Length:** 120-150 words

Generate the email as JSON:
{
  "subject": "Brief subject line",
  "body": "Email body"
}`}
                value={templateFormData.promptTemplate}
                onChange={(e) => setTemplateFormData({ ...templateFormData, promptTemplate: e.target.value })}
                rows={12}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Available variables: {'{stakeholder_name}'}, {'{stakeholder_title}'}, {'{stakeholder_details}'}, {'{company_name}'}, {'{company_summary}'}, {'{relevant_context}'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  const result = validateAndFixTemplate(templateFormData.promptTemplate);
                  
                  if (result.changes.length > 0 && result.fixedTemplate) {
                    setTemplateFormData({ ...templateFormData, promptTemplate: result.fixedTemplate });
                    toast.success(`Auto-fixed ${result.changes.length} issue(s): ${result.changes.join(', ')}`);
                  } else if (result.isValid) {
                    toast.success("Template looks good! No fixes needed.");
                  }
                  
                  if (result.warnings.length > 0) {
                    result.warnings.forEach((warning: string) => toast.info(warning));
                  }
                  
                  if (result.errors.length > 0) {
                    result.errors.forEach((error: string) => toast.error(error));
                  }
                }}
              >
                Auto-Fix Template
              </Button>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={async () => {
                  if (!templateFormData.promptTemplate) {
                    toast.error("Please enter a prompt template first");
                    return;
                  }
                  // Validate template before preview
                  if (templateFormData.promptTemplate.trim().length < 100) {
                    toast.error("Template prompt is too short. Please provide detailed instructions (minimum 100 characters). Click 'Auto-Fix Template' for help.");
                    return;
                  }
                  if (!templateFormData.promptTemplate.toLowerCase().includes('json')) {
                    toast.error("Template must include JSON format instructions. Click 'Auto-Fix Template' to add them automatically.");
                    return;
                  }
                  try {
                    const result = await previewTemplateMutation.mutateAsync({
                      promptTemplate: templateFormData.promptTemplate,
                      workflowId: workflowId || undefined, // Pass workflowId to use real data
                    });
                    setTemplatePreviewData(result);
                    setShowTemplatePreviewModal(true);
                  } catch (error: any) {
                    toast.error(`Preview failed: ${error.message}`);
                  }
                }}
                disabled={!templateFormData.promptTemplate || previewTemplateMutation.isPending}
              >
                {previewTemplateMutation.isPending ? "Generating..." : "Preview with Sample Data"}
              </Button>
              <Button 
                className="flex-1"
                onClick={async () => {
                  // Validate template before save
                  if (!templateFormData.name.trim()) {
                    toast.error("Please enter a template name");
                    return;
                  }
                  if (!templateFormData.promptTemplate.trim()) {
                    toast.error("Please enter a template prompt");
                    return;
                  }
                  if (templateFormData.promptTemplate.trim().length < 100) {
                    toast.error("Template prompt is too short. Please provide detailed instructions (minimum 100 characters). Try 'Auto-Fix Template' first.");
                    return;
                  }
                  if (!templateFormData.promptTemplate.toLowerCase().includes('json')) {
                    toast.error("Template must include JSON format instructions. Click 'Auto-Fix Template' to add them automatically.");
                    return;
                  }
                  try {
                    if (editingTemplateId) {
                      // Update existing template
                      await updateTemplateMutation.mutateAsync({
                        templateId: editingTemplateId,
                        name: templateFormData.name,
                        description: templateFormData.description || undefined,
                        promptTemplate: templateFormData.promptTemplate,
                      });
                      toast.success("Template updated successfully!");
                    } else {
                      // Create new template
                      await createTemplateMutation.mutateAsync({
                        name: templateFormData.name,
                        description: templateFormData.description || undefined,
                        promptTemplate: templateFormData.promptTemplate,
                      });
                      toast.success("Template created successfully!");
                    }
                    setShowTemplateDialog(false);
                    setEditingTemplateId(null);
                    setTemplateFormData({ name: "", description: "", promptTemplate: "" });
                    refetchTemplates();
                  } catch (error: any) {
                    toast.error(`Failed to ${editingTemplateId ? 'update' : 'create'} template: ${error.message}`);
                  }
                }}
                disabled={!templateFormData.name || !templateFormData.promptTemplate || createTemplateMutation.isPending || updateTemplateMutation.isPending}
              >
                {(createTemplateMutation.isPending || updateTemplateMutation.isPending) 
                  ? (editingTemplateId ? "Updating..." : "Creating...") 
                  : (editingTemplateId ? "Update Template" : "Create Template")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Modal */}
      <Dialog open={showTemplatePreviewModal} onOpenChange={setShowTemplatePreviewModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              {templatePreviewData?.isPlaceholder 
                ? "Sample email generated with PLACEHOLDER data (no workflow uploaded yet)"
                : "Sample email generated with your actual workflow data"}
            </DialogDescription>
          </DialogHeader>
          
          {templatePreviewData && (
            <div className="space-y-6">
              {/* Placeholder Warning */}
              {templatePreviewData.isPlaceholder && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 dark:text-yellow-500 text-lg">⚠️</span>
                    <div className="text-sm space-y-1">
                      <div className="font-medium text-yellow-800 dark:text-yellow-200">Using Placeholder Data</div>
                      <div className="text-yellow-700 dark:text-yellow-300">
                        This preview uses sample data because no workflow is active. Upload a hospital research report first to see preview with your actual data.
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Sample Data Info */}
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <div className="text-sm font-medium">{templatePreviewData.isPlaceholder ? "Placeholder Data:" : "Your Workflow Data:"}</div>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Hospital:</span> {templatePreviewData.sampleData.company_name}</div>
                  <div><span className="font-medium">Stakeholder:</span> {templatePreviewData.sampleData.stakeholder_name}, {templatePreviewData.sampleData.stakeholder_title}</div>
                </div>
              </div>

              <Separator />

              {/* Subject */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Subject:</div>
                <div className="font-medium">{templatePreviewData.email.subject}</div>
              </div>

              <Separator />

              {/* Email Body */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Email Body:</div>
                <div className="whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
                  {templatePreviewData.email.body}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowTemplatePreviewModal(false)}>
                  Close Preview
                </Button>
                <Button className="flex-1" onClick={() => {
                  setShowTemplatePreviewModal(false);
                  // Return to template dialog to save
                }}>
                  Looks Good, Save Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Email Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Sample email generated for {previewData?.stakeholder.name}
            </DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <div className="space-y-6">
              {/* Stakeholder Info */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">To:</div>
                <div>
                  <div className="font-medium">{previewData.stakeholder.name}</div>
                  <div className="text-sm text-muted-foreground">{previewData.stakeholder.title}</div>
                </div>
              </div>

              <Separator />

              {/* Subject */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Subject:</div>
                <div className="font-medium">{previewData.email.subject}</div>
              </div>

              <Separator />

              {/* Email Body */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Email Body:</div>
                <div className="whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
                  {previewData.email.body}
                </div>
              </div>

              {/* Quality Metrics */}
              {(previewData.email.qualityScore || previewData.email.reflectionNotes) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    {previewData.email.qualityScore && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Quality Score:</span>
                        <Badge variant="secondary">
                          {previewData.email.qualityScore.toFixed(1)}/10
                        </Badge>
                      </div>
                    )}
                    {previewData.email.reflectionNotes && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Reflection Notes:</div>
                        <div className="text-sm text-muted-foreground">
                          {previewData.email.reflectionNotes}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Adjust Settings
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleGenerate();
                  }}
                >
                  Generate All Emails
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ReviewEmailsSection Component
interface ReviewEmailsSectionProps {
  emails: any[];
  stakeholders: any[];
  workflowId: number;
  onExport: () => void;
  onStartNew: () => void;
}

function ReviewEmailsSection({ emails, stakeholders, workflowId, onExport, onStartNew }: ReviewEmailsSectionProps) {
  const [selectedEmailIndex, setSelectedEmailIndex] = useState(0);
  const [editedBody, setEditedBody] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const updateEmailMutation = trpc.workflow.updateEmail.useMutation();
  
  const currentEmail = emails[selectedEmailIndex];
  const currentStakeholder = stakeholders.find(s => s.id === currentEmail?.stakeholderId);
  
  // Initialize edited body when email changes
  useEffect(() => {
    if (currentEmail) {
      setEditedBody(currentEmail.body);
      setHasUnsavedChanges(false);
    }
  }, [currentEmail]);
  
  const handleBodyChange = (value: string) => {
    setEditedBody(value);
    setHasUnsavedChanges(value !== currentEmail?.body);
  };
  
  const handleSaveChanges = async () => {
    if (!currentEmail) return;
    
    try {
      await updateEmailMutation.mutateAsync({
        emailId: currentEmail.id,
        body: editedBody,
      });
      toast.success("Email updated successfully");
      setHasUnsavedChanges(false);
    } catch (error: any) {
      toast.error(`Failed to save: ${error.message}`);
    }
  };
  
  const handleNext = () => {
    if (selectedEmailIndex < emails.length - 1) {
      setSelectedEmailIndex(selectedEmailIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (selectedEmailIndex > 0) {
      setSelectedEmailIndex(selectedEmailIndex - 1);
    }
  };
  
  if (emails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Emails Generated</CardTitle>
          <CardDescription>No emails were generated. Please try again.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onStartNew}>Start New Workflow</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Generated Emails</CardTitle>
        <CardDescription>
          Review and edit each email before exporting. {emails.length} email{emails.length > 1 ? 's' : ''} generated.
          {currentEmail?.templateName && (
            <span className="ml-2 font-medium">Template: {currentEmail.templateName}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipient Selector */}
        <div className="space-y-2">
          <Label>Select Recipient</Label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedEmailIndex}
            onChange={(e) => setSelectedEmailIndex(Number(e.target.value))}
          >
            {emails.map((email, index) => {
              const stakeholder = stakeholders.find(s => s.id === email.stakeholderId);
              return (
                <option key={email.id} value={index}>
                  {stakeholder?.name || `Email ${index + 1}`} - {stakeholder?.title || 'No title'}
                </option>
              );
            })}
          </select>
        </div>
        
        {/* Current Email Display */}
        {currentEmail && (
          <div className="space-y-4">
            {/* Stakeholder Info */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{currentStakeholder?.name}</h3>
                {currentStakeholder?.title && (
                  <p className="text-sm text-muted-foreground">{currentStakeholder.title}</p>
                )}
              </div>
              {currentEmail.qualityScore && (
                <Badge variant={currentEmail.qualityScore >= 70 ? "default" : "secondary"}>
                  Score: {(currentEmail.qualityScore / 10).toFixed(1)}/10
                </Badge>
              )}
            </div>
            
            <Separator />
            
            {/* Subject Line */}
            <div>
              <Label className="text-sm font-medium">Subject Line</Label>
              <div className="mt-2 p-3 bg-muted/50 rounded-md">
                <p className="font-medium">{currentEmail.subject}</p>
              </div>
            </div>
            
            {/* Editable Email Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Email Body</Label>
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-xs">
                    Unsaved changes
                  </Badge>
                )}
              </div>
              <Textarea
                value={editedBody}
                onChange={(e) => handleBodyChange(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Email body..."
              />
            </div>
            
            {/* Reflection Notes */}
            {currentEmail.reflectionNotes && (
              <div className="bg-muted/50 p-3 rounded-md">
                <Label className="text-xs font-medium">AI Reflection Notes:</Label>
                <p className="text-xs text-muted-foreground mt-1">{currentEmail.reflectionNotes}</p>
              </div>
            )}
            
            {/* Navigation & Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={selectedEmailIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={selectedEmailIndex === emails.length - 1}
              >
                Next
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges || updateEmailMutation.isPending}
                className="ml-auto"
              >
                {updateEmailMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        )}
        
        <Separator />
        
        {/* Final Actions */}
        <div className="flex gap-3">
          <Button className="flex-1" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export All Emails
          </Button>
          <Button variant="outline" onClick={onStartNew}>
            Start New Workflow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
