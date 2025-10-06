import { RDOFormData } from '@/services/rdo-storage';

interface RdoPdfTemplateProps {
  formData: RDOFormData;
  previewImages: string[];
}

export const RdoPdfTemplate = ({ formData, previewImages }: RdoPdfTemplateProps) => {
  // Helper to avoid empty cells and have a placeholder, or use a non-breaking space
  const val = (value: string | undefined | null) => value || '\u00A0';

  const filledInMembers = formData.teamMembers.filter(
    member => member.register || member.worker || member.position || member.signature
  );

  return (
    <div className="fixed -left-[9999px] w-[210mm] bg-white text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div id="pdf-template" className="p-[15mm] space-y-2 text-[8pt]">

        {/* Header Section */}
        <div id="rdo-header" className="flex justify-between items-start mb-2">
          <div className="w-[40mm]">
            <img
              src={`https://i.imgur.com/S1FfyjQ.png`}
              crossOrigin="anonymous"
              alt="Supply Marine"
              className="h-[15mm] object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="font-bold text-[10pt]">RELATÓRIO DIÁRIO DE OBRA</h1>
            <p className="text-[7pt]">Daily Attendance Report</p>
          </div>
          <div className="w-[40mm] text-right font-bold">
            <p>FR - EG - 001</p>
            <p>Rev: 00</p>
          </div>
        </div>

        {/* Main Content Section */}
        <div id="rdo-main-content">
          <table className="w-full border-collapse border border-black">
            <tbody>
              <tr className="text-center font-bold" style={{ backgroundColor: '#D9E2F3' }}>
                <td className="border border-black p-1">Relatório Diário / Daily Report N°</td>
                <td className="border border-black p-1">Data / Date</td>
                <td className="border border-black p-1">Ordem de Serviço N° / Service Number</td>
                <td className="border border-black p-1">Horário de Atendimento / Time of Attendance</td>
              </tr>
              <tr className="text-center h-[10mm]">
                <td className="border border-black p-1">{val(formData.reportNumber)}</td>
                <td className="border border-black p-1">{val(formData.date)}</td>
                <td className="border border-black p-1">{val(formData.serviceOrderNumber)}</td>
                <td className="border border-black p-1">{val(formData.attendanceTime)}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-black mt-2">
            <tbody>
              <tr className="text-center font-bold" style={{ backgroundColor: '#D9E2F3' }}>
                <td className="border border-black p-1">Cliente / Customer</td>
                <td className="border border-black p-1">Embarcação / Vessel</td>
                <td className="border border-black p-1">Local de Atendimento / Location</td>
                <td className="border border-black p-1">Solicitante / Requestor</td>
              </tr>
              <tr className="text-center h-[10mm]">
                <td className="border border-black p-1">{val(formData.customer)}</td>
                <td className="border border-black p-1">{val(formData.vessel)}</td>
                <td className="border border-black p-1">{val(formData.location)}</td>
                <td className="border border-black p-1">{val(formData.requestor)}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-black mt-2">
            <tbody>
              <tr className="text-center font-bold" style={{ backgroundColor: '#D9E2F3' }}>
                <td className="border border-black p-1">Objeto / Purpose</td>
              </tr>
              <tr className="h-[10mm]">
                <td className="border border-black p-1">{val(formData.purpose)}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-black mt-2">
            <tbody>
              <tr className="text-center font-bold" style={{ backgroundColor: '#D9E2F3' }}>
                <td className="border border-black p-1">Equipamento - Sistema / Equipment - System</td>
                <td className="border border-black p-1">Fabricante / Manufacturer</td>
                <td className="border border-black p-1">Modelo / Model</td>
                <td className="border border-black p-1">Serial N°</td>
              </tr>
              <tr className="text-center h-[10mm]">
                <td className="border border-black p-1">{val(formData.equipment)}</td>
                <td className="border border-black p-1">{val(formData.manufacturer)}</td>
                <td className="border border-black p-1">{val(formData.model)}</td>
                <td className="border border-black p-1">{val(formData.serialNumber)}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-black mt-2">
            <thead>
              <tr className="text-center font-bold" style={{ backgroundColor: '#D9E2F3' }}>
                <td colSpan={5} className="border border-black p-1">Equipe / Team</td>
              </tr>
              <tr className="text-center font-bold" style={{ backgroundColor: '#D9E2F3' }}>
                <td className="border border-black p-1 w-[8mm]">Tech.</td>
                <td className="border border-black p-1">Registro / Register</td>
                <td className="border border-black p-1">Funcionário / Worker</td>
                <td className="border border-black p-1">Função / Position</td>
                <td className="border border-black p-1">Assinatura / Signature</td>
              </tr>
            </thead>
            <tbody>
              {filledInMembers.map((member, index) => (
                <tr key={index} className="text-center h-[10mm]">
                  <td className="border border-black p-1">{index + 1}.</td>
                  <td className="border border-black p-1">{val(member.register)}</td>
                  <td className="border border-black p-1">{val(member.worker)}</td>
                  <td className="border border-black p-1">{val(member.position)}</td>
                  <td className="border border-black p-1">{val(member.signature)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="w-full border-collapse border border-black mt-2">
            <thead>
              <tr className="text-center font-bold" style={{ backgroundColor: '#D9E2F3' }}>
                <td colSpan={4} className="border border-black p-1">Relatório de Serviço / Service Report</td>
              </tr>
              <tr className="text-center font-bold text-[7pt]" style={{ backgroundColor: '#D9E2F3' }}>
                <td className="border border-black p-1 w-1/4">(1) Descrição da Avaria / Damage Description</td>
                <td className="border border-black p-1 w-1/4">(2) Trabalho Executado / Executed Work</td>
                <td className="border border-black p-1 w-1/4">(3) Informações Adicionais / Additional Info</td>
                <td className="border border-black p-1 w-1/4">(4) Comentários do Cliente / Customer's Comments</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="border border-black p-2 align-top h-[100mm]">
                  <div className="whitespace-pre-wrap">
                    {val(formData.serviceReport)}
                    {previewImages.length > 0 && (
                      <div className="mt-4 flex flex-wrap justify-around">
                        {previewImages.map((src, index) => (
                          <div key={index} className="text-center p-1" style={{ maxWidth: '32%' }}>
                            <img
                              src={src}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-auto border border-black"
                            />
                            <p className="text-[7pt] font-bold mt-1">Foto {index + 1}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

        </div>

        {/* Signatures Section */}
        <div id="rdo-signatures" className="pt-2">
          <table className="w-full border-collapse border border-black">
            <tbody>
              <tr className="text-center font-bold" style={{ backgroundColor: '#D9E2F3' }}>
                <td className="border border-black p-1 w-1/3">Local e Data / Location and Date</td>
                <td className="border border-black p-1 w-1/3">Assinatura do Técnico Responsável / Technician's Signature</td>
                <td className="border border-black p-1 w-1/3">Serviço Concluído à Satisfação / Service Concluded Accordingly</td>
              </tr>
              <tr className="text-center h-[15mm]">
                <td className="border border-black p-1">{val(formData.finalLocation)}</td>
                <td className="border border-black p-1">{val(formData.technicianSignature)}</td>
                <td className="border border-black p-1"></td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Footer Section */}
      <div id="rdo-footer" className="absolute bottom-[15mm] left-[15mm] right-[15mm] text-[7pt] border-t-2 pt-1" style={{ borderColor: '#8FAADC' }}>
        <div className="flex justify-between text-center">
          <div>
            <p className="font-bold">Headquarter | Rio de Janeiro</p>
            <p>Rua Dom Meinrado, 35 - São Cristóvão</p>
            <p>Rio de Janeiro - RJ - Brasil - CEP: 20.910-100</p>
            <p>Tel: (+55 21) 2596-6262</p>
          </div>
          <div>
            <p className="font-bold">Base Operacional | Rio das Ostras</p>
            <p>Rodovia Amaral Peixoto, Km 160</p>
            <p>Lote 95 A - Mar do Norte - Rio das Ostras - RJ - Brasil</p>
            <p>CEP: 28.898-000</p>
          </div>
          <div>
            <p className="font-bold">Base Operacional | Porto do Açu</p>
            <p>Via 5 Projetada, Lote A12 -</p>
            <p>Distrito Industrial - São João da Barra - RJ - Brasil</p>
            <p>CEP: 28.200-000</p>
          </div>
          <div className="text-right">
            <p>Tel: (+55 21) 2596-6262</p>
            <p>contato@supplymarine.com.br</p>
            <p>supplymarine.com.br</p>
            <p>Supply marine Serviços Ltda</p>
            <p>CNPJ: 03.513.274/0001-95</p>
            <p>I.E.: 77.009.817</p>
          </div>
        </div>
      </div>
    </div>
  );
};
