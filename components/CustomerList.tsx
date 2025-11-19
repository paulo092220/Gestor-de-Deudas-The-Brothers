import React from 'react';
import { Customer } from '../types';
import { calculateTotalDebtInCUP, calculateTotalBoxDebt } from '../utils/debtCalculator';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: () => void;
  onDeleteCustomer: (customer: Customer) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onSelectCustomer, onAddCustomer, onDeleteCustomer }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
       <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Clientes</h2>
        <button 
          onClick={onAddCustomer}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Añadir Cliente
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 5.197M15 21a6 6 0 00-9-5.197" /></svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No hay clientes</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comienza añadiendo un nuevo cliente.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {customers.sort((a, b) => a.name.localeCompare(b.name)).map(customer => {
            const totalDebt = calculateTotalDebtInCUP(customer.debts);
            const totalBoxes = calculateTotalBoxDebt(customer.boxTransactions);
            const hasDebt = totalDebt > 0 || totalBoxes > 0;

            return (
              <li 
                key={customer.id}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg flex justify-between items-center group hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <div 
                  onClick={() => onSelectCustomer(customer)}
                  className="flex-grow flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{customer.name}</p>
                    <p className={`text-sm ${hasDebt ? 'text-red-500' : 'text-green-500'}`}>
                      {hasDebt ? 'Debe' : 'Saldado'}
                    </p>
                  </div>
                  <div className="text-right">
                      {totalDebt > 0 && (
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">
                            {totalDebt.toLocaleString('en-US', { style: 'currency', currency: 'CUP' })}
                        </p>
                      )}
                      {totalBoxes > 0 && (
                        <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                            {totalBoxes.toLocaleString('en-US', { maximumFractionDigits: 2 })} Cajas
                        </p>
                      )}
                      {!hasDebt && (
                         <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          Saldado
                         </p>
                      )}
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCustomer(customer);
                  }}
                  className="ml-4 p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  title={`Eliminar a ${customer.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomerList;