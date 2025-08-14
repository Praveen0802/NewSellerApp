import { useCallback } from "react";

const useCSVDownload = () => {
  // Function to properly escape a CSV field
  const escapeCSVField = useCallback((field) => {
    // Convert to string and trim
    const str = String(field || '').trim();
    
    // If field contains comma, quotes, or newlines, wrap in quotes and escape internal quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    
    return str;
  }, []);

  // Function to clean and format currency values
  const formatCurrencyField = useCallback((value) => {
    const cleanValue = value.replace(/^"(.*)"$/, '$1'); // Remove outer quotes first
    
    // Check if this looks like a currency value
    const currencyMatch = cleanValue.match(/([£$€¥₹]|د\.إ)\s*([\d,]+\.?\d*)/);
    if (currencyMatch) {
      const currency = currencyMatch[1];
      const amount = currencyMatch[2];
      return `${currency} ${amount}`; // Return without quotes - escapeCSVField will handle quoting if needed
    }
    
    return cleanValue;
  }, []);

  // Function to clean CSV data
  const cleanCSVData = useCallback((csvString) => {
    const lines = csvString.split('\n');
    
    const cleanedLines = lines.map(line => {
      if (line.trim() === '') return line;
      
      // Simple CSV parsing - split by comma but respect quoted fields
      const fields = [];
      let currentField = '';
      let inQuotes = false;
      let i = 0;
      
      while (i < line.length) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            // Escaped quote
            currentField += '"';
            i += 2;
            continue;
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // Field separator
          fields.push(currentField);
          currentField = '';
          i++;
          continue;
        } else {
          currentField += char;
        }
        i++;
      }
      fields.push(currentField); // Add the last field
      
      // Clean and format each field
      const cleanedFields = fields.map(field => {
        // Remove outer quotes if present
        let cleaned = field.replace(/^"(.*)"$/, '$1');
        
        // Format currency if detected
        if (cleaned.match(/[£$€¥₹د\.إ]/)) {
          cleaned = formatCurrencyField(field);
        }
        
        // Properly escape the field for CSV
        return escapeCSVField(cleaned);
      });
      
      return cleanedFields.join(',');
    });
    
    return cleanedLines.join('\n');
  }, [escapeCSVField, formatCurrencyField]);

  const downloadCSV = useCallback((response, customFilename = null, options = {}) => {
    if (!response) {
      console.error("No data received from server");
      return false;
    }

    let processedResponse = response;

    // Clean the CSV data if not disabled
    if (!options.skipCleaning) {
      processedResponse = cleanCSVData(response);
    }

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + processedResponse;

    const blob = new Blob([csvWithBOM], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const filename = customFilename || `export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  }, [cleanCSVData]);

  return { downloadCSV };
};

export default useCSVDownload;