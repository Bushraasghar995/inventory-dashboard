import { useState, useMemo } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { useToast } from '../hooks/useToast.js';
import Button from '../components/Button.jsx';
import Badge from '../components/Badge.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Select from '../components/Select.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import ProductFormModal from '../components/ProductFormModal.jsx';
import './Products.css';

const PAGE_SIZE = 6;

function stockStatus(p) {
  if (Number(p.stock) === 0) return { label: 'Out of Stock', color: 'red' };
  if (Number(p.stock) <= Number(p.minStock)) return { label: 'Low Stock', color: 'orange' };
  return { label: 'In Stock', color: 'green' };
}

function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'all' || p.category === category;
      const status = stockStatus(p);
      const matchStock =
        stockFilter === 'all' ||
        (stockFilter === 'in' && status.label === 'In Stock') ||
        (stockFilter === 'low' && status.label === 'Low Stock') ||
        (stockFilter === 'out' && status.label === 'Out of Stock');
      return matchSearch && matchCategory && matchStock;
    });
  }, [products, search, category, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditingProduct(null); setFormOpen(true); };
  const openEdit = (p) => { setEditingProduct(p); setFormOpen(true); };

  const handleSave = (data) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      toast.success('Product updated successfully');
    } else {
      addProduct(data);
      toast.success('Product added successfully');
    }
  };

  const handleDelete = () => {
    deleteProduct(deleteId);
    toast.success('Product deleted');
    setDeleteId(null);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAdd}>Add Product</Button>
      </div>

      <div className="filters-row">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or SKU..." />
        <Select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
          options={categories.map(c => ({ value: c, label: c === 'all' ? 'All Categories' : c }))} />
        <Select value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1); }}
          options={[
            { value: 'all', label: 'All Stock Status' },
            { value: 'in', label: 'In Stock' },
            { value: 'low', label: 'Low Stock' },
            { value: 'out', label: 'Out of Stock' },
          ]} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No products found" message="Try changing your search or filters, or add a new product." />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th><th>SKU</th><th>Category</th><th>Purchase</th>
                  <th>Sale Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(p => {
                  const status = stockStatus(p);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="prod-cell">
                          {p.image ? <img src={p.image} alt={p.name} /> : <div className="prod-thumb-placeholder">{p.name[0]}</div>}
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td>{p.sku}</td>
                      <td>{p.category}</td>
                      <td>Rs. {Number(p.purchasePrice).toLocaleString()}</td>
                      <td>Rs. {Number(p.salePrice).toLocaleString()}</td>
                      <td>{p.stock} {p.unit}</td>
                      <td><Badge color={status.color}>{status.label}</Badge></td>
                      <td>
                        <div className="row-actions">
                          <button className="btn-icon" onClick={() => setViewProduct(p)} aria-label="View"><Eye size={15} /></button>
                          <button className="btn-icon" onClick={() => openEdit(p)} aria-label="Edit"><Pencil size={15} /></button>
                          <button className="btn-icon" onClick={() => setDeleteId(p.id)} aria-label="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ProductFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} initialData={editingProduct} />

      <ConfirmModal
        isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Product" message="Are you sure you want to delete this product? This action cannot be undone."
      />

      <Modal isOpen={!!viewProduct} onClose={() => setViewProduct(null)} title="Product Details">
        {viewProduct && (
          <div className="view-product">
            {viewProduct.image && <img src={viewProduct.image} alt={viewProduct.name} className="img-preview" />}
            <p><strong>Name:</strong> {viewProduct.name}</p>
            <p><strong>SKU:</strong> {viewProduct.sku}</p>
            <p><strong>Category:</strong> {viewProduct.category}</p>
            <p><strong>Purchase Price:</strong> Rs. {Number(viewProduct.purchasePrice).toLocaleString()}</p>
            <p><strong>Sale Price:</strong> Rs. {Number(viewProduct.salePrice).toLocaleString()}</p>
            <p><strong>Current Stock:</strong> {viewProduct.stock} {viewProduct.unit}</p>
            <p><strong>Minimum Stock Level:</strong> {viewProduct.minStock} {viewProduct.unit}</p>
            {viewProduct.description && <p><strong>Description:</strong> {viewProduct.description}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
export default Products;