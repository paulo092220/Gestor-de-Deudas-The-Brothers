import React, { useState } from 'react';
import { Customer, Debt, BoxTransaction, Currency } from '../types';
import { calculateTotalDebtInCUP, calculateTotalBoxDebt, getBoxDebts, getPaymentsForDebt, calculatePaidBoxesForDebt } from '../utils/debtCalculator';

interface CustomerDetailsProps {
  customer: Customer;
  onBack: () => void;
  onAddDebt: () => void;
  onAddPayment: () => void;
  onAddBoxes: () => void;
  onPaySpecificDebt: (debt: BoxTransaction) => void;
  onDeleteTransaction: (customerId: string, transactionId: string) => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer, onBack, onAddDebt, onAddPayment, onAddBoxes, onPaySpecificDebt, onDeleteTransaction }) => {
  const totalDebt = calculateTotalDebtInCUP(customer.debts);
  const totalBoxDebt = calculateTotalBoxDebt(customer.boxTransactions);

  const monetaryTransactions = [...customer.debts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const boxDebts = getBoxDebts(customer.boxTransactions || []);

  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({});

  const togglePayments = (id: string) => {
    setExpandedPayments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{customer.name}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                  <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Deuda Monetaria</p>
                      <p className={`text-3xl font-bold ${totalDebt > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {totalDebt.toLocaleString('en-US', { style: 'currency', currency: 'CUP' })}
                      </p>
                  </div>
                  <button 
                      onClick={onAddPayment}
                      disabled={totalDebt <= 0}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-green-300 dark:disabled:bg-green-800 disabled:cursor-not-allowed"
                  >
                      Realizar Pago
                  </button>
              </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
               <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Deuda de Cajas (Total)</p>
                  <p className={`text-3xl font-bold ${totalBoxDebt > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                      {totalBoxDebt.toLocaleString('en-US', { maximumFractionDigits: 2 })} <span className="text-lg">Cajas</span>
                  </p>
              </div>
          </div>
      </div>
      
      <div className="flex justify-end gap-2 mb-6">
            <button onClick={onAddDebt} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                Añadir Deuda
            </button>
            <button onClick={onAddBoxes} className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 8a1 1 0 011-1h1V6a1 1 0 012 0v1h2V6a1 1 0 112 0v1h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H6v2H5a1 1 0 110-2h1v-2H5a1 1 0 01-1-1z" /><path d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1H3zm14 1a1 1 0 00-1-1H4a1 1 0 00-1 1v1h14V4z" /></svg>
                Añadir Cajas
            </button>
      </div>

      <div className="space-y-8">
        {/* Box Debts Section */}
        <div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Deudas de Cajas</h3>
          {boxDebts.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-6">No hay deudas de cajas registradas.</p>
          ) : (
            <ul className="space-y-4">
              {boxDebts.map(debt => {
                const paidBoxes = calculatePaidBoxesForDebt(debt.id, customer.boxTransactions || []);
                const remainingBoxes = debt.boxes - paidBoxes;
                const isPaid = remainingBoxes <= 0.005; // Tolerance for float precision
                const payments = getPaymentsForDebt(debt.id, customer.boxTransactions || []);

                return (
                  <li key={debt.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <p className="font-semibold text-lg text-orange-600 dark:text-orange-400">Deuda de {debt.boxes} Cajas</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{debt.notes}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(debt.date).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isPaid ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                          {isPaid ? 'PAGADO' : 'PENDIENTE'}
                        </span>
                        <button onClick={() => onDeleteTransaction(customer.id, debt.id)} disabled={payments.length > 0} className="text-slate-400 hover:text-red-500 disabled:text-slate-600 disabled:cursor-not-allowed" title={payments.length > 0 ? "No se puede eliminar una deuda con pagos" : "Eliminar deuda"}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${isPaid ? 100 : (paidBoxes / debt.boxes) * 100}%` }}></div>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="font-medium text-slate-700 dark:text-slate-200">Pagado: {paidBoxes.toLocaleString('en-US', {maximumFractionDigits: 2})}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">Restante: <span className="font-bold">{remainingBoxes.toLocaleString('en-US', {maximumFractionDigits: 2})}</span></span>
                      </div>
                    </div>
                    {!isPaid && (
                      <div className="flex justify-end mt-4">
                        <button onClick={() => onPaySpecificDebt(debt)} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
                          Pagar Cajas
                        </button>
                      </div>
                    )}
                    {payments.length > 0 && (
                      <div className="mt-4">
                        <button onClick={() => togglePayments(debt.id)} className="text-sm font-medium text-primary-600 dark:text-primary-400 w-full text-left flex items-center">
                           {expandedPayments[debt.id] ? 'Ocultar' : 'Mostrar'} Pagos ({payments.length})
                           <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${expandedPayments[debt.id] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                        {expandedPayments[debt.id] && (
                          <ul className="mt-2 space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-600">
                            {payments.map(p => (
                              <li key={p.id} className="text-sm group flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-sky-600 dark:text-sky-400">Pago de {p.boxes.toLocaleString(undefined, {maximumFractionDigits: 2})} Cajas</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(p.date).toLocaleString()}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">"{p.notes}" - {p.paymentAmount?.toLocaleString()} {p.paymentCurrency}</p>
                                </div>
                                <button 
                                  onClick={() => onDeleteTransaction(customer.id, p.id)} 
                                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 p-1"
                                  title="Eliminar pago"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Monetary History Section */}
        <div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Historial Monetario</h3>
          {monetaryTransactions.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-6">No hay transacciones monetarias registradas.</p>
          ) : (
            <ul className="space-y-4">
              {monetaryTransactions.map(transaction => {
                const isPayment = transaction.amount < 0;
                return (
                  <li key={transaction.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isPayment ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                            {isPayment ? 'PAGO' : 'DEUDA'}
                          </span>
                          <p className={`font-semibold text-lg ${isPayment ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {Math.abs(transaction.amount).toLocaleString()} <span className="text-xs text-slate-500 dark:text-slate-400">{transaction.currency}</span>
                          </p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 ml-1">{transaction.notes}</p>
                        {transaction.currency !== Currency.CUP && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-1">
                                Tasa: 1 {transaction.currency} = {transaction.rateToCUP.toLocaleString()} CUP
                            </p>
                        )}
                      </div>
                      <div className="text-right flex items-center">
                        <div className="mr-4">
                          <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(transaction.date).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(transaction.date).toLocaleTimeString()}</p>
                        </div>
                        <button onClick={() => onDeleteTransaction(customer.id, transaction.id)} className="text-slate-400 hover:text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;