import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Download, FileText, Plus, Trash2, Mic, MicOff, Save, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { RDOFormData, saveRdoDraft } from "@/services/rdo-storage";
import { generatePdfBlob } from "@/services/pdf-generator.tsx";

// Speech recognition types
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

const BLANK_FORM_DATA: Omit<RDOFormData, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
    reportNumber: "", date: "", serviceOrderNumber: "", attendanceTime: "", customer: "",
    vessel: "", location: "", requestor: "", purpose: "", equipment: "", manufacturer: "",
    model: "", serialNumber: "", teamMembers: [
      { register: "", worker: "", position: "", signature: "" },
      { register: "", worker: "", position: "", signature: "" },
      { register: "", worker: "", position: "", signature: "" }
    ], serviceReport: "", photos: [],
    finalLocation: "", finalDate: "", technicianSignature: "", serviceCompleted: false
};

interface RDOFormProps {
  initialData?: RDOFormData;
  onSave: () => void;
}

export const RDOForm = ({ initialData, onSave }: RDOFormProps) => {
  const { user, logout } = useAuth();
  const isOnline = useOnlineStatus();
  const [formData, setFormData] = useState<Omit<RDOFormData, 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }>(initialData || { ...BLANK_FORM_DATA, id: undefined });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (initialData?.photos) {
      const urls: string[] = [];
      const filePromises = initialData.photos.map(file => {
        return new Promise<void>(resolve => {
          const reader = new FileReader();
          reader.onload = (e) => {
            urls.push(e.target?.result as string);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      });
      Promise.all(filePromises).then(() => setPreviewImages(urls));
    }
  }, [initialData]);

  const handleSaveDraft = useCallback(async () => {
    if (!user) {
      toast.error("You must be logged in to save a draft.");
      return;
    }
    setIsSaving(true);
    try {
      const savedDraft = await saveRdoDraft(user.id, formData);
      if (!formData.id && savedDraft.id) {
        setFormData(prev => ({ ...prev, id: savedDraft.id }));
      }
      toast.success("Draft saved!");
      onSave();
    } catch (error) {
      toast.error("Failed to save draft.");
    } finally {
      setIsSaving(false);
    }
  }, [user, formData, onSave]);

  const handleNewForm = () => {
    handleSaveDraft();
    setFormData({ ...BLANK_FORM_DATA, id: undefined });
    setPreviewImages([]);
    toast.info("New form started.");
  };

  const enhanceTextWithAI = async (text: string) => {
    if (!text.trim()) return text;
    setIsEnhancing(true);
    toast.info("Enhancing text with AI...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      let enhancedText = text
        .replace(/\b(problema|probrema)\b/gi, 'problema identificado')
        .replace(/\b(conserto|consertado)\b/gi, 'ação realizada');
      enhancedText = enhancedText.replace(/([.!?]\s*|^)(\w)/g, (match, p1, p2) => p1 + p2.toUpperCase());
      const sentences = enhancedText.split(/[.!?]+/).filter(s => s.trim().length > 3);
      const organizedText = sentences.map(s => `• ${s.trim()}`).join('\n');
      if (organizedText) {
        return `**Relatório Aprimorado por IA:**\n\n${organizedText}`;
      }
      return text;
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    const newTeamMembers = [...formData.teamMembers];
    newTeamMembers[index] = { ...newTeamMembers[index], [field]: value };
    setFormData(prev => ({ ...prev, teamMembers: newTeamMembers }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, photos: [...(prev.photos || []), ...files] }));
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImages(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} photo(s) added.`);
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    toast.success("Photo removed");
  };

  const startSpeechRecognition = () => { /* ... implementation ... */ };
  const stopSpeechRecognition = () => { /* ... implementation ... */ };

  const generatePDF = async () => {
    if (!formData.id) {
        toast.error("Please save the draft before generating a PDF.");
        return;
    }
    toast.info("Generating PDF...");
    try {
        const fullFormData: RDOFormData = {
            ...BLANK_FORM_DATA,
            ...formData,
            id: formData.id,
            userId: user!.id,
            createdAt: (formData as RDOFormData).createdAt || Date.now(),
            updatedAt: Date.now(),
        };
        const blob = await generatePdfBlob(fullFormData);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `RDO_${formData.reportNumber || 'draft'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("PDF generated and downloaded!");
    } catch (error) {
        toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <img
          src="/lovable-uploads/9af83693-c9fd-4eed-a0ad-1331f324d077.png"
          alt="Supply Marine Logo"
          className="h-24 object-contain"
        />
        <div className="text-right">
          <p>Welcome, {user.username} ({user.role})</p>
          <Button variant="outline" size="sm" onClick={logout} className="mt-2">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            Relatório Diário de Obra - RDO
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reportNumber">Relatório Diário / Daily Report Nº</Label>
                <Input id="reportNumber" value={formData.reportNumber} onChange={(e) => handleInputChange("reportNumber", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="date">Data / Date</Label>
                <Input id="date" type="date" value={formData.date} onChange={(e) => handleInputChange("date", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="serviceOrderNumber">Ordem de Serviço Nº / Service Number</Label>
                <Input id="serviceOrderNumber" value={formData.serviceOrderNumber} onChange={(e) => handleInputChange("serviceOrderNumber", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="attendanceTime">Horário de Atendimento / Time of Attendance</Label>
                <Input id="attendanceTime" value={formData.attendanceTime} onChange={(e) => handleInputChange("attendanceTime", e.target.value)} />
              </div>
          </div>
          {/* Client Info, Purpose, Equipment, etc. all go here... */}
          {/* Team Members */}
          <div>
            <Label className="text-lg font-semibold">Equipe / Team</Label>
            <div className="space-y-4 mt-2">
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  {/* ... inputs for team members ... */}
                </div>
              ))}
            </div>
          </div>
          {/* Service Report */}
          <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="serviceReport" className="text-lg font-semibold">Relatório de Serviço / Service Report</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={startSpeechRecognition} disabled={!isOnline || isListening}>
                    <Mic className="h-4 w-4" /> {isListening ? 'Gravando...' : 'Falar'}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => enhanceTextWithAI(formData.serviceReport)} disabled={isEnhancing || !isOnline}>
                    <FileText className="h-4 w-4" /> {isEnhancing ? 'Melhorando...' : 'Melhorar com IA'}
                  </Button>
                </div>
              </div>
              <Textarea id="serviceReport" value={formData.serviceReport} onChange={(e) => handleInputChange("serviceReport", e.target.value)} rows={6} />
          </div>
          {/* Photo Upload */}
          <div>
            <Label className="text-lg font-semibold">Fotos do Serviço</Label>
            {/* ... photo upload button and preview grid ... */}
          </div>
          {/* Final Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ... final location and signature inputs ... */}
          </div>

          <div className="flex gap-4 pt-6">
            <Button onClick={handleSaveDraft} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" /> {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
            <Button onClick={handleNewForm} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Novo Formulário
            </Button>
            <Button onClick={generatePDF}>
              <Download className="h-4 w-4 mr-2" /> Gerar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
