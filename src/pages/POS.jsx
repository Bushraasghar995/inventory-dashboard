import { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { useToast } from '../hooks/useToast.js';
import Select from '../components/Select.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import InvoiceModal from '../components/InvoiceModal.jsx';
import './POS.css';

function POS() {
  const { products, customers, addSale } = useApp();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [completedSale, setCompletedSale] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.stock > 0 &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())));
  }, [products, search]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.qty >= product.stock) { toast.error('Cannot add more than available stock'); return prev; }
        return prev.map(item => item.productId === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.salePrice, qty: 1, unit: product.unit, maxStock: product.stock }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.productId !== productId) return item;
      const newQty = item.qty + delta;
      if (newQty < 1) return item;
      if (newQty > item.maxStock) { toast.error('Not enough stock available'); return item; }
      return { ...item, qty: newQty };
    }));
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(item => item.productId !== productId));

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = Number(discount) || 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleCompleteSale = () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    const customer = customers.find(c => c.id === customerId);
    const saleData = {
      items: cart.map(item => ({ productId: item.productId, name: item.name, price: item.price, qty: item.qty })),
      subtotal, discount: discountAmount, grandTotal,
      customerId: customerId || null, customerName: customer ? customer.name : 'Walk-in Customer',
      paymentMethod,
      paidAmount: paymentMethod === 'Credit' ? 0 : grandTotal,
      remainingAmount: paymentMethod === 'Credit' ? grandTotal : 0,
    };
    const newSale = addSale(saleData);
    toast.success('Sale completed successfully');
    setCompletedSale(newSale);
    setCart([]); setDiscount(0); setCustomerId(''); setPaymentMethod('Cash');
  };

  return (
    <div className="page pos-page">
      <div className="page-head"><div><h1>Point of Sale</h1><p>Create a new sale</p></div></div>

      <div className="pos-layout">
        <div className="pos-products">
          <div className="searchbar pos-search">
            <Search size={16} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products by name or SKU..." />
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState title="No products found" message="Try a different search, or check product stock." />
          ) : (
            <div className="pos-product-grid">
              {filteredProducts.map(p => (
                <button key={p.id} className="pos-product-card" onClick={() => addToCart(p)}>
                  <div className="pos-prod-thumb">{p.image ? <img src={p.image} alt={p.name} /> : p.name[0]}</div>
                  <p className="pos-prod-name">{p.name}</p>
                  <p className="pos-prod-price">Rs. {Number(p.salePrice).toLocaleString()}</p>
                  <p className="pos-prod-stock">{p.stock} {p.unit} available</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pos-cart">
          <h4><ShoppingCart size={17} /> Cart ({cart.length})</h4>

          {cart.length === 0 ? (
            <EmptyState title="Cart is empty" message="Click a product to add it here." />
          ) : (
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.productId} className="cart-item">
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">Rs. {item.price.toLocaleString()} / {item.unit}</p>
                  </div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateQty(item.productId, -1)}><Minus size={13} /></button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, 1)}><Plus size={13} /></button>
                  </div>
                  <p className="cart-item-total">Rs. {(item.price * item.qty).toLocaleString()}</p>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.productId)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="cart-summary">
            <div className="cart-row"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
            <div className="cart-row">
              <span>Discount</span>
              <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} className="discount-input" placeholder="0" />
            </div>
            <div className="cart-row cart-total"><span>Grand Total</span><span>Rs. {grandTotal.toLocaleString()}</span></div>
          </div>

          <Select label="Customer" value={customerId} onChange={e => setCustomerId(e.target.value)}
            options={[{ value: '', label: 'Walk-in Customer' }, ...customers.map(c => ({ value: c.id, label: c.name }))]} />

          <Select label="Payment Method" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
            options={[{ value: 'Cash', label: 'Cash' }, { value: 'Card', label: 'Card' }, { value: 'Bank Transfer', label: 'Bank Transfer' }, { value: 'Credit', label: 'Credit' }]} />

          <Button variant="primary" className="btn-block" onClick={handleCompleteSale} disabled={cart.length === 0}>Complete Sale</Button>
        </div>
      </div>

      <InvoiceModal sale={completedSale} onClose={() => setCompletedSale(null)} />
    </div>
  );
}
export default POS;