import { useState, useMemo } from 'react';
import { PlusCircle, MinusCircle, RefreshCw, AlertTriangle, XCircle } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import SearchBar from '../components/SearchBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StockAdjustModal from '../components/StockAdjustModal.jsx';
import './Inventory.css';

const typeMeta = {
  in: { label: 'Stock In', color: 'green', icon: PlusCircle },
  out: { label: 'Stock Out', color: 'red', icon: MinusCircle },
  adjust: { label: 'Adjusted', color: 'blue', icon: RefreshCw },
};

function Inventory() {
  const { products, stockTransactions } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [presetProduct, setPresetProduct] = useState(null);
  const [search, setSearch] = useState('');

  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const outOfStock = products.filter(p => p.stock === 0);
  const totalStock = products.reduce((s, p) => s + Number(p.stock), 0);

  const productName = (id) => products.find(p => p.id === id)?.name || 'Unknown';
  const productUnit = (id) => products.find(p => p.id === id)?.unit || '';

  const filteredHistory = useMemo(() => {
    return stockTransactions.filter(t => productName(t.productId).toLowerCase().includes(search.toLowerCase()));
  }, [stockTransactions, search, products]);

  const openModal = (productId = null) => { setPresetProduct(productId); setModalOpen(true); };

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Inventory</h1><p>Track stock in and stock out</p></div>
        <Button variant="primary" icon={PlusCircle} onClick={() => openModal(null)}>Adjust Stock</Button>
      </div>

      <div className="stat-grid inv-stat-grid">
        <Card className="stat-card">
          <div className="stat-icon stat-blue"><RefreshCw size={20} /></div>
          <div><p className="stat-label">Total Stock</p><h3 className="stat-value">{totalStock}</h3></div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon stat-orange"><AlertTriangle size={20} /></div>
          <div><p className="stat-label">Low Stock Products</p><h3 className="stat-value">{lowStock.length}</h3></div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon stat-red"><XCircle size={20} /></div>
          <div><p className="stat-label">Out of Stock</p><h3 className="stat-value">{outOfStock.length}</h3></div>
        </Card>
      </div>

      <div className="inv-grid">
        <Card>
          <h4>Low Stock Products</h4>
          {lowStock.length === 0 ? <EmptyState title="All good!" message="No products are running low." /> : (
            <ul className="stock-alert-list">
              {lowStock.map(p => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <div className="stock-alert-actions">
                    <Badge color="orange">{p.stock} {p.unit} left</Badge>
                    <button className="btn btn-outline btn-sm" onClick={() => openModal(p.id)}>Restock</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h4>Out of Stock Products</h4>
          {outOfStock.length === 0 ? <EmptyState title="Nothing out of stock" message="All products currently have stock." /> : (
            <ul className="stock-alert-list">
              {outOfStock.map(p => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <div className="stock-alert-actions">
                    <Badge color="red">Out of stock</Badge>
                    <button className="btn btn-outline btn-sm" onClick={() => openModal(p.id)}>Restock</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="page-head" style={{ marginTop: '30px' }}>
        <h1 style={{ fontSize: '18px' }}>Stock Transaction History</h1>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search by product name..." />

      {filteredHistory.length === 0 ? (
        <EmptyState title="No stock transactions yet" message="Stock movements will be recorded here." />
      ) : (
        <div className="table-wrap" style={{ marginTop: '16px' }}>
          <table>
            <thead><tr><th>Product</th><th>Type</th><th>Quantity</th><th>Note</th><th>Date</th></tr></thead>
            <tbody>
              {filteredHistory.map(t => {
                const meta = typeMeta[t.type] || typeMeta.adjust;
                const Icon = meta.icon;
                return (
                  <tr key={t.id}>
                    <td>{productName(t.productId)}</td>
                    <td><Badge color={meta.color}><Icon size={13} style={{ marginRight: 4 }} />{meta.label}</Badge></td>
                    <td>{t.type === 'adjust' ? `Set to ${t.qty}` : `${t.type === 'in' ? '+' : '-'}${t.qty}`} {productUnit(t.productId)}</td>
                    <td>{t.note || '-'}</td>
                    <td>{new Date(t.date).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <StockAdjustModal isOpen={modalOpen} onClose={() => setModalOpen(false)} defaultProductId={presetProduct} />
    </div>
  );
}
export default Inventory;