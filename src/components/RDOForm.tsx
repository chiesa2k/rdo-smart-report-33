import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Download, FileText, Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface RDOFormData {
  reportNumber: string;
  date: string;
  serviceOrderNumber: string;
  attendanceTime: string;
  customer: string;
  vessel: string;
  location: string;
  requestor: string;
  purpose: string;
  equipment: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  teamMembers: { register: string; worker: string; position: string; signature: string }[];
  serviceReport: string;
  photos: File[];
  finalLocation: string;
  finalDate: string;
  technicianSignature: string;
  serviceCompleted: boolean;
}

export const RDOForm = () => {
  const [formData, setFormData] = useState<RDOFormData>({
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
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);

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

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      
      // Get elements
      const headerElement = document.getElementById('rdo-header');
      const mainContentElement = document.getElementById('rdo-main-content');
      const signatureElement = document.getElementById('rdo-signatures');
      const footerElement = document.getElementById('rdo-footer');
      
      if (!headerElement || !mainContentElement || !signatureElement || !footerElement) {
        toast.error("Erro ao localizar elementos do documento");
        return;
      }

      // Capture header (fixo em todas as páginas)
      const headerCanvas = await html2canvas(headerElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const headerImgData = headerCanvas.toDataURL('image/png', 1.0);
      const headerHeight = (headerCanvas.height * pageWidth) / headerCanvas.width;

      // Capture footer (fixo em todas as páginas)
      const footerCanvas = await html2canvas(footerElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const footerImgData = footerCanvas.toDataURL('image/png', 1.0);
      const footerHeight = (footerCanvas.height * pageWidth) / footerCanvas.width;

      // Capture signatures (apenas na última página)
      const signatureCanvas = await html2canvas(signatureElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const signatureImgData = signatureCanvas.toDataURL('image/png', 1.0);
      const signatureHeight = (signatureCanvas.height * pageWidth) / signatureCanvas.width;

      // Dividir o conteúdo principal em seções lógicas para melhor controle de páginas
      const informationTables = mainContentElement.querySelectorAll('table:not(.service-report-content)');
      const serviceReportElement = mainContentElement.querySelector('.service-report-content');
      
      // Capturar as tabelas de informações básicas (cabeçalho, dados, equipe)
      const informationSections = [];
      for (let i = 0; i < informationTables.length; i++) {
        const table = informationTables[i] as HTMLElement;
        const canvas = await html2canvas(table, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png', 1.0);
        const height = (canvas.height * pageWidth) / canvas.width;
        
        informationSections.push({
          imgData,
          height,
          type: 'information'
        });
      }
      
      // Capturar o relatório de serviço (texto + fotos) se existir
      let serviceReportData = null;
      if (serviceReportElement) {
        const canvas = await html2canvas(serviceReportElement as HTMLElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png', 1.0);
        const height = (canvas.height * pageWidth) / canvas.width;
        
        serviceReportData = {
          imgData,
          height,
          type: 'service-report'
        };
      }
      
      // Margens da página (15mm de cada lado conforme definido no CSS)
      const marginLeft = 15; // 15mm
      const marginRight = 15; // 15mm
      const contentWidth = pageWidth - marginLeft - marginRight; // 180mm
      
      // Espaço disponível para conteúdo (entre cabeçalho e rodapé)
      const availableContentHeight = pageHeight - headerHeight - footerHeight - 5; // 5mm de margem extra
      
      // Adicionar primeira página com cabeçalho e rodapé
      pdf.addImage(headerImgData, 'PNG', 0, 0, pageWidth, headerHeight);
      pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
      
      let currentY = headerHeight;
      let currentPage = 1;
      
      // Adicionar seções de informações básicas na primeira página
      for (const section of informationSections) {
        // Verificar se a seção cabe na página atual
        if (currentY + section.height > headerHeight + availableContentHeight) {
          // Criar nova página
          pdf.addPage();
          currentPage++;
          pdf.addImage(headerImgData, 'PNG', 0, 0, pageWidth, headerHeight);
          pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
          currentY = headerHeight;
        }
        
        // Adicionar seção respeitando as margens
        pdf.addImage(section.imgData, 'PNG', marginLeft, currentY, contentWidth, section.height);
        currentY += section.height;
      }
      
      // Adicionar relatório de serviço
      if (serviceReportData) {
        // Verificar se o relatório de serviço cabe na página atual
        if (currentY + serviceReportData.height > headerHeight + availableContentHeight) {
          // Criar nova página
          pdf.addPage();
          currentPage++;
          pdf.addImage(headerImgData, 'PNG', 0, 0, pageWidth, headerHeight);
          pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
          currentY = headerHeight;
        }
        
        // Adicionar relatório de serviço respeitando as margens
        pdf.addImage(serviceReportData.imgData, 'PNG', marginLeft, currentY, contentWidth, serviceReportData.height);
        currentY += serviceReportData.height;
      }
      
      // Calcular espaço disponível na página atual
      const spaceAvailableForSignature = headerHeight + availableContentHeight - currentY;
      const spaceNeededForSignature = signatureHeight + 5; // 5mm de margem mínima
      
      // Se há espaço suficiente na página atual, colocar as assinaturas lá
      if (spaceAvailableForSignature >= spaceNeededForSignature) {
        // Posicionar assinaturas aproveitando o espaço disponível
        // Deixar uma pequena margem do conteúdo anterior
        const signatureY = Math.max(currentY + 5, pageHeight - footerHeight - signatureHeight - 5);
        pdf.addImage(signatureImgData, 'PNG', marginLeft, signatureY, contentWidth, signatureHeight);
      } else {
        // Se não há espaço suficiente, criar nova página para assinaturas
        pdf.addPage();
        currentPage++;
        pdf.addImage(headerImgData, 'PNG', 0, 0, pageWidth, headerHeight);
        pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
        
        // Posicionar assinaturas na nova página, aproveitando o máximo de espaço
        // Colocar logo após o cabeçalho se houver muito espaço, ou na parte inferior se preferível
        const newPageAvailableSpace = availableContentHeight;
        let signatureY;
        
        if (newPageAvailableSpace > signatureHeight + 50) { // Se há muito espaço (>50mm), posicionar após cabeçalho
          signatureY = headerHeight + 10; // 10mm após o cabeçalho
        } else {
          // Caso contrário, posicionar na parte inferior da página
          signatureY = pageHeight - footerHeight - signatureHeight - 5;
        }
        
        pdf.addImage(signatureImgData, 'PNG', marginLeft, signatureY, contentWidth, signatureHeight);
      }
        
      pdf.save(`RDO_${formData.reportNumber || 'novo'}.pdf`);
      toast.success("PDF gerado com sucesso!");
      
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/9af83693-c9fd-4eed-a0ad-1331f324d077.png" 
            alt="Supply Marine Logo" 
            className="h-32 object-contain"
          />
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
              <Label htmlFor="serviceReport" className="text-lg font-semibold">
                Relatório de Serviço / Service Report
              </Label>
              <Textarea
                id="serviceReport"
                value={formData.serviceReport}
                onChange={(e) => handleInputChange("serviceReport", e.target.value)}
                placeholder="Descreva o trabalho executado, problemas encontrados, soluções aplicadas..."
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
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
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
                onClick={generatePDF}
                className="flex items-center gap-2 bg-gradient-to-r from-supply-blue to-supply-blue-dark hover:from-supply-blue-dark hover:to-supply-blue"
              >
                <Download className="h-4 w-4" />
                Gerar PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
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
                  });
                  setPreviewImages([]);
                  toast.success("Formulário limpo");
                }}
              >
                Limpar Formulário
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Hidden Preview for PDF Generation with separated sections */}
      <div className="fixed -left-[9999px] w-[210mm] bg-white text-black font-sans" style={{ 
        fontFamily: 'Calibri, Arial, sans-serif'
      }}>
        
        {/* Header Section */}
        <div id="rdo-header" style={{ 
          lineHeight: '1.2', 
          fontSize: '10px',
          padding: '15mm 15mm 0 15mm'
        }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-shrink-0" style={{ width: '120px' }}>
              <img 
                src="/lovable-uploads/9af83693-c9fd-4eed-a0ad-1331f324d077.png" 
                alt="Supply Marine Logo" 
                style={{ height: '50px', objectFit: 'contain' }}
              />
            </div>
            
            <div className="flex-1 text-center">
              <h1 style={{ 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: '#000',
                margin: '0',
                lineHeight: '1.2'
              }}>
                RELATÓRIO DIÁRIO DE OBRA
              </h1>
              <p style={{ 
                fontSize: '8px', 
                color: '#000',
                margin: '2px 0 0 0',
                fontStyle: 'italic'
              }}>
                Daily Attendance Report
              </p>
            </div>
            
            <div className="flex-shrink-0" style={{ width: '120px', textAlign: 'right' }}>
              <p style={{ fontSize: '8px', fontWeight: 'bold', margin: '0' }}>FR - EG - 001 Rev: 00</p>
            </div>
          </div>
        </div>

        {/* Main Content Section (sem assinaturas) */}
        <div id="rdo-main-content" style={{ 
          lineHeight: '1.2', 
          fontSize: '10px',
          padding: '0 15mm'
        }}>
          {/* First Row - Basic Info */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: '2px',
            border: '1px solid #333'
          }}>
            <tr>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Relatório Diário / Daily Report Nº
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Data / Date
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Ordem de Serviço Nº / Service Number
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Horário de Atendimento / Time of Attendance
              </td>
            </tr>
            <tr>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontSize: '10px', 
                height: '25px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.reportNumber || '0001'}
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontSize: '10px', 
                height: '25px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.date || ''}
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontSize: '10px', 
                height: '25px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.serviceOrderNumber || ''}
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontSize: '10px', 
                height: '25px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.attendanceTime || 'De / From: _____ Até / To: _____'}
              </td>
            </tr>
          </table>

          {/* Second Row - Client Info */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: '2px',
            border: '1px solid #333'
          }}>
            <tr>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Cliente / Customer
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Embarcação / Vessel
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Local de Atendimento / Location
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Solicitante / Requestor
              </td>
            </tr>
            <tr>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontSize: '10px', 
                height: '25px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.customer || ''}
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontSize: '10px', 
                height: '25px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.vessel || ''}
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontSize: '10px', 
                height: '25px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.location || ''}
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontSize: '10px', 
                height: '25px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.requestor || ''}
              </td>
            </tr>
          </table>

          {/* Purpose Section */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: '2px',
            border: '1px solid #333'
          }}>
            <tr>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0',
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Objeto / Purpose
              </td>
            </tr>
            <tr>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontSize: '10px', 
                height: '30px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.purpose || ''}
              </td>
            </tr>
          </table>

          {/* Equipment Section */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: '2px',
            border: '1px solid #333'
          }}>
            <tr>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0',
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Equipamento - Sistema / Equipment - System
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0',
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Fabricante / Manufacturer
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0',
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Modelo / Model
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0',
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Serial Nº
              </td>
            </tr>
            <tr>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontSize: '10px', 
                height: '25px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.equipment || ''}
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontSize: '10px', 
                height: '25px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.manufacturer || ''}
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontSize: '10px', 
                height: '25px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.model || ''}
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontSize: '10px', 
                height: '25px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.serialNumber || ''}
              </td>
            </tr>
          </table>

          {/* Team Table */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: '2px',
            border: '1px solid #333'
          }}>
            <tr>
              <td colSpan={5} style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0',
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Equipe / Team
              </td>
            </tr>
            <tr>
              <td style={{ 
                border: '1px solid #333', 
                padding: '3px 2px', 
                backgroundColor: 'white',
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center'
              }}>
                Tech.
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '3px 2px', 
                backgroundColor: 'white',
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center'
              }}>
                Registro / Register
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '3px 2px', 
                backgroundColor: 'white',
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center'
              }}>
                Funcionário / Worker
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '3px 2px', 
                backgroundColor: 'white',
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center'
              }}>
                Função / Position
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '3px 2px', 
                backgroundColor: 'white',
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center'
              }}>
                Assinatura / Signature
              </td>
            </tr>
            {formData.teamMembers.map((member, index) => (
              <tr key={index}>
                <td style={{ 
                  border: '1px solid #333', 
                  padding: '3px 2px', 
                  fontSize: '8px', 
                  height: '20px',
                  verticalAlign: 'middle',
                  textAlign: 'center'
                }}>
                  {index + 1}.
                </td>
                <td style={{ 
                  border: '1px solid #333', 
                  padding: '6px 2px', 
                  fontSize: '10px', 
                  height: '25px',
                  verticalAlign: 'middle',
                  textAlign: 'center'
                }}>
                  {member.register || ''}
                </td>
                <td style={{ 
                  border: '1px solid #333', 
                  padding: '6px 2px', 
                  fontSize: '10px', 
                  height: '25px',
                  verticalAlign: 'middle',
                  textAlign: 'center'
                }}>
                  {member.worker || ''}
                </td>
                <td style={{ 
                  border: '1px solid #333', 
                  padding: '6px 2px', 
                  fontSize: '10px', 
                  height: '25px',
                  verticalAlign: 'middle',
                  textAlign: 'center'
                }}>
                  {member.position || ''}
                </td>
                <td style={{ 
                  border: '1px solid #333', 
                  padding: '6px 2px', 
                  fontSize: '10px', 
                  height: '25px',
                  verticalAlign: 'middle',
                  textAlign: 'center'
                }}>
                  {member.signature || ''}
                </td>
              </tr>
            ))}
          </table>

          {/* Service Report Section - Header */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: '2px',
            border: '1px solid #333'
          }}>
            <tr>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                backgroundColor: '#A6C8E0', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                height: '20px'
              }}>
                Relatório de Serviço / Service Report
              </td>
            </tr>
          </table>

          {/* Four Sections - Right after header */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: '4px',
            border: '1px solid #333'
          }}>
            <tr>
              <td style={{ 
                border: '1px solid #333', 
                padding: '2px', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                width: '25%'
              }}>
                (1) Descrição da Avaria / Damage Description
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '2px', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                width: '25%'
              }}>
                (2) Trabalho Executado / Executed Work
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '2px', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                width: '25%'
              }}>
                (3) Informações Adicionais / Additional Info
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '2px', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                width: '25%'
              }}>
                (4) Comentários do Cliente / Customer's Comments
              </td>
            </tr>
          </table>
          {/* Service Report Content and Images */}
          <table className="service-report-content" style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: '2px',
            marginTop: '0px',
            border: '1px solid #333'
          }}>
            <tr>
               <td style={{ 
                 border: '1px solid #333', 
                 padding: '4px', 
                 fontSize: '10px', 
                 minHeight: '250px',
                 verticalAlign: 'top',
                 textAlign: 'left'
               }}>
                 <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                   {formData.serviceReport || ''}
                 </div>
                
                {/* Photos Section */}
                {previewImages.length > 0 && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '8px',
                    marginTop: '10px'
                  }}>
                    {previewImages.map((src, index) => (
                      <div key={index} style={{ textAlign: 'center' }}>
                         <img
                           src={src}
                           alt={`Foto ${index + 1}`}
                           style={{ 
                             width: '100%', 
                             maxWidth: '150px',
                             height: '120px',
                             objectFit: 'cover',
                             border: '1px solid #333',
                             borderRadius: '4px'
                           }}
                         />
                        <p style={{ 
                          fontSize: '7px', 
                          margin: '2px 0 0 0',
                          fontWeight: 'bold'
                        }}>
                          Foto {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          </table>
        </div>

        {/* Signatures Section (apenas na última página) */}
        <div id="rdo-signatures" style={{ 
          lineHeight: '1.2', 
          fontSize: '10px',
          padding: '0 15mm'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: '4px',
            border: '1px solid #333'
          }}>
            <tr>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                width: '33.33%',
                height: '20px'
              }}>
                Local e Data / Location and Date
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                width: '33.33%',
                height: '20px'
              }}>
                Assinatura do Técnico Responsável / Technician's Signature
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '6px 2px', 
                fontWeight: 'bold', 
                fontSize: '8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                width: '33.33%',
                height: '20px'
              }}>
                Serviço Concluído à Satisfação / Service Concluded Accordingly
              </td>
            </tr>
            <tr>
              <td style={{ 
                border: '1px solid #333', 
                padding: '8px', 
                fontSize: '10px', 
                height: '40px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.finalLocation || ''}
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '8px', 
                fontSize: '10px', 
                height: '40px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}>
                {formData.technicianSignature || ''}
              </td>
              <td style={{ 
                border: '1px solid #333', 
                padding: '8px', 
                fontSize: '10px', 
                height: '40px',
                verticalAlign: 'middle',
                textAlign: 'center'
              }}></td>
            </tr>
          </table>
        </div>

        {/* Footer Section */}
        <div id="rdo-footer" style={{ 
          lineHeight: '1.2', 
          fontSize: '8px',
          padding: '8px 15mm 15mm 15mm',
          borderTop: '2px solid #4A90A4',
          color: '#333'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div style={{ width: '24%', textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>Headquarter | Rio de Janeiro</p>
              <p style={{ margin: '0 0 1px 0' }}>Rua Dom Meinrado, 35 - São Cristóvão</p>
              <p style={{ margin: '0 0 1px 0' }}>Rio de Janeiro - RJ - Brasil</p>
              <p style={{ margin: '0 0 1px 0' }}>CEP: 20.910-100</p>
              <p style={{ margin: '0' }}>Tel: (+55 21) 2596-6262</p>
            </div>
            <div style={{ width: '24%', textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>Base Operacional | Rio das Ostras</p>
              <p style={{ margin: '0 0 1px 0' }}>Rodovia Amaral Peixoto, Km 160</p>
              <p style={{ margin: '0 0 1px 0' }}>Lote 95 A - Mar do Norte</p>
              <p style={{ margin: '0 0 1px 0' }}>Rio das Ostras - RJ - Brasil</p>
              <p style={{ margin: '0' }}>CEP: 28.898-000</p>
            </div>
            <div style={{ width: '24%', textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>Base Operacional | Porto do Açu</p>
              <p style={{ margin: '0 0 1px 0' }}>Via 5 Projetada, Lote A12 -</p>
              <p style={{ margin: '0 0 1px 0' }}>Distrito Industrial - São João da Barra - RJ</p>
              <p style={{ margin: '0' }}>Brasil - CEP: 28.200-000</p>
            </div>
            <div style={{ width: '24%', textAlign: 'center' }}>
              <p style={{ margin: '0 0 1px 0' }}>Tel: (+55 21) 2596-6262</p>
              <p style={{ margin: '0 0 1px 0' }}>contato@supplymarine.com.br</p>
              <p style={{ margin: '0 0 1px 0' }}>supplymarine.com.br</p>
              <p style={{ margin: '0 0 1px 0' }}>Supply marine Serviços Ltda</p>
              <p style={{ margin: '0 0 1px 0' }}>CNPJ: 03.513.274/0001-95</p>
              <p style={{ margin: '0' }}>I.E.: 77.009.817</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};