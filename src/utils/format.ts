
export const formatCurrency = (value: number) => {
  // Garantir que o valor é um número, mesmo que zero
  const numericValue = isNaN(value) ? 0 : value;
  
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export const formatDate = (dateString: string | Date) => {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
