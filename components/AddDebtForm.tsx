import React, { useState, useEffect } from 'react';
import { Currency, Debt, ExchangeRates } from '../types';

interface AddDebtFormProps {
  onAddDebt: (debt: Omit<Debt, 'id' | 'date'>) => void;
  onClose: () => void;
  exchangeRates: ExchangeRates;
}

const AddDebtForm: React.FC<AddDebtFormProps> = ({ onAddDebt, onClose, exchangeRates }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(Currency.CUP);
  const [notes, setNotes] = useState('');
  const [rateToCUP, setRateToCUP] = useState('1');

  useEffect(() => {
    if (currency === Currency.CUP) {
        setRateToCUP('1');
    } else {
        setRateToCUP(exchangeRates[currency]?.toString() || '');
    }
  }, [currency, exchangeRates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    const numericRate = parseFloat(rateToCUP);
    if (!isNaN(numericAmount) && numericAmount > 0 && !isNaN(numericRate) && numericRate > 0) {
      onAddDebt({
        amount: numericAmount,
        currency,
        notes: notes.trim(),
        rateToCUP: numericRate,
      });
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Monto
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-slate-900 dark:text-white"
            autoFocus
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Moneda
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-slate-900 dark:text-white"
          >
            {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {currency !== Currency.CUP && (
        <div>
            <label htmlFor="rateToCUP" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tasa de Cambio (1 {currency} a CUP)
            </label>
            <input
                type="number"
                id="rateToCUP"
                value={rateToCUP}
                onChange={(e) => setRateToCUP(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-slate-900 dark:text-white"
                placeholder="Ej: 360"
                required
                min="0.01"
                step="0.01"
            />
        </div>
      )}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Notas del Producto
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-slate-900 dark:text-white"
          required
        />
      </div>
      <div className="flex justify-end space-x-3 pt-2">
         <button 
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-600 rounded-md hover:bg-slate-200 dark:hover:bg-slate-500"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-primary-300"
          disabled={!amount || !notes.trim() || !rateToCUP}
        >
          Añadir Deuda
        </button>
      </div>
    </form>
  );
};

export default AddDebtForm;