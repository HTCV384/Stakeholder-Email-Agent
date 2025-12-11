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