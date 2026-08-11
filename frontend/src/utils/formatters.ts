/**
 * Formats a numeric value into Indian Rupee (INR - ₹) currency format.
 * Example: 149999.5 -> "₹1,49,999.50"
 */
export const formatINR = (amount: number | string | null | undefined): string => {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(numericAmount)) return '₹0.00';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

export const formatCurrencyINR = formatINR;

/**
 * Formats a date string or Date object into Indian standard DD/MM/YYYY format.
 * Example: "2026-08-11T12:00:00Z" -> "11/08/2026"
 */
export const formatDateIN = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return 'N/A';
  const d = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (isNaN(d.getTime())) return 'N/A';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Formats an Indian 10-digit mobile number into standard +91 XXXXX XXXXX layout.
 */
export const formatPhoneIN = (phone: string | null | undefined): string => {
  if (!phone) return 'N/A';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
};

/**
 * Formats a GSTIN number ensuring uppercase representation.
 */
export const formatGSTIN = (gst: string | null | undefined): string => {
  if (!gst) return 'N/A';
  return gst.trim().toUpperCase();
};
