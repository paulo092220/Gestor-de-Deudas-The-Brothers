import React, { useState } from 'react';
import { Customer, Debt, BoxTransaction, Currency, ExchangeRates } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import CustomerList from './components/CustomerList';
import CustomerDetails from './components/CustomerDetails';
import Modal from './components/Modal';
import AddCustomerForm from './components/AddCustomerForm';
import AddDebtForm from './components/AddDebtForm';
import AddPaymentForm from './components/AddPaymentForm';
import AddBoxesForm from './components/AddBoxesForm';
import PayBoxesForm from './components/PayBoxesForm';
import BackupRestoreManager from './components/BackupRestoreManager';
import ExchangeRateManager from './components/ExchangeRateManager';
import { calculateTotalDebtInCUP, calculateTotalBoxDebt, getPaymentsForDebt } from './utils/debtCalculator';

const App: React.FC = () => {
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [exchangeRates, setExchangeRates] = useLocalStorage<ExchangeRates>('exchangeRates', {
    [Currency.USD]: 360,
    [Currency.EUR]: 370,
    [Currency.ZELLE]: 365,
    [Currency.USDT]: 365,
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [isAddCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [isAddDebtModalOpen, setAddDebtModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setAddPaymentModalOpen] = useState(false);
  const [isAddBoxesModalOpen, setAddBoxesModalOpen] = useState(false);
  const [isPayBoxesModalOpen, setPayBoxesModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [isDeleteCustomerModalOpen, setDeleteCustomerModalOpen] = useState(false);
  const [isResetConfirmModalOpen, setResetConfirmModalOpen] = useState(false);
  
  const [transactionToDelete, setTransactionToDelete] = useState<{customerId: string, transactionId: string} | null>(null);
  const [boxDebtToPay, setBoxDebtToPay] = useState<BoxTransaction | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  const handleAddCustomer = (name: string) => {
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name,
      debts: [],
      boxTransactions: [],
    };
    setCustomers(prev => [...prev, newCustomer].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleRequestDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteCustomerModalOpen(true);
  };

  const confirmDeleteCustomer = () => {
    if (!customerToDelete) return;
    setCustomers(customers.filter(c => c.id !== customerToDelete.id));
    setDeleteCustomerModalOpen(false);
    setCustomerToDelete(null);
    if(selectedCustomer?.id === customerToDelete.id) {
        setSelectedCustomer(null);
    }
  };

  const cancelDeleteCustomer = () => {
    setDeleteCustomerModalOpen(false);
    setCustomerToDelete(null);
  };

  const handleAddDebt = (debtData: Omit<Debt, 'id' | 'date'>) => {
    if (!selectedCustomer) return;

    const newDebt: Debt = {
      ...debtData,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };

    const updatedCustomers = customers.map(c => 
      c.id === selectedCustomer.id 
        ? { ...c, debts: [...c.debts, newDebt] }
        : c
    );
    setCustomers(updatedCustomers);
    setSelectedCustomer(updatedCustomers.find(c => c.id === selectedCustomer.id) || null);
  };

  const handleAddPayment = (paymentData: Omit<Debt, 'id' | 'date'>) => {
    if (!selectedCustomer) return;

    const newPayment: Debt = {
      ...paymentData,
      amount: -Math.abs(paymentData.amount),
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };

    const updatedCustomers = customers.map(c =>
      c.id === selectedCustomer.id
        ? { ...c, debts: [...c.debts, newPayment] }
        : c
    );
    setCustomers(updatedCustomers);
    setSelectedCustomer(updatedCustomers.find(c => c.id === selectedCustomer.id) || null);
  };

  const handleAddBoxes = (boxData: { boxes: number; notes: string }) => {
    if (!selectedCustomer) return;

    const newBoxTransaction: BoxTransaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: 'ADD',
      boxes: boxData.boxes,
      notes: boxData.notes,
    };

    const updatedCustomers = customers.map(c =>
      c.id === selectedCustomer.id
        ? { ...c, boxTransactions: [...(c.boxTransactions || []), newBoxTransaction] }
        : c
    );
    setCustomers(updatedCustomers);
    setSelectedCustomer(updatedCustomers.find(c => c.id === selectedCustomer.id) || null);
  };

  const handlePayBoxes = (paymentData: {
    debtId: string;
    paymentAmount: number;
    paymentCurrency: Currency;
    paymentRateToCUP: number;
    boxValueInCUP: number;
    notes: string;
  }) => {
    if (!selectedCustomer) return;

    const totalPaymentInCUP = paymentData.paymentAmount * paymentData.paymentRateToCUP;
    const boxesPaid = totalPaymentInCUP / paymentData.boxValueInCUP;

    const newBoxPayment: BoxTransaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: 'PAY',
      boxes: boxesPaid,
      notes: paymentData.notes,
      paymentAmount: paymentData.paymentAmount,
      paymentCurrency: paymentData.paymentCurrency,
      paymentRateToCUP: paymentData.paymentRateToCUP,
      boxValueInCUP: paymentData.boxValueInCUP,
      debtId: paymentData.debtId,
    };

    const updatedCustomers = customers.map(c =>
      c.id === selectedCustomer.id
        ? { ...c, boxTransactions: [...(c.boxTransactions || []), newBoxPayment] }
        : c
    );
    setCustomers(updatedCustomers);
    setSelectedCustomer(updatedCustomers.find(c => c.id === selectedCustomer.id) || null);
  };
  
  const handleRequestDeleteTransaction = (customerId: string, transactionId: string) => {
    setTransactionToDelete({ customerId, transactionId });
    setDeleteConfirmModalOpen(true);
  };

  const confirmDeleteTransaction = () => {
    if (!transactionToDelete) return;
    const { customerId, transactionId } = transactionToDelete;
  
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
  
    // Find the transaction to be deleted
    const transaction = 
      customer.debts.find(d => d.id === transactionId) || 
      (customer.boxTransactions || []).find(b => b.id === transactionId);

    // Safety check for box debt with existing payments
    if (transaction && 'type' in transaction && transaction.type === 'ADD') {
      const payments = getPaymentsForDebt(transaction.id, customer.boxTransactions || []);
      if (payments.length > 0) {
        alert('No se puede eliminar una deuda de cajas que ya tiene pagos. Por favor, elimine los pagos primero.');
        cancelDeleteTransaction();
        return;
      }
    }
  
    const updatedCustomers = customers.map(c => {
      if (c.id === customerId) {
        const newDebts = c.debts.filter(d => d.id !== transactionId);
        const newBoxTransactions = (c.boxTransactions || []).filter(b => b.id !== transactionId);
        return { ...c, debts: newDebts, boxTransactions: newBoxTransactions };
      }
      return c;
    });
  
    setCustomers(updatedCustomers);
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(updatedCustomers.find(c => c.id === customerId) || null);
    }
    
    setDeleteConfirmModalOpen(false);
    setTransactionToDelete(null);
  };

  const cancelDeleteTransaction = () => {
    setDeleteConfirmModalOpen(false);
    setTransactionToDelete(null);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
  };

  const handleOpenPayBoxesModal = (debt: BoxTransaction) => {
    setBoxDebtToPay(debt);
    setPayBoxesModalOpen(true);
  };

  const handleRestore = (backupData: { customers: Customer[]; exchangeRates?: ExchangeRates }) => {
    if (backupData && Array.isArray(backupData.customers)) {
        setCustomers(backupData.customers);
        if (backupData.exchangeRates) {
            setExchangeRates(backupData.exchangeRates);
        }
        alert('Restauración completada con éxito.');
    } else {
        alert('Archivo de copia de seguridad inválido o corrupto.');
    }
  };

  const handleRequestResetApp = () => {
    setResetConfirmModalOpen(true);
  };

  const confirmResetApp = () => {
    setCustomers([]);
    setSelectedCustomer(null);
    setResetConfirmModalOpen(false);
  };

  const cancelResetApp = () => {
    setResetConfirmModalOpen(false);
  };

  const totalOverallDebt = customers.reduce((total, customer) => {
    return total + calculateTotalDebtInCUP(customer.debts);
  }, 0);

  const totalOverallBoxDebt = customers.reduce((total, customer) => {
    return total + calculateTotalBoxDebt(customer.boxTransactions);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">Gestor de Deudas</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Lleva un control de las deudas de tus clientes y gestiona los pagos fácilmente.</p>
      </header>
      
      <main className="max-w-4xl mx-auto">
        {!selectedCustomer && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Deuda Total General (CUP)</h2>
                    <p className={`text-3xl font-bold ${totalOverallDebt > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {totalOverallDebt.toLocaleString('en-US', { style: 'currency', currency: 'CUP' })}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Deuda Total General (Cajas)</h2>
                    <p className={`text-3xl font-bold ${totalOverallBoxDebt > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                        {totalOverallBoxDebt.toLocaleString('en-US', { maximumFractionDigits: 2 })} Cajas
                    </p>
                </div>
            </div>
            <ExchangeRateManager rates={exchangeRates} onUpdateRates={setExchangeRates} />
            <BackupRestoreManager 
              customers={customers} 
              exchangeRates={exchangeRates}
              onRestore={handleRestore} 
              onResetApp={handleRequestResetApp} 
            />
            <CustomerList 
              customers={customers} 
              onSelectCustomer={handleSelectCustomer} 
              onAddCustomer={() => setAddCustomerModalOpen(true)}
              onDeleteCustomer={handleRequestDeleteCustomer}
            />
          </div>
        )}

        {selectedCustomer && (
          <CustomerDetails 
            customer={selectedCustomer} 
            onBack={handleBackToList}
            onAddDebt={() => setAddDebtModalOpen(true)}
            onAddPayment={() => setAddPaymentModalOpen(true)}
            onAddBoxes={() => setAddBoxesModalOpen(true)}
            onPaySpecificDebt={handleOpenPayBoxesModal}
            onDeleteTransaction={handleRequestDeleteTransaction}
          />
        )}
      </main>

      <Modal 
        isOpen={isAddCustomerModalOpen} 
        onClose={() => setAddCustomerModalOpen(false)} 
        title="Añadir Nuevo Cliente"
      >
        <AddCustomerForm 
          onAddCustomer={handleAddCustomer}
          onClose={() => setAddCustomerModalOpen(false)} 
        />
      </Modal>

      <Modal 
        isOpen={isAddDebtModalOpen} 
        onClose={() => setAddDebtModalOpen(false)} 
        title={`Añadir Deuda para ${selectedCustomer?.name}`}
      >
        <AddDebtForm 
          onAddDebt={handleAddDebt}
          onClose={() => setAddDebtModalOpen(false)}
          exchangeRates={exchangeRates}
        />
      </Modal>

      <Modal 
        isOpen={isAddPaymentModalOpen} 
        onClose={() => setAddPaymentModalOpen(false)} 
        title={`Registrar Pago para ${selectedCustomer?.name}`}
      >
        <AddPaymentForm
          onAddPayment={handleAddPayment}
          onClose={() => setAddPaymentModalOpen(false)}
          exchangeRates={exchangeRates}
        />
      </Modal>

      <Modal 
        isOpen={isAddBoxesModalOpen} 
        onClose={() => setAddBoxesModalOpen(false)} 
        title={`Añadir Cajas para ${selectedCustomer?.name}`}
      >
        <AddBoxesForm
          onAddBoxes={handleAddBoxes}
          onClose={() => setAddBoxesModalOpen(false)}
        />
      </Modal>

      <Modal 
        isOpen={isPayBoxesModalOpen} 
        onClose={() => {
          setPayBoxesModalOpen(false);
          setBoxDebtToPay(null);
        }} 
        title={`Pagar Cajas para ${selectedCustomer?.name}`}
      >
        <PayBoxesForm
          customer={selectedCustomer}
          debtToPay={boxDebtToPay}
          onPayBoxes={handlePayBoxes}
          onClose={() => {
            setPayBoxesModalOpen(false);
            setBoxDebtToPay(null);
          }}
          exchangeRates={exchangeRates}
        />
      </Modal>

      <Modal 
        isOpen={isDeleteConfirmModalOpen} 
        onClose={cancelDeleteTransaction} 
        title="Confirmar Eliminación"
      >
        <div>
          <p className="text-slate-600 dark:text-slate-300">¿Estás seguro de que quieres eliminar esta transacción? Esta acción no se puede deshacer.</p>
          <div className="flex justify-end space-x-3 pt-4 mt-2">
            <button 
              type="button"
              onClick={cancelDeleteTransaction}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-600 rounded-md hover:bg-slate-200 dark:hover:bg-slate-500"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={confirmDeleteTransaction}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isDeleteCustomerModalOpen} 
        onClose={cancelDeleteCustomer} 
        title="Confirmar Eliminación de Cliente"
      >
        <div>
          <p className="text-slate-600 dark:text-slate-300">
            ¿Estás seguro de que quieres eliminar a <strong className="dark:text-white">{customerToDelete?.name}</strong>? Toda su información, deudas y transacciones se perderán permanentemente.
          </p>
          <div className="flex justify-end space-x-3 pt-4 mt-2">
            <button 
              type="button"
              onClick={cancelDeleteCustomer}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-600 rounded-md hover:bg-slate-200 dark:hover:bg-slate-500"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={confirmDeleteCustomer}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Eliminar Cliente
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isResetConfirmModalOpen} 
        onClose={cancelResetApp} 
        title="Confirmar Restablecimiento"
      >
        <div>
          <p className="text-slate-600 dark:text-slate-300">
            ¿Estás seguro de que quieres restablecer la aplicación? <strong className="text-red-500 dark:text-red-400">TODOS los datos se eliminarán permanentemente.</strong> Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3 pt-4 mt-2">
            <button 
              type="button"
              onClick={cancelResetApp}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-600 rounded-md hover:bg-slate-200 dark:hover:bg-slate-500"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={confirmResetApp}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Sí, Restablecer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;