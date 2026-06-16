import pdf from 'pdf-parse';

/**
 * Extract raw text content from a PDF file buffer.
 * @param {Buffer} fileBuffer - The PDF file as a buffer
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromPDF = async (fileBuffer) => {
  try {
    const data = await pdf(fileBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error.message);
    throw new Error("Failed to parse PDF file. Please ensure it's a valid PDF.");
  }
};
