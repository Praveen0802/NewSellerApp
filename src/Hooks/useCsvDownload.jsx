import { useCallback } from "react";

const useCSVDownload = () => {
  // Function to clean CSV data
  const cleanCSVData = useCallback((csvString) => {
    // Split into lines
    const lines = csvString.split("\n");

    // Process each line
    const cleanedLines = lines.map((line) => {
      if (line.trim() === "") return line;

      // Parse CSV line while preserving quoted values
      const values = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && (i === 0 || line[i - 1] === ",")) {
          inQuotes = true;
        } else if (
          char === '"' &&
          inQuotes &&
          (i === line.length - 1 || line[i + 1] === ",")
        ) {
          inQuotes = false;
        } else if (char === "," && !inQuotes) {
          values.push(current);
          current = "";
          continue;
        }

        current += char;
      }
      values.push(current); // Push the last value

      // Clean each value
      const cleanedValues = values.map((value, index) => {
        let cleanValue = value.replace(/^"(.*)"$/, "$1"); // Remove surrounding quotes

        // Check if this looks like an amount column (contains currency symbols)
        if (cleanValue.match(/[£$€¥₹د\.إ]/)) {
          // Extract numeric value and currency
          const currencyMatch = cleanValue.match(
            /([£$€¥₹]|د\.إ)\s*([\d,]+\.?\d*)/
          );
          if (currencyMatch) {
            const currency = currencyMatch[1];
            const amount = currencyMatch[2];
            // Format as "Currency Amount" or keep original format
            cleanValue = `"${currency} ${amount}"`;
          }
        }

        // Ensure proper quoting for values with commas or special characters
        if (
          cleanValue.includes(",") ||
          cleanValue.includes('"') ||
          cleanValue.match(/[£$€¥₹د\.إ]/)
        ) {
          cleanValue = `"${cleanValue.replace(/"/g, '""')}"`;
        }

        return cleanValue;
      });

      return cleanedValues.join(",");
    });

    return cleanedLines.join("\n");
  }, []);

  const downloadCSV = useCallback(
    (response, customFilename = null, options = {}) => {
      if (response) {
        let processedResponse = response;

        // Clean the CSV data if not disabled
        if (!options.skipCleaning) {
          processedResponse = cleanCSVData(response);
        }

        // Add BOM for proper UTF-8 encoding in Excel
        const BOM = "\uFEFF";
        const csvWithBOM = BOM + processedResponse;

        const blob = new Blob([csvWithBOM], {
          type: "text/csv;charset=utf-8;",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        const filename =
          customFilename ||
          `export_${new Date().toISOString().slice(0, 10)}.csv`;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
        return true;
      } else {
        console.error("No data received from server");
        return false;
      }
    },
    [cleanCSVData]
  );

  return { downloadCSV };
};

export default useCSVDownload;
