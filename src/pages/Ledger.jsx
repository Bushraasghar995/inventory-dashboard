import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { useToast } from '../hooks/useToast.js';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Select from '../components/Select.jsx';
import Input from '../components/Input.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';

function Ledger() {
  const { customers, sales, payments, addPayment } = useApp();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('customer');

  const [customerId, setCustomerId] = useState(preselected || (customers[0]?.id || ''));
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [payError, setPayError] = useState('');

  const customer = customers.find(c => c.id === customerId);
  const customerSales = sales.filter(s => s.customerId === customerId);
  const customerPayments = payments.filter(p => p.customerId === customerId);

  const transactions = useMemo(() => {
    const txns = [
      ...customerSales.map(s => ({ id: s.id, type: 'invoice', label: `Invoice #${s.invoiceNo}`, amount: Number(s.grandTotal), date: s.date })),
      ...customerPayments.map(p => ({ id: p.id, type: 'payment', label: `Payment (${p.method})`, amount: -Number(p.amount), date: p.date })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    let running = Number(customer?.openingBalance || 0);
    const withBalance = txns.map(t => { running += t.amount; return { ...t, balance: running }; });

    return withBalance.filter(t => {
      if (dateFrom && new Date(t.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(t.date) > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    }).reverse();
  }, [customerSales, customerPayments, customer, dateFrom, dateTo]);

  const totalPurchases = customerSales.reduce((sum, s) => sum + Number(s.grandTotal), 0);
  const totalPayments = customerPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remainingBalance = Number(customer?.openingBalance || 0) + totalPurchases - totalPayments;

  const handleAddPayment = (e) => {
    e.preventDefault();
    const amt = Number(payAmount);
    if (!amt || amt <= 0) { setPayError('Enter a valid payment amount'); return; }
    addPayment({ customerId, amount: amt, method: payMethod });
    toast.success('Payment recorded successfully');
    setPayAmount(''); setPayError(''); setPayModalOpen(false);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Credit / Ledger</h1><p>Customer balances and payments</p></div>
        <Button variant="primary" icon={Plus} onClick={() => setPayModalOpen(true)} disabled={!customerId}>Add Payment</Button>
      </div>

      <div className="filters-row">
        <Select label="Customer" value={customerId} onChange={e => setCustomerId(e.target.value)}
          options={customers.map(c => ({ value: c.id, label: c.name }))} />
        <Input label="From" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <Input label="To" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
      </div>

      {!customer ? (
        <EmptyState title="No customer selected" message="Add a customer first from the Customers page." />
      ) : (
        <>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginTop: '10px' }}>
            <Card className="stat-card"><div><p className="stat-label">Previous Balance</p><h3 className="stat-value">Rs. {Number(customer.openingBalance).toLocaleString()}</h3></div></Card>
            <Card className="stat-card"><div><p className="stat-label">Total Purchases</p><h3 className="stat-value">Rs. {totalPurchases.toLocaleString()}</h3></div></Card>
            <Card className="stat-card"><div><p className="stat-label">Total Payments</p><h3 className="stat-value">Rs. {totalPayments.toLocaleString()}</h3></div></Card>
            <Card className="stat-card"><div><p className="stat-label">Remaining Balance</p><h3 className="stat-value">Rs. {remainingBalance.toLocaleString()}</h3></div></Card>
          </div>

          <div className="table-wrap" style={{ marginTop: '20px' }}>
            {transactions.length === 0 ? (
              <EmptyState title="No transactions" message="No invoices or payments found for this customer." />
            ) : (
              <table>
                <thead><tr><th>Transaction</th><th>Amount</th><th>Balance</th><th>Date</th></tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.type + t.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {t.type === 'invoice' ? <ArrowUpCircle size={15} color="#dc2626" /> : <ArrowDownCircle size={15} color="#16a34a" />}
                        {t.label}
                      </td>
                      <td><Badge color={t.amount >= 0 ? 'red' : 'green'}>{t.amount >= 0 ? '+' : ''}{t.amount.toLocaleString()}</Badge></td>
                      <td>Rs. {t.balance.toLocaleString()}</td>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <Modal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} title="Add Payment"
        footer={<><Button variant="outline" onClick={() => setPayModalOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleAddPayment}>Save Payment</Button></>}>
        <form onSubmit={handleAddPayment}>
          <Input label="Amount" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0" />
          <Select label="Payment Method" value={payMethod} onChange={e => setPayMethod(e.target.value)}
            options={[{ value: 'Cash', label: 'Cash' }, { value: 'Card', label: 'Card' }, { value: 'Bank Transfer', label: 'Bank Transfer' }]} />
          {payError && <p className="form-error">{payError}</p>}
        </form>
      </Modal>
    </div>
  );
}
export default Ledger;