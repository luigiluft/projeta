
export async function importFromCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error("Falha ao ler arquivo"));
          return;
        }
        
        const csvContent = event.target.result as string;
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error("Arquivo CSV vazio ou inválido"));
          return;
        }
        
        // Parse headers (first line)
        const headers = lines[0].split(',').map(header => header.trim());
        
        // Parse data rows
        const data = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const row: Record<string, any> = {};
          
          headers.forEach((header, index) => {
            if (index < values.length) {
              // Convert special values
              if (values[index].toLowerCase() === 'sim') {
                row[header] = true;
              } else if (values[index].toLowerCase() === 'não' || values[index].toLowerCase() === 'nao') {
                row[header] = false;
              } else {
                row[header] = values[index];
              }
            } else {
              row[header] = '';
            }
          });
          
          return row;
        });
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Erro ao ler o arquivo"));
    };
    
    reader.readAsText(file);
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let currentValue = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
      
      // Handle escaped quotes (double quotes)
      if (i < line.length - 1 && line[i + 1] === '"' && inQuotes) {
        currentValue += '"';
        i++; // Skip next quote
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add the last field
  result.push(currentValue);
  
  return result;
}
