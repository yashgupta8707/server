/**
 * Generate a unique estimate/quotation number
 * @returns {String} Unique quotation number
 */
export const generateEstimateNumber = () => {
  const today = new Date();
  const year = today.getFullYear().toString().substr(-2); // Last two digits of year
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  // Create a date-based prefix (e.g., Q2505-...)
  const prefix = `Q${year}${month}${day}`;
  
  // Get a random number for uniqueness
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  // Combine for final ID
  return `${prefix}-${randomNum}`;
};

/**
 * Generate a unique invoice number
 * @returns {String} Unique invoice number
 */
export const generateInvoiceNumber = () => {
  const today = new Date();
  const year = today.getFullYear().toString().substr(-2); // Last two digits of year
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  
  // Financial year formatting (e.g., 24-25 for 2024-2025)
  const financialYearStart = today.getMonth() >= 3 ? year : (parseInt(year) - 1).toString().padStart(2, '0');
  const financialYearEnd = today.getMonth() >= 3 ? (parseInt(year) + 1).toString().padStart(2, '0') : year;
  
  // Create a financial year prefix (e.g., INV/24-25/05/...)
  const prefix = `INV/${financialYearStart}-${financialYearEnd}/${month}`;
  
  // Get the count of existing invoices + 1
  // For simplicity we'll use a random number here, but ideally this would
  // increment based on the actual count of invoices for the month
  const count = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // Combine for final ID
  return `${prefix}/${count}`;
};

export default {
  generateEstimateNumber,
  generateInvoiceNumber
};