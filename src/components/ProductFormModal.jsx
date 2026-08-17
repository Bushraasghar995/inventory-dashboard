import { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import Input from './Input.jsx';
import Select from './Select.jsx';
import Button from './Button.jsx';

const UNITS = ['KG', 'Piece', 'Bag', 'Litre', 'Meter', 'Box', 'Dozen'];

const emptyForm = {
  name: '', sku: '', category: '', purchasePrice: '', salePrice: '',
  stock: '', minStock: '', unit: 'Piece', image: '', description: ''
};

function ProductFormModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) setForm({ ...emptyForm, ...initialData });
    else setForm(emptyForm);
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleChange('image', reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (!form.category.trim()) errs.category = 'Category is required';
    if (form.purchasePrice === '' || Number(form.purchasePrice) < 0) errs.purchasePrice = 'Enter a valid purchase price';
    if (form.salePrice === '' || Number(form.salePrice) <= 0) errs.salePrice = 'Enter a valid sale price';
    if (form.stock === '' || Number(form.stock) < 0) errs.stock = 'Stock cannot be negative';
    if (form.minStock === '' || Number(form.minStock) < 0) errs.minStock = 'Enter a valid minimum stock';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...form,
      purchasePrice: Number(form.purchasePrice),
      salePrice: Number(form.salePrice),
      stock: Number(form.stock),
      minStock: Number(form.minStock),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose} size="lg"
      title={initialData ? 'Edit Product' : 'Add Product'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{initialData ? 'Save Changes' : 'Add Product'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <Input label="Product Name" value={form.name} onChange={e => handleChange('name', e.target.value)} error={errors.name} placeholder="e.g. Steel Wire" />
          <Input label="SKU" value={form.sku} onChange={e => handleChange('sku', e.target.value)} error={errors.sku} placeholder="e.g. SW-001" />
        </div>
        <div className="form-row">
          <Input label="Category" value={form.category} onChange={e => handleChange('category', e.target.value)} error={errors.category} placeholder="e.g. Raw Material" />
          <Select label="Unit" value={form.unit} onChange={e => handleChange('unit', e.target.value)}
            options={UNITS.map(u => ({ value: u, label: u }))} />
        </div>
        <div className="form-row">
          <Input label="Purchase Price" type="number" step="0.01" value={form.purchasePrice} onChange={e => handleChange('purchasePrice', e.target.value)} error={errors.purchasePrice} placeholder="0.00" />
          <Input label="Sale Price" type="number" step="0.01" value={form.salePrice} onChange={e => handleChange('salePrice', e.target.value)} error={errors.salePrice} placeholder="0.00" />
        </div>
        <div className="form-row">
          <Input label="Current Stock" type="number" value={form.stock} onChange={e => handleChange('stock', e.target.value)} error={errors.stock} placeholder="0" />
          <Input label="Minimum Stock Level" type="number" value={form.minStock} onChange={e => handleChange('minStock', e.target.value)} error={errors.minStock} placeholder="0" />
        </div>
        <div className="form-group">
          <label>Product Image</label>
          <input type="file" accept="image/*" onChange={handleImage} />
          {form.image && <img src={form.image} alt="preview" className="img-preview" />}
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea rows="3" value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Optional notes about this product"></textarea>
        </div>
      </form>
    </Modal>
  );
}
export default ProductFormModal;