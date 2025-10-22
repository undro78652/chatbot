import { ExportData } from '../types';
import { exportData, importData } from './localStorage';

export const downloadJson = (data: ExportData, filename: string = 'chatbot-export.json') => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const handleExport = () => {
  const data = exportData();
  const timestamp = new Date().toISOString().split('T')[0];
  downloadJson(data, `chatbot-export-${timestamp}.json`);
};

export const handleImport = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      try {
        const text = await file.text();
        const data: ExportData = JSON.parse(text);

        if (!data.version || !data.settings) {
          throw new Error('Invalid export file format');
        }

        importData(data);
        resolve();
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to import file'));
      }
    };

    input.oncancel = () => {
      reject(new Error('Import cancelled'));
    };

    input.click();
  });
};
