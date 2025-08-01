import { useCallback } from "react";

const useCSVDownload = () => {
  const downloadCSV = useCallback((response, customFilename = null) => {
    if (response) {
      const blob = new Blob([response], {
        type: "application/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const filename =
        customFilename || `export_${new Date().toISOString().slice(0, 10)}.csv`;
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
  }, []);

  return { downloadCSV };
};

export default useCSVDownload;
