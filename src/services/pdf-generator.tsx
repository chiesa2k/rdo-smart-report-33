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

  root.render(<RdoPdfTemplate formData={draftData} previewImages={photoPreviews} />);

  await new Promise(resolve => setTimeout(resolve, 1500));

  const pdf = new jsPDF('p', 'mm', 'a4');

  // Select all parts from the top-level container
  const headerElement = container.querySelector('#rdo-header') as HTMLElement;
  const mainContentElement = container.querySelector('#rdo-main-content') as HTMLElement;
  const signatureElement = container.querySelector('#rdo-signatures') as HTMLElement;
  const footerElement = container.querySelector('#rdo-footer') as HTMLElement;

  if (!headerElement || !mainContentElement || !signatureElement || !footerElement) {
    throw new Error("Could not find all required elements in the PDF template.");
  }

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 3;
  const marginY = 3;
  const contentWidth = pageWidth - (marginX * 2);

  const toCanvas = (el: HTMLElement) => html2canvas(el, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: null });

  // Common elements
  const headerCanvas = await toCanvas(headerElement);
  const headerImgData = headerCanvas.toDataURL('image/png', 1.0);
  const headerHeight = (headerCanvas.height * contentWidth) / headerCanvas.width;

  const footerCanvas = await toCanvas(footerElement);
  const footerImgData = footerCanvas.toDataURL('image/png', 1.0);
  const footerHeight = (footerCanvas.height * pageWidth) / footerCanvas.width;

  const signatureCanvas = await toCanvas(signatureElement);
  const signatureImgData = signatureCanvas.toDataURL('image/png', 1.0);
  const signatureHeight = (signatureCanvas.height * contentWidth) / signatureCanvas.width;

  const mainCanvas = await toCanvas(mainContentElement);
  const mainContentTotalHeight = (mainCanvas.height * contentWidth) / mainCanvas.width;

  const availablePageHeight = pageHeight - headerHeight - footerHeight - (marginY * 2);

  let contentProcessedY = 0;
  let pageCount = 0;

  while (contentProcessedY < mainContentTotalHeight) {
    pageCount++;
    pdf.addPage();
    pdf.addImage(headerImgData, 'PNG', marginX, marginY, contentWidth, headerHeight);

    const cropY = contentProcessedY;
    const cropHeight = Math.min(mainContentTotalHeight - contentProcessedY, availablePageHeight);

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = mainCanvas.width;
    pageCanvas.height = (cropHeight * mainCanvas.width) / contentWidth;
    const pageCtx = pageCanvas.getContext('2d');

    if (pageCtx) {
      pageCtx.drawImage(
        mainCanvas,
        0, (cropY * mainCanvas.width) / contentWidth,
        mainCanvas.width, pageCanvas.height,
        0, 0,
        pageCanvas.width, pageCanvas.height
      );
      const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(pageImgData, 'PNG', marginX, marginY + headerHeight, contentWidth, cropHeight);
    }

    contentProcessedY += cropHeight;
    pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
  }

  // Correctly calculate height of content on the last page, handling the edge case where content perfectly fills the page.
  const remainder = contentProcessedY % availablePageHeight;
  const lastPageContentHeight = (contentProcessedY > 0 && remainder === 0)
    ? availablePageHeight
    : remainder;

  // Calculate the fixed Y position for the signature block, placing it just above the footer.
  const signatureY = pageHeight - footerHeight - signatureHeight - marginY;

  // Calculate the Y position where the main content on the last page ends.
  const contentEndY = marginY + headerHeight + lastPageContentHeight;

  pdf.setPage(pageCount);

  // Check if the content on the last page overlaps with the fixed signature position.
  // A 5mm buffer is added to prevent text from touching the signature block.
  if (contentEndY + 5 > signatureY) {
    // Overlap: create a new page for the signature.
    pdf.addPage();
    pdf.addImage(headerImgData, 'PNG', marginX, marginY, contentWidth, headerHeight);
    // Place the signature at the same fixed Y position on the new page.
    pdf.addImage(signatureImgData, 'PNG', marginX, signatureY, contentWidth, signatureHeight);
    pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
  } else {
    // No overlap: add the signature to the last page at the calculated fixed position.
    pdf.addImage(signatureImgData, 'PNG', marginX, signatureY, contentWidth, signatureHeight);
  }

  pdf.deletePage(1); // Delete the initial blank page

  root.unmount();
  document.body.removeChild(container);

  return pdf.output('blob');
};