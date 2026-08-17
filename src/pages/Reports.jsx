import { useState, useMemo } from 'react';
import { Download, Printer } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import './Reports.css';

const RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
];

function getRangeDates(rangeType, customFrom, customTo) {
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
  switch (rangeType) {
    case 'today': return { from: startOfDay(now), to: endOfDay(now) };
    case 'yesterday': { const y = new Date(now); y.setDate(y.getDate() - 1); return { from: startOfDay(y), to: endOfDay(y) }; }
    case '7days': { const from = new Date(now); from.setDate(from.getDate() - 6); return { from: startOfDay(from), to: endOfDay(now) }; }
    case '30days': { const from = new Date(now); from.setDate(from.getDate() - 29); return { from: startOfDay(from), to: endOfDay(now) }; }
    case 'thisMonth': { const from = new Date(now.getFullYear(), now.getMonth(), 1); return { from: startOfDay(from), to: endOfDay(now) }; }
    case 'custom': return { from: customFrom ? startOfDay(new Date(customFrom)) : null, to: customTo ? endOfDay(new Date(customTo)) : null };
    default: return { from: null, to: null };
  }
}

function Reports() {
  const { products, sales, expenses } = useApp();
  const [rangeType, setRangeType] = useState('7days');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const { from, to } = getRangeDates(rangeType, customFrom, customTo);

  const filteredSales = useMemo(() => {
    if (!from || !to) return sales;
    return sales.filter(s => { const d = new Date(s.date); return d >= from && d <= to; });
  }, [sales, from, to]);

  const filteredExpenses = useMemo(() => {
    if (!from || !to) return expenses;
    return expenses.filter(e => { const d = new Date(e.date); return d >= from && d <= to; });
  }, [expenses, from, to]);

  const filteredInvoices = useMemo(() => {
    return filteredSales.filter(s => {
      const matchSearch = s.invoiceNo.toLowerCase().includes(invoiceSearch.toLowerCase()) || (s.customerName || '').toLowerCase().includes(invoiceSearch.toLowerCase());
      const matchPayment = paymentFilter === 'all' || s.paymentMethod === paymentFilter;
      return matchSearch && matchPayment;
    });
  }, [filteredSales, invoiceSearch, paymentFilter]);

  const salesReport = useMemo(() => {
    const totalSales = filteredSales.reduce((s, x) => s + Number(x.subtotal || 0), 0);
    const numInvoices = filteredSales.length;
    const totalRevenue = filteredSales.reduce((s, x) => s + Number(x.grandTotal || 0), 0);
    const totalDiscount = filteredSales.reduce((s, x) => s + Number(x.discount || 0), 0);
    return { totalSales, numInvoices, totalRevenue, totalDiscount };
  }, [filteredSales]);

  const inventoryReport = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((s, p) => s + Number(p.stock), 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const stockValue = products.reduce((s, p) => s + Number(p.stock) * Number(p.purchasePrice), 0);
    return { totalProducts, totalStock, lowStock, outOfStock, stockValue };
  }, [products]);

  const profitReport = useMemo(() => {
    const grossProfit = filteredSales.reduce((sum, s) => {
      const saleProfit = (s.items || []).reduce((isum, item) => {
        const product = products.find(p => p.id === item.productId);
        const cost = product ? product.purchasePrice * item.qty : 0;
        return isum + (item.price * item.qty - cost);
      }, 0);
      return sum + saleProfit;
    }, 0);
    const totalExpenses = filteredExpenses.reduce((s, e) => s + Number(e.amount), 0);
    return { grossProfit, totalExpenses, netProfit: grossProfit - totalExpenses };
  }, [filteredSales, filteredExpenses, products]);

  const handleExportCSV = () => {
    const rows = [
      ['Invoice No', 'Customer', 'Subtotal', 'Discount', 'Grand Total', 'Payment Method', 'Date'],
      ...filteredInvoices.map(s => [s.invoiceNo, s.customerName, s.subtotal, s.discount, s.grandTotal, s.paymentMethod, new Date(s.date).toLocaleDateString()]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `sales-report-${rangeType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Reports</h1><p>Sales, inventory & profit reports</p></div>
        <div className="report-actions">
          <Button variant="outline" icon={Download} onClick={handleExportCSV}>Export CSV</Button>
          <Button variant="outline" icon={Printer} onClick={handlePrint}>Print Report</Button>
        </div>
      </div>

      <div className="range-tabs">
        {RANGES.map(r => (
          <button key={r.value} className={`range-tab ${rangeType === r.value ? 'active' : ''}`} onClick={() => setRangeType(r.value)}>{r.label}</button>
        ))}
      </div>

      {rangeType === 'custom' && (
        <div className="filters-row">
          <Input label="From" type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
          <Input label="To" type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} />
        </div>
      )}

      <div id="report-print-area">
        <h3 className="report-section-title">Sales Report</h3>
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <Card className="report-stat"><p>Total Sales</p><h3>Rs. {salesReport.totalSales.toLocaleString()}</h3></Card>
          <Card className="report-stat"><p>Number of Invoices</p><h3>{salesReport.numInvoices}</h3></Card>
          <Card className="report-stat"><p>Total Revenue</p><h3>Rs. {salesReport.totalRevenue.toLocaleString()}</h3></Card>
          <Card className="report-stat"><p>Total Discount</p><h3>Rs. {salesReport.totalDiscount.toLocaleString()}</h3></Card>
        </div>

        <h3 className="report-section-title">Inventory Report</h3>
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
          <Card className="report-stat"><p>Total Products</p><h3>{inventoryReport.totalProducts}</h3></Card>
          <Card className="report-stat"><p>Total Stock</p><h3>{inventoryReport.totalStock}</h3></Card>
          <Card className="report-stat"><p>Low Stock</p><h3>{inventoryReport.lowStock}</h3></Card>
          <Card className="report-stat"><p>Out of Stock</p><h3>{inventoryReport.outOfStock}</h3></Card>
          <Card className="report-stat"><p>Stock Value</p><h3>Rs. {inventoryReport.stockValue.toLocaleString()}</h3></Card>
        </div>

        <h3 className="report-section-title">Profit Report</h3>
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          <Card className="report-stat"><p>Gross Profit</p><h3>Rs. {profitReport.grossProfit.toLocaleString()}</h3></Card>
          <Card className="report-stat"><p>Total Expenses</p><h3>Rs. {profitReport.totalExpenses.toLocaleString()}</h3></Card>
          <Card className="report-stat highlight"><p>Net Profit</p><h3>Rs. {profitReport.netProfit.toLocaleString()}</h3></Card>
        </div>
      </div>

      <h3 className="report-section-title">Invoices</h3>
      <div className="filters-row">
        <SearchBar value={invoiceSearch} onChange={setInvoiceSearch} placeholder="Search by invoice # or customer..." />
        <Select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
          options={[{ value: 'all', label: 'All Payment Methods' }, { value: 'Cash', label: 'Cash' }, { value: 'Card', label: 'Card' }, { value: 'Bank Transfer', label: 'Bank Transfer' }, { value: 'Credit', label: 'Credit' }]} />
      </div>

      {filteredInvoices.length === 0 ? (
        <EmptyState title="No invoices found" message="Try a different search, filter, or date range." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Date</th></tr></thead>
            <tbody>
              {filteredInvoices.map(s => (
                <tr key={s.id}>
                  <td>{s.invoiceNo}</td>
                  <td>{s.customerName}</td>
                  <td>Rs. {Number(s.grandTotal).toLocaleString()}</td>
                  <td><Badge color="blue">{s.paymentMethod}</Badge></td>
                  <td>{new Date(s.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export default Reports;