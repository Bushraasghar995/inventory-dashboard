import { createContext, useState, useEffect } from 'react';
import { loadData, saveData, generateId, generateInvoiceNo } from '../utils/storage.js';
import {
  seedProducts, seedCustomers, seedSales,
  seedExpenses, seedStockTransactions, seedPayments
} from '../data/seedData.js';

export const AppContext = createContext(null);

const KEYS = {
  products: 'inv_products',
  customers: 'inv_customers',
  sales: 'inv_sales',
  expenses: 'inv_expenses',
  stockTransactions: 'inv_stockTransactions',
  payments: 'inv_payments',
};

export function AppProvider({ children }) {
  const [products, setProducts] = useState(() => loadData(KEYS.products, seedProducts));
  const [customers, setCustomers] = useState(() => loadData(KEYS.customers, seedCustomers));
  const [sales, setSales] = useState(() => loadData(KEYS.sales, seedSales));
  const [expenses, setExpenses] = useState(() => loadData(KEYS.expenses, seedExpenses));
  const [stockTransactions, setStockTransactions] = useState(() => loadData(KEYS.stockTransactions, seedStockTransactions));
  const [payments, setPayments] = useState(() => loadData(KEYS.payments, seedPayments));

  // Persist every entity whenever it changes
  useEffect(() => saveData(KEYS.products, products), [products]);
  useEffect(() => saveData(KEYS.customers, customers), [customers]);
  useEffect(() => saveData(KEYS.sales, sales), [sales]);
  useEffect(() => saveData(KEYS.expenses, expenses), [expenses]);
  useEffect(() => saveData(KEYS.stockTransactions, stockTransactions), [stockTransactions]);
  useEffect(() => saveData(KEYS.payments, payments), [payments]);

  /* ---------------- PRODUCTS ---------------- */
  const addProduct = (product) => {
    setProducts(prev => [...prev, { ...product, id: generateId('prod') }]);
  };
  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };
  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  /* ---------------- CUSTOMERS ---------------- */
  const addCustomer = (customer) => {
    setCustomers(prev => [...prev, { ...customer, id: generateId('cust') }]);
  };
  const updateCustomer = (id, updates) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };
  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  /* ---------------- STOCK ---------------- */
  const adjustStock = (productId, type, qty, note = '') => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const delta = type === 'in' ? qty : type === 'out' ? -qty : qty;
      const newStock = type === 'adjust' ? qty : Math.max(0, p.stock + delta);
      return { ...p, stock: newStock };
    }));
    setStockTransactions(prev => [
      { id: generateId('stx'), productId, type, qty, note, date: new Date().toISOString() },
      ...prev
    ]);
  };

  /* ---------------- SALES / POS ---------------- */
  const addSale = (saleData) => {
    const invoiceNo = generateInvoiceNo(sales.length);
    const newSale = { ...saleData, id: generateId('sale'), invoiceNo, date: new Date().toISOString() };
    setSales(prev => [newSale, ...prev]);

    // decrease stock for each item sold
    saleData.items.forEach(item => {
      adjustStock(item.productId, 'out', item.qty, `Sale ${invoiceNo}`);
    });

    return newSale;
  };

  /* ---------------- EXPENSES ---------------- */
  const addExpense = (expense) => {
    setExpenses(prev => [{ ...expense, id: generateId('exp'), date: expense.date || new Date().toISOString() }, ...prev]);
  };
  const updateExpense = (id, updates) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };
  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  /* ---------------- LEDGER / PAYMENTS ---------------- */
  const addPayment = (payment) => {
    setPayments(prev => [{ ...payment, id: generateId('pay'), date: payment.date || new Date().toISOString() }, ...prev]);
  };

  const value = {
    products, addProduct, updateProduct, deleteProduct,
    customers, addCustomer, updateCustomer, deleteCustomer,
    stockTransactions, adjustStock,
    sales, addSale,
    expenses, addExpense, updateExpense, deleteExpense,
    payments, addPayment,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}