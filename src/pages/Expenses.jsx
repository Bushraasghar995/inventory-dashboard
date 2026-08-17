import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Wallet, Calendar, CalendarDays } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { useToast } from '../hooks/useToast.js';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Select from '../components/Select.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import ExpenseFormModal from '../components/ExpenseFormModal.jsx';
import './Expenses.css';

const CATEGORIES = ['Electricity', 'Rent', 'Transport', 'Salaries', 'Maintenance', 'Other'];
const CAT_COLORS = { Electricity: 'orange', Rent: 'blue', Transport: 'green', Salaries: 'red', Maintenance: 'gray', Other: 'gray' };
const PAGE_SIZE = 8;

function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useApp();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const now = new Date();
    const todaysTotal = expenses.filter(e => new Date(e.date).toDateString() === today).reduce((s, e) => s + Number(e.amount), 0);
    const monthlyTotal = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, e) => s + Number(e.amount), 0);
    const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
    return { todaysTotal, monthlyTotal, total };
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = (e.description || '').toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'all' || e.category === category;
      const matchFrom = !dateFrom || new Date(e.date) >= new Date(dateFrom);
      const matchTo = !dateTo || new Date(e.date) <= new Date(dateTo + 'T23:59:59');
      return matchSearch && matchCategory && matchFrom && matchTo;
    });
  }, [expenses, search, category, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (e) => { setEditing(e); setFormOpen(true); };

  const handleSave = (data) => {
    if (editing) { updateExpense(editing.id, data); toast.success('Expense updated successfully'); }
    else { addExpense(data); toast.success('Expense added successfully'); }
  };
  const handleDelete = () => { deleteExpense(deleteId); toast.success('Expense deleted'); setDeleteId(null); };

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Expenses</h1><p>Track your business expenses</p></div>
        <Button variant="primary" icon={Plus} onClick={openAdd}>Add Expense</Button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <Card className="stat-card">
          <div className="stat-icon stat-blue"><Calendar size={20} /></div>
          <div><p className="stat-label">Today's Expenses</p><h3 className="stat-value">Rs. {stats.todaysTotal.toLocaleString()}</h3></div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon stat-orange"><CalendarDays size={20} /></div>
          <div><p className="stat-label">Monthly Expenses</p><h3 className="stat-value">Rs. {stats.monthlyTotal.toLocaleString()}</h3></div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon stat-red"><Wallet size={20} /></div>
          <div><p className="stat-label">Total Expenses</p><h3 className="stat-value">Rs. {stats.total.toLocaleString()}</h3></div>
        </Card>
      </div>

      <div className="filters-row">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by description or category..." />
        <Select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
          options={[{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]} />
        <Input_Date value={dateFrom} onChange={v => { setDateFrom(v); setPage(1); }} />
        <Input_Date value={dateTo} onChange={v => { setDateTo(v); setPage(1); }} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No expenses found" message="Try changing your filters, or add a new expense." />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Category</th><th>Description</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {paginated.map(e => (
                  <tr key={e.id}>
                    <td><Badge color={CAT_COLORS[e.category] || 'gray'}>{e.category}</Badge></td>
                    <td>{e.description || '-'}</td>
                    <td>Rs. {Number(e.amount).toLocaleString()}</td>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn-icon" onClick={() => openEdit(e)} aria-label="Edit"><Pencil size={15} /></button>
                        <button className="btn-icon" onClick={() => setDeleteId(e.id)} aria-label="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ExpenseFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} initialData={editing} />
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Expense" message="Are you sure you want to delete this expense?" />
    </div>
  );
}

function Input_Date({ value, onChange }) {
  return (
    <div className="form-group" style={{ marginBottom: 0, minWidth: '150px' }}>
      <input type="date" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

export default Expenses;