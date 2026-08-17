import { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import Input from './Input.jsx';
import Select from './Select.jsx';
import Button from './Button.jsx';

const CATEGORIES = ['Electricity', 'Rent', 'Transport', 'Salaries', 'Maintenance', 'Other'];
const emptyForm = { category: 'Electricity', amount: '', date: '', description: '' };

function ExpenseFormModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({ ...emptyForm, ...initialData, date: initialData.date ? initialData.date.slice(0, 10) : '' });
    } else {
      setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    const errs = {};
    if (!form.category) errs.category = 'Category is required';
    if (form.amount === '' || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, amount: Number(form.amount), date: new Date(form.date).toISOString() });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Expense' : 'Add Expense'}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit}>{initialData ? 'Save Changes' : 'Add Expense'}</Button></>}>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <Select label="Category" value={form.category} onChange={e => handleChange('category', e.target.value)}
            options={CATEGORIES.map(c => ({ value: c, label: c }))} error={errors.category} />
          <Input label="Amount" type="number" value={form.amount} onChange={e => handleChange('amount', e.target.value)} error={errors.amount} placeholder="0" />
        </div>
        <Input label="Date" type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} error={errors.date} />
        <div className="form-group">
          <label>Description (optional)</label>
          <textarea rows="3" value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="e.g. Monthly electricity bill"></textarea>
        </div>
      </form>
    </Modal>
  );
}
export default ExpenseFormModal;