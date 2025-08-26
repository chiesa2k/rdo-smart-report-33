import { RDOFormData } from './rdo-storage';

export interface UploadResponse {
  success: boolean;
  message: string;
  uploadId?: string;
}

/**
 * Mocks uploading the RDO data and the generated PDF blob to a server.
 * @param draftData The RDO form data.
 * @param pdfBlob The generated PDF as a Blob.
 * @returns A promise that resolves with an upload response.
 */
export const uploadRdo = (draftData: RDOFormData, pdfBlob: Blob): Promise<UploadResponse> => {
  return new Promise((resolve) => {
    console.log('--- Starting Upload Simulation ---');
    console.log('Uploading RDO data:', draftData);
    console.log('Uploading PDF blob:', {
      size: pdfBlob.size,
      type: pdfBlob.type,
    });

    // Simulate network delay
    setTimeout(() => {
      const response: UploadResponse = {
        success: true,
        message: `Successfully uploaded RDO ${draftData.reportNumber}.`,
        uploadId: `upload-${Date.now()}`,
      };
      console.log('--- Upload Simulation Complete ---');
      console.log('Server response:', response);
      resolve(response);
    }, 1500);
  });
};
