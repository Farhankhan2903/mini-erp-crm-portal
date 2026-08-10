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
