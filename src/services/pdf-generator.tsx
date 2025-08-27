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
  const container = document.createElement('div');
  document.body.appendChild(container);

  const photoPreviews = await Promise.all(draftData.photos.map(readAsDataURL));
  const root = createRoot(container);

  // Render the component. The second argument callback is deprecated in React 18.
  root.render(<RdoPdfTemplate formData={draftData} previewImages={photoPreviews} />);

  // We must await a timeout to allow React to render and the browser to paint/load images
  // before we attempt to capture it with html2canvas.
  await new Promise(resolve => setTimeout(resolve, 1500));

  const pdf = new jsPDF('p', 'mm', 'a4');
  const templateElement = container.querySelector('#pdf-template') as HTMLElement;
  if (!templateElement) throw new Error("PDF template element not found");

  const headerElement = templateElement.querySelector('#rdo-header') as HTMLElement;
  const mainContentElement = templateElement.querySelector('#rdo-main-content') as HTMLElement;
  const signatureElement = templateElement.querySelector('#rdo-signatures') as HTMLElement;
  const footerElement = templateElement.querySelector('#rdo-footer') as HTMLElement;

  if (!headerElement || !mainContentElement || !signatureElement || !footerElement) {
    throw new Error("Could not find all required elements in the PDF template.");
  }

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  const toCanvas = (el: HTMLElement) => html2canvas(el, { scale: 2, useCORS: true, allowTaint: true });

  const headerCanvas = await toCanvas(headerElement);
  const headerImgData = headerCanvas.toDataURL('image/png', 1.0);
  const headerHeight = (headerCanvas.height * contentWidth) / headerCanvas.width;

  const footerCanvas = await toCanvas(footerElement);
  const footerImgData = footerCanvas.toDataURL('image/png', 1.0);
  const footerHeight = (footerCanvas.height * pageWidth) / footerCanvas.width; // Footer is full width

  const signatureCanvas = await toCanvas(signatureElement);
  const signatureImgData = signatureCanvas.toDataURL('image/png', 1.0);
  const signatureHeight = (signatureCanvas.height * contentWidth) / signatureCanvas.width;

  const mainCanvas = await toCanvas(mainContentElement);
  const mainImgData = mainCanvas.toDataURL('image/png', 1.0);
  const mainContentTotalHeight = (mainCanvas.height * contentWidth) / mainCanvas.width;

  const availablePageHeight = pageHeight - headerHeight - footerHeight - (margin * 2);

  let contentProcessedY = 0;
  let pageCount = 0;

  // Add pages for the main content
  while (contentProcessedY < mainContentTotalHeight) {
    pageCount++;
    pdf.addPage();
    pdf.addImage(headerImgData, 'PNG', margin, margin, contentWidth, headerHeight);

    const cropY = contentProcessedY;
    const cropHeight = Math.min(mainContentTotalHeight - contentProcessedY, availablePageHeight);

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = mainCanvas.width;
    pageCanvas.height = (cropHeight * mainCanvas.width) / contentWidth;
    const pageCtx = pageCanvas.getContext('2d');

    if (pageCtx) {
      pageCtx.drawImage(
        mainCanvas,
        0, // sourceX
        (cropY * mainCanvas.width) / contentWidth, // sourceY
        mainCanvas.width, // sourceWidth
        pageCanvas.height, // sourceHeight
        0, // destX
        0, // destY
        pageCanvas.width, // destWidth
        pageCanvas.height // destHeight
      );
      const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(pageImgData, 'PNG', margin, margin + headerHeight, contentWidth, cropHeight);
    }

    contentProcessedY += cropHeight;
    pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
  }

  // Remove the blank first page that jsPDF adds by default
  pdf.deletePage(1);

  // Add the signature block to the last page
  const lastPageContentHeight = (contentProcessedY % availablePageHeight) || availablePageHeight;
  const spaceLeftOnLastPage = availablePageHeight - lastPageContentHeight;

  pdf.setPage(pageCount); // Go to the last page

  if (spaceLeftOnLastPage > signatureHeight + 5) {
    // There's enough space on the last page of content
    pdf.addImage(signatureImgData, 'PNG', margin, margin + headerHeight + lastPageContentHeight + 5, contentWidth, signatureHeight);
  } else {
    // Not enough space, add a new page just for signatures
    pdf.addPage();
    pdf.addImage(headerImgData, 'PNG', margin, margin, contentWidth, headerHeight);
    pdf.addImage(signatureImgData, 'PNG', margin, margin + headerHeight + 5, contentWidth, signatureHeight);
    pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
  }

  root.unmount();
  document.body.removeChild(container);

  return pdf.output('blob');
};
