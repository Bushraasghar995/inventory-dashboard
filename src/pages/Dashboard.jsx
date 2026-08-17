import { useMemo } from 'react';
import {
  Package, Boxes, ShoppingCart, DollarSign, Wallet, TrendingUp,
  AlertTriangle, Calendar
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { useApp } from '../hooks/useApp.js';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import './Dashboard.css';

const COLORS = ['#2f6fed', '#16a34a', '#d97706', '#dc2626', '#7c3aed'];

function Dashboard() {
  const { products, sales, expenses } = useApp();

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.grandTotal || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const grossProfit = sales.reduce((sum, s) => {
      const saleProfit = (s.items || []).reduce((isum, item) => {
        const product = products.find(p => p.id === item.productId);
        const cost = product ? product.purchasePrice * item.qty : 0;
        return isum + (item.price * item.qty - cost);
      }, 0);
      return sum + saleProfit;
    }, 0);
    const netProfit = grossProfit - totalExpenses;

    const lowStock = products.filter(p => Number(p.stock) <= Number(p.minStock));

    const today = new Date().toDateString();
    const todaysSales = sales
      .filter(s => new Date(s.date).toDateString() === today)
      .reduce((sum, s) => sum + Number(s.grandTotal || 0), 0);

    return { totalProducts, totalStock, totalSales, totalRevenue, totalExpenses, netProfit, lowStock, todaysSales };
  }, [products, sales, expenses]);

  const monthlySales = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      const total = sales
        .filter(s => {
          const sd = new Date(s.date);
          return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
        })
        .reduce((sum, s) => sum + Number(s.grandTotal || 0), 0);
      months.push({ month: label, sales: total });
    }
    return months;
  }, [sales]);

  const revenueVsExpenses = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      const revenue = sales
        .filter(s => {
          const sd = new Date(s.date);
          return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
        })
        .reduce((sum, s) => sum + Number(s.grandTotal || 0), 0);
      const exp = expenses
        .filter(e => {
          const ed = new Date(e.date);
          return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
        })
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      months.push({ month: label, revenue, expenses: exp });
    }
    return months;
  }, [sales, expenses]);

  const topProducts = useMemo(() => {
    const qtyMap = {};
    sales.forEach(s => {
      (s.items || []).forEach(item => {
        qtyMap[item.productId] = (qtyMap[item.productId] || 0) + item.qty;
      });
    });
    return Object.entries(qtyMap)
      .map(([productId, qty]) => {
        const product = products.find(p => p.id === productId);
        return { name: product ? product.name : 'Unknown', qty };
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [sales, products]);

  const recentTransactions = [...sales].slice(0, 6);

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'blue' },
    { label: 'Total Stock', value: stats.totalStock, icon: Boxes, color: 'green' },
    { label: 'Total Sales', value: stats.totalSales, icon: ShoppingCart, color: 'orange' },
    { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'blue' },
    { label: 'Total Expenses', value: `Rs. ${stats.totalExpenses.toLocaleString()}`, icon: Wallet, color: 'red' },
    { label: 'Net Profit', value: `Rs. ${stats.netProfit.toLocaleString()}`, icon: TrendingUp, color: stats.netProfit >= 0 ? 'green' : 'red' },
    { label: 'Low Stock Products', value: stats.lowStock.length, icon: AlertTriangle, color: 'orange' },
    { label: "Today's Sales", value: `Rs. ${stats.todaysSales.toLocaleString()}`, icon: Calendar, color: 'blue' },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your business</p>
        </div>
      </div>

      <div className="stat-grid">
        {statCards.map((s, i) => (
          <Card key={i} className="stat-card">
            <div className={`stat-icon stat-${s.color}`}><s.icon size={20} /></div>
            <div>
              <p className="stat-label">{s.label}</p>
              <h3 className="stat-value">{s.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="chart-grid">
        <Card className="chart-card">
          <h4>Sales Overview</h4>
          {sales.length === 0 ? (
            <EmptyState title="No sales yet" message="Sales chart will appear once you make a sale." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#2f6fed" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="chart-card">
          <h4>Revenue vs Expenses</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueVsExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#2f6fed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-card">
          <h4>Monthly Sales</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="sales" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-card">
          <h4>Top Selling Products</h4>
          {topProducts.length === 0 ? (
            <EmptyState title="No sales yet" message="Top products will appear once you make sales." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={topProducts} dataKey="qty" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="bottom-grid">
        <Card>
          <h4>Recent Transactions</h4>
          {recentTransactions.length === 0 ? (
            <EmptyState title="No transactions yet" message="Recent sales will show up here." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Date</th></tr></thead>
                <tbody>
                  {recentTransactions.map(s => (
                    <tr key={s.id}>
                      <td>{s.invoiceNo}</td>
                      <td>{s.customerName || 'Walk-in'}</td>
                      <td>Rs. {Number(s.grandTotal).toLocaleString()}</td>
                      <td>{new Date(s.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h4>Low Stock Products</h4>
          {stats.lowStock.length === 0 ? (
            <EmptyState title="All stocked up!" message="No products are below minimum stock level." />
          ) : (
            <ul className="low-stock-list">
              {stats.lowStock.map(p => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <Badge color="red">{p.stock} {p.unit} left</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
export default Dashboard;