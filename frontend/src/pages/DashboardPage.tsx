import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  FileSpreadsheet,
  AlertTriangle,
  IndianRupee,
  ArrowUpRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import type { DashboardMetricsData } from '../services/dashboardService';
import { StatCard, Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDateIN } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getMetrics();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch {
      // Handled via axios interceptor or toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const cards = data?.cards || {
    totalCustomers: 0,
    totalProducts: 0,
    todaysChallans: 0,
    lowStockProducts: 0,
    totalInventoryValue: 0,
  };

  const lists = data?.lists || {
    recentChallans: [],
    recentCustomers: [],
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Operations Dashboard</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time metric summary for Fundsroom Mini ERP + CRM Portal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          {hasRole('ADMIN', 'SALES') && (
            <Button
              size="sm"
              onClick={() => navigate('/sales-challans/new')}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Challan
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <StatCard
          title="Total Customers"
          value={cards.totalCustomers}
          icon={<Users className="w-6 h-6" />}
          iconBg="bg-indigo-50 text-indigo-600"
          subtitle="Registered CRM accounts"
        />

        <StatCard
          title="Total Products"
          value={cards.totalProducts}
          icon={<Package className="w-6 h-6" />}
          iconBg="bg-sky-50 text-sky-600"
          subtitle="Catalog SKU count"
        />

        <StatCard
          title="Today's Challans"
          value={cards.todaysChallans}
          icon={<FileSpreadsheet className="w-6 h-6" />}
          iconBg="bg-purple-50 text-purple-600"
          subtitle="Generated today"
        />

        <StatCard
          title="Low Stock Alert"
          value={cards.lowStockProducts}
          icon={<AlertTriangle className="w-6 h-6" />}
          iconBg={cards.lowStockProducts > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600'}
          subtitle={cards.lowStockProducts > 0 ? 'Requires stock re-order' : 'All stock levels healthy'}
        />

        <StatCard
          title="Inventory Value"
          value={formatINR(cards.totalInventoryValue)}
          icon={<IndianRupee className="w-6 h-6" />}
          iconBg="bg-emerald-50 text-emerald-600"
          subtitle="Total warehouse valuation"
        />
      </div>

      {/* Activity Streams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sales Challans */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Sales Challans</h3>
              <p className="text-xs text-slate-500 font-medium">Latest ERP orders generated</p>
            </div>
            <button
              onClick={() => navigate('/sales-challans')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-x-auto">
            {lists.recentChallans.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No sales challans recorded yet.</p>
            ) : (
              lists.recentChallans.map((challan: any) => (
                <div
                  key={challan.id}
                  onClick={() => navigate('/sales-challans')}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer px-2"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">{challan.challanNumber}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {challan.customer?.name || 'Walk-in Customer'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {challan.totalQuantity} items
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {formatDateIN(challan.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        challan.status === 'CONFIRMED'
                          ? 'success'
                          : challan.status === 'DRAFT'
                          ? 'warning'
                          : challan.status === 'CANCELLED'
                          ? 'danger'
                          : 'info'
                      }
                    >
                      {challan.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Customers */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Customers & Leads</h3>
              <p className="text-xs text-slate-500 font-medium">Newly onboarded CRM contacts</p>
            </div>
            {hasRole('ADMIN', 'SALES', 'ACCOUNTS') && (
              <button
                onClick={() => navigate('/customers')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-x-auto">
            {lists.recentCustomers.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No customer contacts registered yet.</p>
            ) : (
              lists.recentCustomers.map((cust: any) => (
                <div
                  key={cust.id}
                  onClick={() => navigate(`/customers/${cust.id}`)}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer px-2"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">{cust.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{cust.email}</p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <Badge variant={cust.status === 'ACTIVE' ? 'success' : cust.status === 'LEAD' ? 'warning' : 'neutral'}>
                      {cust.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
