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
  const flowableContent1Element = container.querySelector('#rdo-flowable-content-1') as HTMLElement;
  const serviceReportElement = container.querySelector('#rdo-service-report') as HTMLElement;
  const photographicEvidenceElement = container.querySelector('#rdo-photographic-evidence') as HTMLElement;
  const signatureElement = container.querySelector('#rdo-signatures') as HTMLElement;
  const footerElement = container.querySelector('#rdo-footer') as HTMLElement;

  if (!headerElement || !flowableContent1Element || !serviceReportElement || !photographicEvidenceElement || !signatureElement || !footerElement) {
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

  // Combine and process all flowable content
  const flowable1Canvas = await toCanvas(flowableContent1Element);
  const serviceReportCanvas = await toCanvas(serviceReportElement);
  const combinedFlowableCanvas = document.createElement('canvas');
  combinedFlowableCanvas.width = flowable1Canvas.width;
  combinedFlowableCanvas.height = flowable1Canvas.height + serviceReportCanvas.height;
  const ctx = combinedFlowableCanvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(flowable1Canvas, 0, 0);
    ctx.drawImage(serviceReportCanvas, 0, flowable1Canvas.height);
  }

  const flowableContentTotalHeight = (combinedFlowableCanvas.height * contentWidth) / combinedFlowableCanvas.width;

  let contentProcessedY = 0;
  let pageCount = 0;
  let lastPageHeightUsed = 0;

  while (contentProcessedY < flowableContentTotalHeight) {
    pageCount++;
    pdf.addPage();
    pdf.addImage(headerImgData, 'PNG', marginX, marginY, contentWidth, headerHeight);

    const cropY = contentProcessedY;
    const cropHeight = Math.min(flowableContentTotalHeight - contentProcessedY, availablePageHeight);
    lastPageHeightUsed = cropHeight;

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = combinedFlowableCanvas.width;
    pageCanvas.height = (cropHeight * combinedFlowableCanvas.width) / contentWidth;
    const pageCtx = pageCanvas.getContext('2d');

    if (pageCtx) {
      pageCtx.drawImage(
        combinedFlowableCanvas,
        0, (cropY * combinedFlowableCanvas.width) / contentWidth,
        combinedFlowableCanvas.width, pageCanvas.height,
        0, 0,
        pageCanvas.width, pageCanvas.height
      );
      const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(pageImgData, 'PNG', marginX, marginY + headerHeight, contentWidth, cropHeight);
    }

    contentProcessedY += cropHeight;
    pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
  }

  if (pageCount === 0) {
    pageCount++;
    pdf.addPage();
    pdf.addImage(headerImgData, 'PNG', marginX, marginY, contentWidth, headerHeight);
    pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
    lastPageHeightUsed = 0;
  }

  const addPageIfNeeded = (contentHeight) => {
    const spaceLeft = availablePageHeight - lastPageHeightUsed;
    if (contentHeight > spaceLeft) {
      pageCount++;
      pdf.addPage();
      pdf.addImage(headerImgData, 'PNG', marginX, marginY, contentWidth, headerHeight);
      pdf.addImage(footerImgData, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
      lastPageHeightUsed = 0;
    }
  };

  const photoCanvas = await toCanvas(photographicEvidenceElement);
  const photoHeight = (photoCanvas.height * contentWidth) / photoCanvas.width;
  if (photoHeight > 0) {
    addPageIfNeeded(photoHeight);
    const photoImgData = photoCanvas.toDataURL('image/png', 1.0);
    pdf.setPage(pageCount);
    pdf.addImage(photoImgData, 'PNG', marginX, marginY + headerHeight + lastPageHeightUsed, contentWidth, photoHeight);
    lastPageHeightUsed += photoHeight;
  }

  const signatureCanvas = await toCanvas(signatureElement);
  const signatureHeight = (signatureCanvas.height * contentWidth) / signatureCanvas.width;
  if (signatureHeight > 0) {
    addPageIfNeeded(signatureHeight);
    const signatureImgData = signatureCanvas.toDataURL('image/png', 1.0);
    pdf.setPage(pageCount);
    pdf.addImage(signatureImgData, 'PNG', marginX, marginY + headerHeight + lastPageHeightUsed, contentWidth, signatureHeight);
  }

  pdf.deletePage(1);

  root.unmount();
  document.body.removeChild(container);

  return pdf.output('blob');
};