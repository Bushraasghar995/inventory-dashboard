import { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import Select from './Select.jsx';
import Input from './Input.jsx';
import Button from './Button.jsx';
import { useApp } from '../hooks/useApp.js';
import { useToast } from '../hooks/useToast.js';

function StockAdjustModal({ isOpen, onClose, defaultProductId }) {
  const { products, adjustStock } = useApp();
  const toast = useToast();

  const [productId, setProductId] = useState('');
  const [type, setType] = useState('in');
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProductId(defaultProductId || (products.length > 0 ? products[0].id : ''));
      setType('in'); setQty(''); setNote(''); setError('');
    }
  }, [isOpen, defaultProductId]);

  const selectedProduct = products.find(p => p.id === productId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productId) { setError('Please select a product'); return; }
    const qtyNum = Number(qty);
    if (!qty || qtyNum < 0) { setError('Enter a valid quantity'); return; }
    if (type !== 'adjust' && qtyNum <= 0) { setError('Enter a valid positive quantity'); return; }
    if (type === 'out' && selectedProduct && qtyNum > selectedProduct.stock) {
      setError(`Cannot remove more than available stock (${selectedProduct.stock} ${selectedProduct.unit})`);
      return;
    }
    adjustStock(productId, type, qtyNum, note);
    toast.success('Stock updated successfully');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Stock"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit}>Save</Button></>}>
      <form onSubmit={handleSubmit}>
        <Select label="Product" value={productId} onChange={e => setProductId(e.target.value)}
          options={products.map(p => ({ value: p.id, label: `${p.name} (${p.stock} ${p.unit} in stock)` }))} />
        <Select label="Adjustment Type" value={type} onChange={e => setType(e.target.value)}
          options={[
            { value: 'in', label: 'Add Stock (Stock In)' },
            { value: 'out', label: 'Remove Stock (Stock Out)' },
            { value: 'adjust', label: 'Adjust Stock (Set exact value)' },
          ]} />
        <Input label={type === 'adjust' ? 'New Stock Value' : 'Quantity'} type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" />
        <div className="form-group">
          <label>Note (optional)</label>
          <textarea rows="2" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Purchased from supplier"></textarea>
        </div>
        {error && <p className="form-error">{error}</p>}
      </form>
    </Modal>
  );
}
export default StockAdjustModal;