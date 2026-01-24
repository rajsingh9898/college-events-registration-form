// Format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN');
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate mobile
export const validateMobile = (mobile) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(mobile);
};

// Download PDF
export const downloadPDF = (pdfData, filename) => {
  const blob = new Blob([pdfData], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};