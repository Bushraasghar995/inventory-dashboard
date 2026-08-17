// Sample starting data — so the app isn't empty on first load

export const seedProducts = [
  {
    id: 'p1', name: 'Steel Wire', sku: 'SW-001', category: 'Raw Material',
    purchasePrice: 150, salePrice: 200, stock: 380, minStock: 50, unit: 'KG',
    image: '', description: 'High tensile steel wire'
  },
  {
    id: 'p2', name: 'Cement Bag', sku: 'CM-002', category: 'Construction',
    purchasePrice: 850, salePrice: 1000, stock: 120, minStock: 30, unit: 'Bag',
    image: '', description: '50kg cement bag'
  },
  {
    id: 'p3', name: 'PVC Pipe 2 inch', sku: 'PVC-003', category: 'Plumbing',
    purchasePrice: 320, salePrice: 400, stock: 8, minStock: 15, unit: 'Piece',
    image: '', description: '10ft PVC pipe'
  },
];

export const seedCustomers = [
  {
    id: 'c1', name: 'Ahmed Traders', phone: '03001234567', email: 'ahmed@example.com',
    address: 'Lahore', creditLimit: 100000, openingBalance: 0
  },
  {
    id: 'c2', name: 'Bilal Hardware Store', phone: '03219876543', email: 'bilal@example.com',
    address: 'Karachi', creditLimit: 50000, openingBalance: 15000
  },
];

export const seedSales = [];
export const seedExpenses = [];
export const seedStockTransactions = [];
export const seedPayments = [];