import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Package, Users } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import './Navbar.css';

function Navbar({ onMenuClick }) {
  const { products, customers, sales } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const q = query.trim().toLowerCase();
  const matchedProducts = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 4) : [];
  const matchedCustomers = q ? customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 4) : [];
  const matchedInvoices = q ? sales.filter(s => s.invoiceNo.toLowerCase().includes(q) || (s.customerName || '').toLowerCase().includes(q)).slice(0, 4) : [];
  const hasResults = matchedProducts.length || matchedCustomers.length || matchedInvoices.length;

  const goTo = (path) => { navigate(path); setQuery(''); setOpen(false); };

  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenuClick} aria-label="Open menu"><Menu size={22} /></button>

      <div className="topbar-search" ref={boxRef}>
        <Search size={17} />
        <input
          type="text" placeholder="Search products, customers, invoices..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query && setOpen(true)}
        />
        {open && q && (
          <div className="search-dropdown">
            {!hasResults && <p className="search-empty">No results for "{query}"</p>}
            {matchedProducts.length > 0 && (
              <div className="search-group">
                <p className="search-group-title">Products</p>
                {matchedProducts.map(p => (
                  <button key={p.id} className="search-result" onClick={() => goTo('/products')}>
                    <Package size={14} /> {p.name} <span>({p.sku})</span>
                  </button>
                ))}
              </div>
            )}
            {matchedCustomers.length > 0 && (
              <div className="search-group">
                <p className="search-group-title">Customers</p>
                {matchedCustomers.map(c => (
                  <button key={c.id} className="search-result" onClick={() => goTo('/customers')}>
                    <Users size={14} /> {c.name} <span>({c.phone})</span>
                  </button>
                ))}
              </div>
            )}
            {matchedInvoices.length > 0 && (
              <div className="search-group">
                <p className="search-group-title">Invoices</p>
                {matchedInvoices.map(s => (
                  <button key={s.id} className="search-result" onClick={() => goTo('/reports')}>
                    🧾 {s.invoiceNo} <span>({s.customerName})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="topbar-right">
        <button className="btn-icon" aria-label="Notifications"><Bell size={18} /></button>
        <div className="topbar-user">
          <div className="user-avatar">A</div>
          <span className="user-name">Admin</span>
        </div>
      </div>
    </header>
  );
}
export default Navbar;