
export function exportToCSV(data: any[], filename: string, columns?: { id: string; visible: boolean; label: string }[]) {
  // Se as colunas forem fornecidas, filtra os dados para incluir apenas colunas visíveis
  let exportData = data;
  
  if (columns && columns.length > 0) {
    const visibleColumns = columns.filter(column => column.visible).map(column => column.id);
    
    exportData = data.map(item => {
      const filteredItem: Record<string, any> = {};
      visibleColumns.forEach(columnId => {
        if (item.hasOwnProperty(columnId)) {
          filteredItem[columnId] = item[columnId];
        }
      });
      return filteredItem;
    });
  }
  
  // Se não houver dados para exportar, não faz nada
  if (!exportData.length) {
    console.warn("Nenhum dado para exportar");
    return;
  }
  
  // Convert data to CSV format
  const headers = Object.keys(exportData[0] || {}).join(',');
  const rows = exportData.map(item => 
    Object.values(item).map(value => {
      // Handle null or undefined values
      if (value === null || value === undefined) {
        return '';
      }
      // Escape quotes in strings and wrap with quotes if contains comma or newline
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }
      // Convert other types to string
      return String(value);
    }).join(',')
  );
  
  const csv = [headers, ...rows].join('\n');
  
  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create an anchor element and set its attributes
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  
  // Explicitly add to document to ensure it works across browsers
  document.body.appendChild(link);
  
  // Trigger click event programmatically
  link.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
