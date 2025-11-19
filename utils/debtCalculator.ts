
import { Debt, BoxTransaction } from '../types';

export const calculateTotalDebtInCUP = (debts: Debt[]): number => {
  return debts.reduce((total, debt) => {
    return total + debt.amount * debt.rateToCUP;
  }, 0);
};

export const calculateTotalBoxDebt = (transactions: BoxTransaction[]): number => {
  if (!transactions) return 0;
  return transactions.reduce((total, transaction) => {
    if (transaction.type === 'ADD') {
      return total + transaction.boxes;
    }
    if (transaction.type === 'PAY') {
      return total - transaction.boxes;
    }
    return total;
  }, 0);
};

export const getBoxDebts = (transactions: BoxTransaction[]): BoxTransaction[] => {
    if (!transactions) return [];
    return transactions.filter(t => t.type === 'ADD')
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getPaymentsForDebt = (debtId: string, allTransactions: BoxTransaction[]): BoxTransaction[] => {
    if (!allTransactions) return [];
    return allTransactions.filter(t => t.type === 'PAY' && t.debtId === debtId);
};

export const calculatePaidBoxesForDebt = (debtId: string, allTransactions: BoxTransaction[]): number => {
    const payments = getPaymentsForDebt(debtId, allTransactions);
    return payments.reduce((total, p) => total + p.boxes, 0);
};