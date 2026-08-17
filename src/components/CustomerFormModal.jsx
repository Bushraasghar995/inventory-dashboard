import { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import Input from './Input.jsx';
import Button from './Button.jsx';

const emptyForm = { name: '', phone: '', email: '', address: '', creditLimit: '', openingBalance: '' };

function CustomerFormModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) setForm({ ...emptyForm, ...initialData });
    else setForm(emptyForm);
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Customer name is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^[0-9+\-\s]{7,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.creditLimit !== '' && Number(form.creditLimit) < 0) errs.creditLimit = 'Cannot be negative';
    if (form.openingBalance !== '' && Number(form.openingBalance) < 0) errs.openingBalance = 'Cannot be negative';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, creditLimit: Number(form.creditLimit || 0), openingBalance: Number(form.openingBalance || 0) });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Customer' : 'Add Customer'}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit}>{initialData ? 'Save Changes' : 'Add Customer'}</Button></>}>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <Input label="Customer Name" value={form.name} onChange={e => handleChange('name', e.target.value)} error={errors.name} placeholder="e.g. Ahmed Traders" />
          <Input label="Phone" value={form.phone} onChange={e => handleChange('phone', e.target.value)} error={errors.phone} placeholder="03001234567" />
        </div>
        <div className="form-row">
          <Input label="Email (optional)" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} error={errors.email} placeholder="name@example.com" />
          <Input label="Address" value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="City / Area" />
        </div>
        <div className="form-row">
          <Input label="Credit Limit" type="number" value={form.creditLimit} onChange={e => handleChange('creditLimit', e.target.value)} error={errors.creditLimit} placeholder="0" />
          <Input label="Opening Balance" type="number" value={form.openingBalance} onChange={e => handleChange('openingBalance', e.target.value)} error={errors.openingBalance} placeholder="0" />
        </div>
      </form>
    </Modal>
  );
}
export default CustomerFormModal;