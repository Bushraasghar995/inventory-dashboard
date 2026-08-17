import { useState, useMemo } from 'react';
import { Plus, Eye, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp.js';
import { useToast } from '../hooks/useToast.js';
import Button from '../components/Button.jsx';
import Badge from '../components/Badge.jsx';
import SearchBar from '../components/SearchBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import CustomerFormModal from '../components/CustomerFormModal.jsx';
import './Customers.css';

function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, sales, payments } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const getCustomerStats = (customerId, openingBalance) => {
    const customerSales = sales.filter(s => s.customerId === customerId);
    const totalPurchases = customerSales.length;
    const totalSpent = customerSales.reduce((sum, s) => sum + Number(s.grandTotal || 0), 0);
    const totalPaid = payments.filter(p => p.customerId === customerId).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const outstanding = Number(openingBalance || 0) + totalSpent - totalPaid;
    return { totalPurchases, totalSpent, outstanding, customerSales };
  };

  const filtered = useMemo(() => {
    return customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  }, [customers, search]);

  const openAdd = () => { setEditingCustomer(null); setFormOpen(true); };
  const openEdit = (c) => { setEditingCustomer(c); setFormOpen(true); };
  const handleSave = (data) => {
    if (editingCustomer) { updateCustomer(editingCustomer.id, data); toast.success('Customer updated successfully'); }
    else { addCustomer(data); toast.success('Customer added successfully'); }
  };
  const handleDelete = () => { deleteCustomer(deleteId); toast.success('Customer deleted'); setDeleteId(null); };

  const viewStats = viewCustomer ? getCustomerStats(viewCustomer.id, viewCustomer.openingBalance) : null;

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Customers</h1><p>Manage your customers</p></div>
        <Button variant="primary" icon={Plus} onClick={openAdd}>Add Customer</Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or phone..." />

      {filtered.length === 0 ? (
        <EmptyState title="No customers found" message="Try a different search, or add a new customer." />
      ) : (
        <div className="table-wrap" style={{ marginTop: '18px' }}>
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>Purchases</th><th>Total Spent</th><th>Outstanding</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(c => {
                const stats = getCustomerStats(c.id, c.openingBalance);
                return (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.phone}</td>
                    <td>{stats.totalPurchases}</td>
                    <td>Rs. {stats.totalSpent.toLocaleString()}</td>
                    <td><Badge color={stats.outstanding > 0 ? 'red' : 'green'}>Rs. {stats.outstanding.toLocaleString()}</Badge></td>
                    <td>
                      <div className="row-actions">
                        <button className="btn-icon" onClick={() => setViewCustomer(c)} aria-label="View"><Eye size={15} /></button>
                        <button className="btn-icon" onClick={() => openEdit(c)} aria-label="Edit"><Pencil size={15} /></button>
                        <button className="btn-icon" onClick={() => navigate(`/ledger?customer=${c.id}`)} aria-label="Ledger"><BookOpen size={15} /></button>
                        <button className="btn-icon" onClick={() => setDeleteId(c.id)} aria-label="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CustomerFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} initialData={editingCustomer} />
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Customer" message="Are you sure you want to delete this customer?" />

      <Modal isOpen={!!viewCustomer} onClose={() => setViewCustomer(null)} title="Customer Details" size="lg">
        {viewCustomer && viewStats && (
          <div className="view-customer">
            <p><strong>Name:</strong> {viewCustomer.name}</p>
            <p><strong>Phone:</strong> {viewCustomer.phone}</p>
            {viewCustomer.email && <p><strong>Email:</strong> {viewCustomer.email}</p>}
            {viewCustomer.address && <p><strong>Address:</strong> {viewCustomer.address}</p>}
            <p><strong>Credit Limit:</strong> Rs. {Number(viewCustomer.creditLimit).toLocaleString()}</p>
            <p><strong>Total Purchases:</strong> {viewStats.totalPurchases}</p>
            <p><strong>Total Amount Spent:</strong> Rs. {viewStats.totalSpent.toLocaleString()}</p>
            <p><strong>Outstanding Balance:</strong> Rs. {viewStats.outstanding.toLocaleString()}</p>
            <h4 style={{ marginTop: '18px', marginBottom: '10px', fontSize: '15px' }}>Purchase History</h4>
            {viewStats.customerSales.length === 0 ? (
              <EmptyState title="No purchases yet" message="This customer hasn't made any purchases." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Invoice</th><th>Amount</th><th>Date</th></tr></thead>
                  <tbody>
                    {viewStats.customerSales.map(s => (
                      <tr key={s.id}><td>{s.invoiceNo}</td><td>Rs. {Number(s.grandTotal).toLocaleString()}</td><td>{new Date(s.date).toLocaleDateString()}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
export default Customers;