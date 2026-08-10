import React from 'react';
import { Shield, Mail, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  const rolePermissions: Record<string, string[]> = {
    ADMIN: [
      'Full system access across all modules',
      'Register new staff accounts',
      'Delete customers and products',
      'Manage Sales Challans and inventory adjustments',
    ],
    SALES: [
      'Manage CRM Customer directory',
      'Create and edit Customer records',
      'Generate Sales Challans for clients',
      'View catalog pricing and stock levels',
    ],
    WAREHOUSE: [
      'Manage Product catalog items and SKU codes',
      'Log inventory Stock Movements (IN, OUT, ADJUSTMENT)',
      'Update Challan workflow statuses',
      'Inspect Low Stock Alerts',
    ],
    ACCOUNTS: [
      'View Sales Challans and financial records',
      'Inspect Customer directory and order histories',
      'View Inventory valuation and movement audit logs',
    ],
  };

  const permissions = rolePermissions[user?.role || 'SALES'] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">User Account & Profile</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Account details, role assignment, and security permissions
        </p>
      </div>

      {/* User Info Card */}
      <Card className="p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-600/30 shrink-0">
            {user?.name.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
              <Badge variant="primary">{user?.role}</Badge>
            </div>

            <p className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" /> {user?.email}
            </p>

            <p className="text-[11px] text-slate-400 font-mono">User ID: {user?.id}</p>
          </div>

          <Button variant="outline" onClick={logout} icon={<LogOut className="w-4 h-4" />}>
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Permissions Matrix Card */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Role Permission Matrix ({user?.role})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {permissions.map((perm, index) => (
            <div key={index} className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-slate-700">{perm}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
