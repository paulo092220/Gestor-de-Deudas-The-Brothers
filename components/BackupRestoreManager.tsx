import React, { useRef } from 'react';
import { Customer, ExchangeRates } from '../types';

interface BackupRestoreManagerProps {
  customers: Customer[];
  exchangeRates: ExchangeRates;
  onRestore: (data: { customers: Customer[], exchangeRates?: ExchangeRates }) => void;
  onResetApp: () => void;
}

const BackupRestoreManager: React.FC<BackupRestoreManagerProps> = ({ customers, exchangeRates, onRestore, onResetApp }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    const backupData = {
      customers,
      exchangeRates,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
    a.download = `deudas_backup_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const parsedData = JSON.parse(result);
           if (parsedData && Array.isArray(parsedData.customers)) {
              if (window.confirm('¿Estás seguro de que quieres restaurar los datos? Todos los datos actuales se sobrescribirán.')) {
                onRestore(parsedData);
              }
           } else {
             alert('El formato del archivo de copia de seguridad no es válido.');
           }
        }
      } catch (error) {
        console.error("Error parsing backup file:", error);
        alert('El archivo de copia de seguridad no es válido o está dañado.');
      }
    };
    reader.readAsText(file);
    // Reset file input value to allow selecting the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Copia de Seguridad y Restauración</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Guarda, recupera o restablece todos los datos de la aplicación.</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <button
            onClick={handleBackup}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 8.586V3a1 1 0 10-2 0v5.586L8.707 7.293z" /><path d="M3 11a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
            Crear Copia
          </button>
          <button
            onClick={handleRestoreClick}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            Restaurar
          </button>
           <button
            onClick={onResetApp}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            Restablecer
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="application/json"
          />
        </div>
      </div>
    </div>
  );
};

export default BackupRestoreManager;