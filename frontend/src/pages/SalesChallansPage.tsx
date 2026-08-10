import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, CheckCircle2 } from 'lucide-react';
import { challanService } from '../services/challanService';
import type { ChallanQueryParams } from '../services/challanService';
import type { SalesChallan, ChallanStatus, PaginationMeta } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { SearchInput } from '../components/common/SearchInput';
import { Spinner } from '../components/common/Spinner';
import { formatINR } from '../utils/formatters';

export const SalesChallansPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Challan Modal for View & Status Update
  const [selectedChallan, setSelectedChallan] = useState<SalesChallan | null>(null);
  const [newStatus, setNewStatus] = useState<ChallanStatus>('CONFIRMED');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchChallans = useCallback(async () => {
    try {
      setLoading(true);
      const params: ChallanQueryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        status: (statusFilter as ChallanStatus) || undefined,
      };

      const res = await challanService.getAll(params);
      if (res.success && res.data) {
        setChallans(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (_err) {
      //
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]);

  useEffect(() => {
    fetchChallans();
  }, [fetchChallans]);

  const handleOpenStatusModal = (ch: SalesChallan) => {
    setSelectedChallan(ch);
    setNewStatus(
      ch.status === 'DRAFT'
        ? 'CONFIRMED'
        : ch.status === 'CONFIRMED'
        ? 'DISPATCHED'
        : 'DELIVERED'
    );
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallan) return;
    setIsUpdatingStatus(true);

    try {
      await challanService.updateStatus(selectedChallan.id, newStatus);
      showToast('success', `Sales Challan status updated to ${newStatus}`);
      setIsStatusModalOpen(false);
      fetchChallans();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statusBadge = (status: ChallanStatus) => {
    if (status === 'CONFIRMED') return <Badge variant="success">CONFIRMED</Badge>;
    if (status === 'DRAFT') return <Badge variant="warning">DRAFT</Badge>;
    if (status === 'DISPATCHED') return <Badge variant="info">DISPATCHED</Badge>;
    if (status === 'DELIVERED') return <Badge variant="purple">DELIVERED</Badge>;
    return <Badge variant="danger">CANCELLED</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sales Challans ERP</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Generate and manage Sales Challans with product snapshots and stock reduction
          </p>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <Button onClick={() => navigate('/sales-challans/new')} icon={<Plus className="w-4 h-4" />}>
            Create Sales Challan
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            placeholder="Search Challan # or Customer name..."
          />
        </div>

        <div className="w-48">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Confirmed', value: 'CONFIRMED' },
              { label: 'Dispatched', value: 'DISPATCHED' },
              { label: 'Delivered', value: 'DELIVERED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ]}
          />
        </div>
      </div>

      {/* Challans Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Challan Number</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Total Quantity</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Spinner size="md" />
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No sales challans found.
                  </td>
                </tr>
              ) : (
                challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-indigo-600 text-sm">
                      {ch.challanNumber}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{ch.customer?.name || 'Walk-in Customer'}</div>
                      <div className="text-[10px] text-slate-400">{ch.customer?.email}</div>
                    </td>

                    <td className="py-4 px-4">{statusBadge(ch.status)}</td>

                    <td className="py-4 px-4 font-bold text-slate-800 text-sm">
                      {ch.totalQuantity} items
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {new Date(ch.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedChallan(ch)}
                          title="View Challan Details & Snapshot Items"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasRole('ADMIN', 'SALES', 'WAREHOUSE') &&
                          ch.status !== 'DELIVERED' &&
                          ch.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleOpenStatusModal(ch)}
                              title="Update Workflow Status"
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          meta={pagination}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
        />
      </div>

      {/* View Challan Item Snapshots Modal */}
      {selectedChallan && !isStatusModalOpen && (
        <Modal
          isOpen={!!selectedChallan}
          onClose={() => setSelectedChallan(null)}
          title={`Sales Challan ${selectedChallan.challanNumber}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Customer</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedChallan.customer?.name}</p>
                <p className="text-slate-500">{selectedChallan.customer?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</p>
                <div className="mt-1">{statusBadge(selectedChallan.status)}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Stored Product Line Item Snapshots
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="py-2.5 px-4">SKU</th>
                      <th className="py-2.5 px-4">Product Snapshot</th>
                      <th className="py-2.5 px-4">Price</th>
                      <th className="py-2.5 px-4 text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedChallan.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.sku}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{item.productName}</td>
                        <td className="py-3 px-4">{formatINR(item.price)}</td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Update Modal */}
      {selectedChallan && isStatusModalOpen && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Update Status for ${selectedChallan.challanNumber}`}
          size="md"
        >
          <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-800">
              Note: Changing status from DRAFT to CONFIRMED or DISPATCHED will trigger automatic stock reduction and negative stock verification.
            </div>

            <Select
              label="Select Target Status"
              required
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ChallanStatus)}
              options={[
                { label: 'Confirmed (Reduces Stock)', value: 'CONFIRMED' },
                { label: 'Dispatched', value: 'DISPATCHED' },
                { label: 'Delivered', value: 'DELIVERED' },
                { label: 'Cancelled', value: 'CANCELLED' },
              ]}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isUpdatingStatus}>
                Update Workflow Status
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
