import fileDownload from 'js-file-download';
import { useCallback } from 'react';
import * as XLSX from 'xlsx';

interface UseExportToXLSProps<T> {
  data: T[];
  fileName: string;
}

const useExportToXLS = <T extends object>({ data, fileName }: UseExportToXLSProps<T>) => {
  return useCallback(() => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, fileName);
    const xlsData = XLSX.write(workbook, {
      bookType: 'xls',
      type: 'binary',
    });
    const buffer = new ArrayBuffer(xlsData.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < xlsData.length; i += 1) {
      view[i] = xlsData.charCodeAt(i);
    }
    fileDownload(new Blob([buffer], { type: 'application/vnd.ms-excel' }), `${fileName}.xls`);
  }, [data, fileName]);
};

export default useExportToXLS;
