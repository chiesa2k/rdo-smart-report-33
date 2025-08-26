import { RDOFormData } from '@/services/rdo-storage';

interface RdoPdfTemplateProps {
  formData: RDOFormData;
  previewImages: string[];
}

export const RdoPdfTemplate = ({ formData, previewImages }: RdoPdfTemplateProps) => {
  return (
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
              padding: '8px 4px',
              backgroundColor: '#A6C8E0',
              fontWeight: 'bold',
              fontSize: '9px',
              textAlign: 'center',
              verticalAlign: 'middle',
              height: '25px',
              lineHeight: '1.2'
            }}>
              Relatório Diário / Daily Report Nº
            </td>
            <td style={{
              border: '1px solid #333',
              padding: '8px 4px',
              backgroundColor: '#A6C8E0',
              fontWeight: 'bold',
              fontSize: '9px',
              textAlign: 'center',
              verticalAlign: 'middle',
              height: '25px',
              lineHeight: '1.2'
            }}>
              Data / Date
            </td>
            <td style={{
              border: '1px solid #333',
              padding: '8px 4px',
              backgroundColor: '#A6C8E0',
              fontWeight: 'bold',
              fontSize: '9px',
              textAlign: 'center',
              verticalAlign: 'middle',
              height: '25px',
              lineHeight: '1.2'
            }}>
              Ordem de Serviço Nº / Service Number
            </td>
            <td style={{
              border: '1px solid #333',
              padding: '8px 4px',
              backgroundColor: '#A6C8E0',
              fontWeight: 'bold',
              fontSize: '9px',
              textAlign: 'center',
              verticalAlign: 'middle',
              height: '25px',
              lineHeight: '1.2'
            }}>
              Horário de Atendimento / Time of Attendance
            </td>
          </tr>
          <tr>
            <td style={{
              border: '1px solid #333',
              padding: '8px 4px',
              fontSize: '11px',
              height: '30px',
              verticalAlign: 'middle',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              {formData.reportNumber || '0001'}
            </td>
            <td style={{
              border: '1px solid #333',
              padding: '8px 4px',
              fontSize: '11px',
              height: '30px',
              verticalAlign: 'middle',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              {formData.date || ''}
            </td>
            <td style={{
              border: '1px solid #333',
              padding: '8px 4px',
              fontSize: '11px',
              height: '30px',
              verticalAlign: 'middle',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              {formData.serviceOrderNumber || ''}
            </td>
            <td style={{
              border: '1px solid #333',
              padding: '8px 4px',
              fontSize: '11px',
              height: '30px',
              verticalAlign: 'middle',
              textAlign: 'center',
              lineHeight: '1.2'
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
              padding: '8px 4px',
              fontSize: '11px',
              height: '30px',
              verticalAlign: 'middle',
              textAlign: 'center',
              lineHeight: '1.2'
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
          {formData.teamMembers
            .filter(member => member.register || member.worker || member.position || member.signature)
            .map((member, index) => (
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
               padding: '8px',
               fontSize: '11px',
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

      {/* Signatures Section */}
      <div id="rdo-signatures" style={{
        lineHeight: '1.0',
        fontSize: '10px',
        padding: '0 15mm',
        marginTop: '0px'
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
              padding: '4px 2px',
              fontWeight: 'bold',
              fontSize: '8px',
              textAlign: 'center',
              verticalAlign: 'middle',
              width: '33.33%',
              height: '18px',
              lineHeight: '1.0'
            }}>
              Local e Data / Location and Date
            </td>
            <td style={{
              border: '1px solid #333',
              padding: '4px 2px',
              fontWeight: 'bold',
              fontSize: '8px',
              textAlign: 'center',
              verticalAlign: 'middle',
              width: '33.33%',
              height: '18px',
              lineHeight: '1.0'
            }}>
              Assinatura do Técnico Responsável / Technician's Signature
            </td>
            <td style={{
              border: '1px solid #333',
              padding: '4px 2px',
              fontWeight: 'bold',
              fontSize: '8px',
              textAlign: 'center',
              verticalAlign: 'middle',
              width: '33.33%',
              height: '18px',
              lineHeight: '1.0'
            }}>
              Serviço Concluído à Satisfação / Service Concluded Accordingly
            </td>
          </tr>
          <tr>
            <td style={{
              border: '1px solid #333',
              padding: '6px',
              fontSize: '10px',
              height: '35px',
              verticalAlign: 'middle',
              textAlign: 'center',
              lineHeight: '1.0'
            }}>
              {formData.finalLocation || ''}
            </td>
            <td style={{
              border: '1px solid #333',
              padding: '6px',
              fontSize: '10px',
              height: '35px',
              verticalAlign: 'middle',
              textAlign: 'center',
              lineHeight: '1.0'
            }}>
              {formData.technicianSignature || ''}
            </td>
            <td style={{
              border: '1px solid #333',
              padding: '6px',
              fontSize: '10px',
              height: '35px',
              verticalAlign: 'middle',
              textAlign: 'center',
              lineHeight: '1.0'
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
  );
};
