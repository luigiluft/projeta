
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
        
        // Remover linhas completamente vazias e linhas que contêm apenas vírgulas
        const lines = csvContent.split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.split(',').every(cell => !cell.trim()));
        
        if (lines.length < 2) {
          reject(new Error("Arquivo CSV vazio ou inválido"));
          return;
        }
        
        // Parse headers (first line)
        const headers = parseCSVLine(lines[0]);
        console.log('Headers detectados:', headers);
        
        // Verificar se tem pelo menos um cabeçalho relacionado à tarefa
        const taskHeaderIndex = findTaskHeaderIndex(headers);
        if (taskHeaderIndex === -1) {
          reject(new Error("O arquivo CSV deve conter uma coluna 'Tarefa', 'Nome da Tarefa' ou similar"));
          return;
        }
        
        console.log(`Coluna de tarefa encontrada no índice ${taskHeaderIndex}: "${headers[taskHeaderIndex]}"`);
        
        // Parse data rows
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
          try {
            const line = lines[i];
            // Pular linhas vazias completamente
            if (!line.trim()) {
              console.log(`Linha ${i+1} ignorada: vazia`);
              continue;
            }
            
            const values = parseCSVLine(line);
            
            // Verificar se a linha tem valores suficientes
            if (values.length === 0) {
              console.log(`Linha ${i+1} ignorada: sem valores`);
              continue;
            }
            
            // Verificar se a linha tem o valor da tarefa
            if (taskHeaderIndex >= values.length || !values[taskHeaderIndex]?.trim()) {
              console.log(`Linha ${i+1} ignorada: não possui valor para o campo Tarefa`, line);
              continue; // Pula esta linha e continua com a próxima
            }
            
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
            
            // Garantir que o campo tarefa seja setado corretamente
            row["task_name"] = values[taskHeaderIndex];
            
            data.push(row);
          } catch (error) {
            console.warn(`Erro ao processar linha ${i+1}:`, error);
            // Continua com as próximas linhas mesmo se uma linha falhar
          }
        }
        
        if (data.length === 0) {
          reject(new Error("Nenhuma tarefa válida encontrada no arquivo"));
          return;
        }
        
        console.log('CSV importado com sucesso:', data);
        resolve(data);
      } catch (error) {
        console.error('Erro ao processar CSV:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Erro ao ler o arquivo"));
    };
    
    reader.readAsText(file);
  });
}

// Função auxiliar para encontrar o índice do cabeçalho relacionado à tarefa
function findTaskHeaderIndex(headers: string[]): number {
  const possibleTaskHeaders = [
    'tarefa', 'task', 'task_name', 'nome_tarefa', 'nome da tarefa', 
    'título', 'titulo', 'title', 'nome', 'name', 'descrição', 'descricao',
    'description', 'tarefas'
  ];
  
  for (let i = 0; i < headers.length; i++) {
    const normalizedHeader = headers[i].toLowerCase().trim();
    if (possibleTaskHeaders.includes(normalizedHeader)) {
      return i;
    }
  }
  
  return -1;
}

// Função melhorada para lidar com valores entre aspas e vírgulas dentro de campos
function parseCSVLine(line: string): string[] {
  if (!line || line.trim() === '') {
    return [];
  }
  
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
      result.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add the last field
  result.push(currentValue.trim());
  
  return result;
}
