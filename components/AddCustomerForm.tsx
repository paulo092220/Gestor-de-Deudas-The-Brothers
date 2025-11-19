import React, { useState } from 'react';

interface AddCustomerFormProps {
  onAddCustomer: (name: string) => void;
  onClose: () => void;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ onAddCustomer, onClose }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddCustomer(name.trim());
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Nombre del Cliente
        </label>
        <input
          type="text"
          id="customerName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-slate-900 dark:text-white"
          autoFocus
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
          disabled={!name.trim()}
        >
          Añadir Cliente
        </button>
      </div>
    </form>
  );
};

export default AddCustomerForm;
