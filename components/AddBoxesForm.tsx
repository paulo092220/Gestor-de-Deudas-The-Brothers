import React, { useState } from 'react';

interface AddBoxesFormProps {
  onAddBoxes: (data: { boxes: number; notes: string }) => void;
  onClose: () => void;
}

const AddBoxesForm: React.FC<AddBoxesFormProps> = ({ onAddBoxes, onClose }) => {
  const [boxes, setBoxes] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericBoxes = parseFloat(boxes);
    if (!isNaN(numericBoxes) && numericBoxes > 0 && notes.trim()) {
      onAddBoxes({ boxes: numericBoxes, notes: notes.trim() });
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="boxes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Cantidad de Cajas
        </label>
        <input
          type="number"
          id="boxes"
          value={boxes}
          onChange={(e) => setBoxes(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-slate-900 dark:text-white"
          autoFocus
          required
          min="0.01"
          step="0.01"
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Notas de la Mercancía
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
          className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 disabled:bg-orange-300"
          disabled={!boxes || !notes.trim()}
        >
          Añadir Cajas
        </button>
      </div>
    </form>
  );
};

export default AddBoxesForm;
