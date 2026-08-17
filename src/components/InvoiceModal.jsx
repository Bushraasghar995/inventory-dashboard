import Modal from './Modal.jsx';
import Button from './Button.jsx';

function InvoiceModal({ sale, onClose }) {
  if (!sale) return null;
  const handlePrint = () => window.print();

  return (
    <Modal isOpen={!!sale} onClose={onClose} title="Invoice" size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Back to Sales</Button><Button variant="outline" onClick={handlePrint}>Print Invoice</Button><Button variant="primary" onClick={handlePrint}>Download Invoice</Button></>}>
      <div className="invoice-box" id="invoice-print-area">
        <div className="invoice-head">
          <div><h2>Inventory & Sales System</h2><p>103-A Block, Faisal Town, Lahore</p></div>
          <div className="invoice-meta"><p><strong>Invoice #:</strong> {sale.invoiceNo}</p><p><strong>Date:</strong> {new Date(sale.date).toLocaleString()}</p></div>
        </div>
        <div className="invoice-customer">
          <p><strong>Bill To:</strong> {sale.customerName}</p>
          <p><strong>Payment Method:</strong> {sale.paymentMethod}</p>
        </div>
        <table className="invoice-table">
          <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i}><td>{item.name}</td><td>{item.qty}</td><td>Rs. {item.price.toLocaleString()}</td><td>Rs. {(item.price * item.qty).toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="invoice-totals">
          <div><span>Subtotal</span><span>Rs. {sale.subtotal.toLocaleString()}</span></div>
          <div><span>Discount</span><span>Rs. {sale.discount.toLocaleString()}</span></div>
          <div className="invoice-grand"><span>Grand Total</span><span>Rs. {sale.grandTotal.toLocaleString()}</span></div>
          <div><span>Paid Amount</span><span>Rs. {sale.paidAmount.toLocaleString()}</span></div>
          <div><span>Remaining</span><span>Rs. {sale.remainingAmount.toLocaleString()}</span></div>
        </div>
      </div>
    </Modal>
  );
}
export default InvoiceModal;