import React, { useState, useEffect, useMemo } from 'react';
import { Currency, Customer, BoxTransaction, ExchangeRates } from '../types';
import { calculatePaidBoxesForDebt } from '../utils/debtCalculator';

interface PayBoxesFormProps {
  customer: Customer | null;
  debtToPay: BoxTransaction | null;
  onPayBoxes: (data: {
    debtId: string;
    paymentAmount: number;
    paymentCurrency: Currency;
    paymentRateToCUP: number;
    boxValueInCUP: number;
    notes: string;
  }) => void;
  onClose: () => void;
  exchangeRates: ExchangeRates;
}

const PayBoxesForm: React.FC<PayBoxesFormProps> = ({ customer, debtToPay, onPayBoxes, onClose, exchangeRates }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [rateToCUP, setRateToCUP] = useState('');
  const [boxValueInCUP, setBoxValueInCUP] = useState('');
  const [notes, setNotes] = useState('Pago de cajas');

  const paidBoxesForThisDebt = useMemo(() => {
    if (!debtToPay || !customer) return 0;
    return calculatePaidBoxesForDebt(debtToPay.id, customer.boxTransactions);
  }, [customer, debtToPay]);

  const remainingBoxDebt = useMemo(() => {
    if (!debtToPay) return 0;
    return debtToPay.boxes - paidBoxesForThisDebt;
  }, [debtToPay, paidBoxesForThisDebt]);

  useEffect(() => {
    if (currency === Currency.CUP) {
        setRateToCUP('1');
    } else {
        setRateToCUP(exchangeRates[currency]?.toString() || '');
    }
  }, [currency, exchangeRates]);

  const boxesPaidByThisPayment = useMemo(() => {
    const numAmount = parseFloat(amount);
    const numRate = parseFloat(rateToCUP);
    const numBoxValue = parseFloat(boxValueInCUP);
    if (numAmount > 0 && numRate > 0 && numBoxValue > 0) {
      return (numAmount * numRate) / numBoxValue;
    }
    return 0;
  }, [amount, rateToCUP, boxValueInCUP]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtToPay) return;
    const numAmount = parseFloat(amount);
    const numRate = parseFloat(rateToCUP);
    const numBoxValue = parseFloat(boxValueInCUP);

    if (boxesPaidByThisPayment > 0) {
      onPayBoxes({
        debtId: debtToPay.id,
        paymentAmount: numAmount,
        paymentCurrency: currency,
        paymentRateToCUP: numRate,
        boxValueInCUP: numBoxValue,
        notes: notes.trim(),
      });
      onClose();
    }
  };

  const isFormValid = useMemo(() => boxesPaidByThisPayment > 0, [boxesPaidByThisPayment]);

  if (!debtToPay) {
    return <p>Error: No se ha especificado una deuda para pagar.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-center">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Pagando deuda de: <span className="font-semibold">{debtToPay.notes}</span>
        </p>
        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
          {remainingBoxDebt.toLocaleString('en-US', {maximumFractionDigits: 2})} Cajas Pendientes
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Monto del Pago
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
      
      <div className="grid grid-cols-2 gap-4">
        {currency !== Currency.CUP && (
            <div>
                <label htmlFor="rateToCUP" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tasa (1 {currency} a CUP)
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
        <div className={currency === Currency.CUP ? 'col-span-2' : ''}>
            <label htmlFor="boxValueInCUP" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Valor de Caja en CUP
            </label>
            <input
                type="number"
                id="boxValueInCUP"
                value={boxValueInCUP}
                onChange={(e) => setBoxValueInCUP(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-slate-900 dark:text-white"
                required
                min="0.01"
                step="0.01"
            />
        </div>
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Notas del Pago
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-slate-900 dark:text-white"
        />
      </div>

      {isFormValid && (
        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300">Este pago salda</p>
          <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {boxesPaidByThisPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cajas
          </p>
          {boxesPaidByThisPayment > remainingBoxDebt && (
              <p className="text-xs text-yellow-500 mt-1">
                  Atención: El pago es mayor a la deuda restante de {remainingBoxDebt.toLocaleString('en-US', { maximumFractionDigits: 2 })} cajas.
              </p>
          )}
        </div>
      )}

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
          className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 disabled:bg-orange-300"
          disabled={!isFormValid}
        >
          Registrar Pago
        </button>
      </div>
    </form>
  );
};

export default PayBoxesForm;