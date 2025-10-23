import '@/index.css'; // Import tailwind styles
import { RDOFormData } from './rdo-storage';
import { RdoPdfTemplate } from '@/components/RdoPdfTemplate';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';

// Helper function to convert File objects to data URLs
const readAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generatePdfBlob = async (draftData: RDOFormData): Promise<Blob> => {
  // 1. Render React component to an off-screen div to calculate layout
  const container = document.createElement('div');
  document.body.appendChild(container);

  const photoPreviews = await Promise.all(draftData.photos.map(readAsDataURL));
  const root = createRoot(container);
  root.render(<RdoPdfTemplate formData={draftData} previewImages={photoPreviews} />);
  // Wait for rendering, including images which might take time to load
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 2. Define PDF geometry and constants
  const pdf = new jsPDF('p', 'mm', 'a4');
  // Do NOT delete the first page. We will use it as the starting page.

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 3; // 3mm margin
  const contentWidth = pageWidth - (margin * 2);

  const toCanvas = (el: HTMLElement) => html2canvas(el, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: null });

  // 3. Convert all structural elements to canvases to get their dimensions and content
  const headerEl = container.querySelector('#rdo-header') as HTMLElement;
  const content1El = container.querySelector('#rdo-flowable-content-1') as HTMLElement;
  const serviceReportEl = container.querySelector('#rdo-service-report-block') as HTMLElement;
  const signaturesEl = container.querySelector('#rdo-signatures') as HTMLElement;
  const footerEl = container.querySelector('#rdo-footer') as HTMLElement;

  if (!headerEl || !content1El || !serviceReportEl || !signaturesEl || !footerEl) {
    throw new Error("PDF template is missing required structural elements.");
  }

  const headerCanvas = await toCanvas(headerEl);
  const content1Canvas = await toCanvas(content1El);
  const serviceReportCanvas = await toCanvas(serviceReportEl);
  const signaturesCanvas = await toCanvas(signaturesEl);
  const footerCanvas = await toCanvas(footerEl);

  // Pre-calculate heights and get image data for repeated elements
  const headerHeight = (headerCanvas.height * contentWidth) / headerCanvas.width;
  const footerHeight = (footerCanvas.height * pageWidth) / footerCanvas.width;
  const headerImg = headerCanvas.toDataURL('image/png', 1.0);
  const footerImg = footerCanvas.toDataURL('image/png', 1.0);

  // Define the content blocks and their properties (e.g., if they can be split)
  const contentBlocks = [
    { canvas: content1Canvas, breakable: true },
    { canvas: serviceReportCanvas, breakable: false },
    { canvas: signaturesCanvas, breakable: false },
  ];

  // 4. Single-pass rendering algorithm
  let currentY = 0;
  let isFirstPage = true;

  const startNewPage = () => {
    if (isFirstPage) {
      // Use the existing first page
      pdf.setPage(1);
      isFirstPage = false;
    } else {
      pdf.addPage();
    }
    pdf.addImage(headerImg, 'PNG', margin, margin, contentWidth, headerHeight);
    currentY = margin + headerHeight;
  };

  startNewPage(); // Initialize the first page

  for (const block of contentBlocks) {
    const blockCanvas = block.canvas;
    const blockHeight = (blockCanvas.height * contentWidth) / blockCanvas.width;

    if (block.breakable) {
      let sourceY = 0; // Y-position on the source canvas for cropping
      while (sourceY < blockCanvas.height) {
        const spaceLeftOnPage = pageHeight - margin - currentY - footerHeight;

        // If no space is left, create a new page
        if (spaceLeftOnPage <= 0.1) {
            pdf.addImage(footerImg, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
            startNewPage();
            continue; // Re-evaluate space on the new page
        }

        const sourceChunkHeight = (spaceLeftOnPage * blockCanvas.width) / contentWidth;
        const heightToCrop = Math.min(blockCanvas.height - sourceY, sourceChunkHeight);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = blockCanvas.width;
        tempCanvas.height = heightToCrop;
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
          // Crop the source canvas and draw the chunk
          tempCtx.drawImage(blockCanvas, 0, sourceY, blockCanvas.width, heightToCrop, 0, 0, blockCanvas.width, heightToCrop);
          const chunkImg = tempCanvas.toDataURL('image/png', 1.0);
          const chunkHeightMM = (tempCanvas.height * contentWidth) / tempCanvas.width;

          pdf.addImage(chunkImg, 'PNG', margin, currentY, contentWidth, chunkHeightMM);
          currentY += chunkHeightMM;
        }

        sourceY += heightToCrop;
      }
    } else { // Unbreakable block
      const spaceLeftOnPage = pageHeight - margin - currentY - footerHeight;
      if (blockHeight > spaceLeftOnPage + 0.1) { // Check if it fits
        pdf.addImage(footerImg, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
        startNewPage();
      }
      const blockImg = blockCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(blockImg, 'PNG', margin, currentY, contentWidth, blockHeight);
      currentY += blockHeight;
    }
  }

  // Add footer to the final page
  pdf.addImage(footerImg, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);

  // 5. Clean up the off-screen div
  root.unmount();
  document.body.removeChild(container);

  return pdf.output('blob');
};