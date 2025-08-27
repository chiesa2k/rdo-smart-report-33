import { useState, useRef, useEffect, useCallback } from "react";
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
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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
    reportNumber: "",
    date: "",
    serviceOrderNumber: "",
    attendanceTime: "",
    customer: "",
    vessel: "",
    location: "",
    requestor: "",
    purpose: "",
    equipment: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    teamMembers: [
      { register: "", worker: "", position: "", signature: "" },
      { register: "", worker: "", position: "", signature: "" },
      { register: "", worker: "", position: "", signature: "" }
    ],
    serviceReport: "",
    photos: [],
    finalLocation: "",
    finalDate: "",
    technicianSignature: "",
    serviceCompleted: false
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
  const enhanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSaveDraft = useCallback(async () => {
    if (!user) {
      toast.error("You must be logged in to save a draft.");
      return;
    }
    setIsSaving(true);
    try {
      const savedDraft = await saveRdoDraft(user.id, formData);
      // Only update state with the new ID if it's the first save
      if (!formData.id && savedDraft.id) {
        setFormData(prev => ({ ...prev, id: savedDraft.id }));
      }
      toast.success("Draft saved!");
      onSave(); // Notify parent that a save occurred
    } catch (error) {
      toast.error("Failed to save draft.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }, [user, formData, onSave]);

  const handleNewForm = () => {
    handleSaveDraft(); // Save current work first
    setFormData({ ...BLANK_FORM_DATA, id: undefined });
    setPreviewImages([]);
    toast.info("New form started.");
  };

  const enhanceTextWithAI = async (text: string) => {
    if (!text.trim()) return text;

    setIsEnhancing(true);
    toast.info("Enhancing text with AI...");

    // Simulate network delay for AI service
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Simulate AI corrections and improvements
      let enhancedText = text
        .replace(/\b(problema|probrema)\b/gi, 'problema identificado')
        .replace(/\b(conserto|consertado)\b/gi, 'ação realizada')
        .replace(/\b(verificado|checado)\b/gi, 'verificado');

      // Capitalize sentences
      enhancedText = enhancedText.replace(/([.!?]\s*|^)(\w)/g, (match, p1, p2) => p1 + p2.toUpperCase());

      // Basic structuring (similar to before, but framed as AI)
      const sentences = enhancedText.split(/[.!?]+/).filter(s => s.trim().length > 3);
      const organizedText = sentences.map(s => `• ${s.trim()}`).join('\n');
      
      if (organizedText) {
        return `**Relatório Aprimorado por IA:**\n\n${organizedText}`;
      }
      return text;
      
    } catch (error) {
      console.error('Error enhancing text:', error);
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
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    toast.success(`${files.length} foto(s) adicionada(s)`);
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    toast.success("Foto removida");
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Seu navegador não suporta reconhecimento de voz");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Gravação iniciada. Fale agora...");
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript) {
        const newText = formData.serviceReport + (formData.serviceReport ? ' ' : '') + finalTranscript;
        setFormData(prev => ({
          ...prev,
          serviceReport: newText
        }));
        
        // Sumarizar após fala ser finalizada
        if (newText.length > 50) {
          setTimeout(async () => {
            const summarized = await summarizeText(newText);
            if (summarized !== newText) {
              setFormData(prev => ({ ...prev, serviceReport: summarized }));
              toast.success("Texto da fala organizado automaticamente");
            }
          }, 1000);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error("Erro no reconhecimento de voz");
    };

    recognition.onend = () => {
      setIsListening(false);
      toast.success("Gravação finalizada");
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const generatePDF = async () => {
    if (!formData.id) {
        toast.error("Please save the draft before generating a PDF.");
        return;
    }
    toast.info("Generating PDF...");
    try {
        // The generatePdfBlob function needs the full RDOFormData object,
        // but our state might be missing some fields. We create it here.
        const fullFormData: RDOFormData = {
            ...BLANK_FORM_DATA, // ensures all fields are present
            ...formData,
            id: formData.id,
            userId: user!.id,
            createdAt: Date.now(), // These timestamps might not be accurate, but are needed
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
        console.error(error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Logo and User Header */}
        <div className="flex justify-between items-center mb-6">
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

        {/* Header */}
        <Card className="shadow-card">
          <CardHeader className="bg-gradient-to-r from-supply-blue to-supply-blue-dark text-white">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6" />
              Relatório Diário de Obra - RDO
            </CardTitle>
            <p className="text-supply-blue-light">Supply Marine - HVAC-R Naval & Offshore</p>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reportNumber">Relatório Diário / Daily Report Nº</Label>
                <Input
                  id="reportNumber"
                  value={formData.reportNumber}
                  onChange={(e) => handleInputChange("reportNumber", e.target.value)}
                  placeholder="Insira a informação aqui"
                />
              </div>
              <div>
                <Label htmlFor="date">Data / Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="serviceOrderNumber">Ordem de Serviço Nº / Service Number</Label>
                <Input
                  id="serviceOrderNumber"
                  value={formData.serviceOrderNumber}
                  onChange={(e) => handleInputChange("serviceOrderNumber", e.target.value)}
                  placeholder="Insira a informação aqui"
                />
              </div>
              <div>
                <Label htmlFor="attendanceTime">Horário de Atendimento / Time of Attendance</Label>
                <Input
                  id="attendanceTime"
                  value={formData.attendanceTime}
                  onChange={(e) => handleInputChange("attendanceTime", e.target.value)}
                  placeholder="De/From: 07:00 - Até/To: 02:00"
                />
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Cliente / Customer</Label>
                <Input
                  id="customer"
                  value={formData.customer}
                  onChange={(e) => handleInputChange("customer", e.target.value)}
                  placeholder="Insira a informação aqui"
                />
              </div>
              <div>
                <Label htmlFor="vessel">Embarcação / Vessel</Label>
                <Input
                  id="vessel"
                  value={formData.vessel}
                  onChange={(e) => handleInputChange("vessel", e.target.value)}
                  placeholder="Insira a informação aqui"
                />
              </div>
              <div>
                <Label htmlFor="location">Local de Atendimento / Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Insira a informação aqui"
                />
              </div>
              <div>
                <Label htmlFor="requestor">Solicitante / Requestor</Label>
                <Input
                  id="requestor"
                  value={formData.requestor}
                  onChange={(e) => handleInputChange("requestor", e.target.value)}
                  placeholder="Insira a informação aqui"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <Label htmlFor="purpose">Objeto / Purpose</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
                placeholder="Descrição do objeto/propósito do serviço"
                rows={2}
              />
            </div>

            {/* Equipment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="equipment">Equipamento - Sistema / Equipment - System</Label>
                <Input
                  id="equipment"
                  value={formData.equipment}
                  onChange={(e) => handleInputChange("equipment", e.target.value)}
                  placeholder="Insira a informação aqui"
                />
              </div>
              <div>
                <Label htmlFor="manufacturer">Fabricante / Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                  placeholder="NA"
                />
              </div>
              <div>
                <Label htmlFor="model">Modelo / Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  placeholder="NA"
                />
              </div>
              <div>
                <Label htmlFor="serialNumber">Serial Nº</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                  placeholder="NA"
                />
              </div>
            </div>

            {/* Team Members */}
            <div>
              <Label className="text-lg font-semibold">Equipe / Team</Label>
              <div className="space-y-4 mt-2">
                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Registro / Register</Label>
                      <Input
                        value={member.register}
                        onChange={(e) => handleTeamMemberChange(index, "register", e.target.value)}
                        placeholder="Insira a informação aqui"
                      />
                    </div>
                    <div>
                      <Label>Funcionário / Worker</Label>
                      <Input
                        value={member.worker}
                        onChange={(e) => handleTeamMemberChange(index, "worker", e.target.value)}
                        placeholder="Insira a informação aqui"
                      />
                    </div>
                    <div>
                      <Label>Função / Position</Label>
                      <Input
                        value={member.position}
                        onChange={(e) => handleTeamMemberChange(index, "position", e.target.value)}
                        placeholder="TEC. SÊNIOR HVAC-R"
                      />
                    </div>
                    <div>
                      <Label>Assinatura / Signature</Label>
                      <Input
                        value={member.signature}
                        onChange={(e) => handleTeamMemberChange(index, "signature", e.target.value)}
                        placeholder="Assinatura"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Report */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="serviceReport" className="text-lg font-semibold">
                  Relatório de Serviço / Service Report
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
                  disabled={!isOnline}
                  className={`flex items-center gap-2 ${isListening ? 'bg-red-100 text-red-700 border-red-300' : ''}`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      Parar Gravação
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      Falar
                    </>
                  )}
                 </Button>
                 <Button
                   type="button"
                   onClick={async () => {
                     if (formData.serviceReport.trim()) {
                       const enhanced = await enhanceTextWithAI(formData.serviceReport);
                       setFormData(prev => ({ ...prev, serviceReport: enhanced }));
                       toast.success("Text enhanced with AI!");
                     }
                   }}
                   variant="outline"
                   size="sm"
                   disabled={isEnhancing || !formData.serviceReport.trim() || !isOnline}
                   className="flex items-center gap-2"
                 >
                   <FileText className="h-4 w-4" />
                   {isEnhancing ? "Enhancing..." : "Enhance with AI"}
                 </Button>
               </div>
               <Textarea
                 id="serviceReport"
                 value={formData.serviceReport}
                 onChange={(e) => handleInputChange("serviceReport", e.target.value)}
                 placeholder="Descreva o trabalho executado, problemas encontrados, soluções aplicadas... Ou clique em 'Falar' para usar o reconhecimento de voz."
                 rows={6}
                 className="mt-2"
               />
            </div>

            {/* Photo Upload */}
            <div>
              <Label className="text-lg font-semibold">Fotos do Serviço</Label>
              <div className="mt-2 space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Adicionar Fotos
                  </Button>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewImages.map((src, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={src}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <p className="text-xs text-center mt-1 font-medium">
                          Foto {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Final Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="finalLocation">Local e Data / Location and Date</Label>
                <Input
                  id="finalLocation"
                  value={formData.finalLocation}
                  onChange={(e) => handleInputChange("finalLocation", e.target.value)}
                  placeholder="RIO DE JANEIRO 09-04-2025"
                />
              </div>
              <div>
                <Label htmlFor="technicianSignature">Assinatura do Técnico Responsável / Technician's Signature</Label>
                <Input
                  id="technicianSignature"
                  value={formData.technicianSignature}
                  onChange={(e) => handleInputChange("technicianSignature", e.target.value)}
                  placeholder="Assinatura do técnico"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                onClick={() => handleSaveDraft()}
                className="flex items-center gap-2"
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                onClick={handleNewForm}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Form
              </Button>
              <Button
                onClick={generatePDF}
                className="flex items-center gap-2 bg-gradient-to-r from-supply-blue to-supply-blue-dark hover:from-supply-blue-dark hover:to-supply-blue"
              >
                <Download className="h-4 w-4" />
                Generate PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* The hidden preview is no longer needed here */}
    </div>
  );
};