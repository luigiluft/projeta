
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
    Object.values(item).map(value => 
      typeof value === 'string' && value.includes(',') 
        ? `"${value}"`
        : value
    ).join(',')
  );
  
  const csv = [headers, ...rows].join('\n');
  
  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('link');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
