import React, { useState, useEffect } from 'react';
import { Currency, ExchangeRates } from '../types';

interface ExchangeRateManagerProps {
  rates: ExchangeRates;
  onUpdateRates: (newRates: ExchangeRates) => void;
}

const ExchangeRateManager: React.FC<ExchangeRateManagerProps> = ({ rates, onUpdateRates }) => {
  const [localRates, setLocalRates] = useState<ExchangeRates>(rates);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocalRates(rates);
  }, [rates]);

  // Fix: Explicitly use Currency type for clarity.
  const handleRateChange = (currency: Currency, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setLocalRates(prev => ({ ...prev, [currency]: numericValue }));
  };

  const handleSave = () => {
    onUpdateRates(localRates);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setLocalRates(rates);
    setIsEditing(false);
  }

  // Fix: Explicitly type `rateCurrencies` as an array of `Currency`.
  const rateCurrencies: Currency[] = [Currency.USD, Currency.EUR, Currency.ZELLE, Currency.USDT];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Tasas de Cambio por Defecto (a CUP)</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
            Editar
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rateCurrencies.map(currency => (
          <div key={currency}>
            <label htmlFor={currency} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{currency}</label>
            {isEditing ? (
              <input
                type="number"
                id={currency}
                // Fix: Use nullish coalescing to provide a default empty string, preventing issues with uncontrolled components if the rate is not set.
                value={localRates[currency] ?? ''}
                onChange={(e) => handleRateChange(currency, e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              // Fix: Use nullish coalescing to provide a default value of 0, preventing runtime errors if a rate is undefined.
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{(localRates[currency] ?? 0).toLocaleString('en-US')}</p>
            )}
          </div>
        ))}
      </div>
      {isEditing && (
        <div className="flex justify-end mt-4 space-x-2">
          <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Guardar Cambios</button>
        </div>
      )}
    </div>
  );
};

export default ExchangeRateManager;