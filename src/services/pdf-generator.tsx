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
  const flowableContentElement = container.querySelector('#rdo-flowable-content') as HTMLElement;
  const unbreakableContentElement = container.querySelector('#rdo-unbreakable-content') as HTMLElement;
  const footerElement = container.querySelector('#rdo-footer') as HTMLElement;

  if (!headerElement || !flowableContentElement || !unbreakableContentElement || !footerElement) {
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

  const availablePageHeight = pageHeight - headerHeight - footerHeight - (marginY * 2);

  // Process flowable content first
  const flowableCanvas = await toCanvas(flowableContentElement);
  const flowableContentTotalHeight = (flowableCanvas.height * contentWidth) / flowableCanvas.width;

  let contentProcessedY = 0;
  let pageCount = 0;

  while (contentProcessedY < flowableContentTotalHeight) {
    pageCount++;
    pdf.addPage();
    pdf.addImage(headerImgData, 'PNG', marginX, marginY, contentWidth, headerHeight);

    const cropY = contentProcessedY;
    const cropHeight = Math.min(flowableContentTotalHeight - contentProcessedY, availablePageHeight);

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = flowableCanvas.width;
    pageCanvas.height = (cropHeight * flowableCanvas.width) / contentWidth;
    const pageCtx = pageCanvas.getContext('2d');

    if (pageCtx) {
      pageCtx.drawImage(
        flowableCanvas,
        0, (cropY * flowableCanvas.width) / contentWidth,
        flowableCanvas.width, pageCanvas.height,
        0, 0,
        pageCanvas.width, pageCanvas.height
      );
      const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(pageImgData, 'PNG', marginX, marginY + headerHeight, contentWidth, cropHeight);
    }

    contentProcessedY += cropHeight;
    pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
  }

  // Now handle the unbreakable content
  const unbreakableCanvas = await toCanvas(unbreakableContentElement);
  const unbreakableContentHeight = (unbreakableCanvas.height * contentWidth) / unbreakableCanvas.width;
  const unbreakableImgData = unbreakableCanvas.toDataURL('image/png', 1.0);

  const lastFlowablePageHeight = (flowableContentTotalHeight > 0)
    ? (flowableContentTotalHeight % availablePageHeight === 0 ? availablePageHeight : flowableContentTotalHeight % availablePageHeight)
    : 0;

  if (pageCount === 0) {
    // Flowable content was empty, this is the first page
    pageCount++;
    pdf.addPage();
    pdf.addImage(headerImgData, 'PNG', marginX, marginY, contentWidth, headerHeight);
    pdf.addImage(unbreakableImgData, 'PNG', marginX, marginY + headerHeight, contentWidth, unbreakableContentHeight);
    pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
  } else {
    // There was flowable content, check if unbreakable fits on the last page
    const spaceLeft = availablePageHeight - lastFlowablePageHeight;
    if (unbreakableContentHeight > spaceLeft) {
      // Doesn't fit, add a new page
      pageCount++;
      pdf.addPage();
      pdf.addImage(headerImgData, 'PNG', marginX, marginY, contentWidth, headerHeight);
      pdf.addImage(unbreakableImgData, 'PNG', marginX, marginY + headerHeight, contentWidth, unbreakableContentHeight);
      pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
    } else {
      // Fits, add to the last page
      pdf.addImage(unbreakableImgData, 'PNG', marginX, marginY + headerHeight + lastFlowablePageHeight, contentWidth, unbreakableContentHeight);
    }
  }

  pdf.deletePage(1); // Delete the initial blank page

  root.unmount();
  document.body.removeChild(container);

  return pdf.output('blob');
};