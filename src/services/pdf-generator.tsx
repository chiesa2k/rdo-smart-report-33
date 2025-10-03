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
  await new Promise(resolve => setTimeout(resolve, 1500));

  const pdf = new jsPDF('p', 'mm', 'a4');

  // Select all parts from the top-level container to ensure they are all found
  const headerElement = container.querySelector('#rdo-header') as HTMLElement;
  const mainContentElement = container.querySelector('#rdo-main-content') as HTMLElement;
  const signatureElement = container.querySelector('#rdo-signatures') as HTMLElement;
  const footerElement = container.querySelector('#rdo-footer') as HTMLElement;

  if (!headerElement || !mainContentElement || !signatureElement || !footerElement) {
    throw new Error("Could not find all required elements in the PDF template.");
  }

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 7;
  const marginY = 10;
  const contentWidth = pageWidth - (marginX * 2);

  const toCanvas = (el: HTMLElement) => html2canvas(el, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: null });

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

  // Legacy behavior: photos are part of the main content canvas

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

  pdf.deletePage(1);

  const remainder = contentProcessedY % availablePageHeight;
  const lastPageContentHeight = (contentProcessedY > availablePageHeight)
    ? (remainder === 0 ? availablePageHeight : remainder)
    : contentProcessedY;
  const spaceLeftOnLastPage = availablePageHeight - lastPageContentHeight;

  pdf.setPage(pageCount);

  if (spaceLeftOnLastPage > signatureHeight + 5) {
    pdf.addImage(signatureImgData, 'PNG', marginX, marginY + headerHeight + lastPageContentHeight + 5, contentWidth, signatureHeight);
  } else {
    pdf.addPage();
    pdf.addImage(headerImgData, 'PNG', marginX, marginY, contentWidth, headerHeight);
    pdf.addImage(signatureImgData, 'PNG', marginX, marginY + headerHeight + 5, contentWidth, signatureHeight);
    pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
  }

  root.unmount();
  document.body.removeChild(container);

  return pdf.output('blob');
};
