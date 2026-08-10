import { useEffect, useState, useCallback } from 'react';
import { Plus, ArrowRightLeft, ArrowDownRight, ArrowUpRight, RotateCcw } from 'lucide-react';
import { stockService } from '../services/stockService';
import type { StockQueryParams } from '../services/stockService';
import { productService } from '../services/productService';
import type { StockMovement, MovementType, Product, PaginationMeta } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input, TextArea } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { Spinner } from '../components/common/Spinner';

export const InventoryPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [typeFilter, setTypeFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    movementType: 'IN' as MovementType,
    reason: '',
  });

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      const params: StockQueryParams = {
        page: pagination.page,
        limit: pagination.limit,
        movementType: (typeFilter as MovementType) || undefined,
      };

      const res = await stockService.getAll(params);
      if (res.success && res.data) {
        setMovements(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (_err) {
      // Handled via interceptor
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, typeFilter]);

  const fetchProductsList = async () => {
    try {
      const res = await productService.getAll({ limit: 100 });
      if (res.success && res.data) {
        setProductsList(res.data);
        if (res.data.length > 0 && !formData.productId) {
          setFormData((prev) => ({ ...prev, productId: res.data[0].id }));
        }
      }
    } catch (_err) {
      //
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const handleOpenModal = () => {
    fetchProductsList();
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) {
      showToast('error', 'Please select a product');
      return;
    }
    setIsSubmitting(true);

    try {
      await stockService.createMovement({
        productId: formData.productId,
        quantity: Number(formData.quantity),
        movementType: formData.movementType,
        reason: formData.reason,
      });
      showToast('success', 'Stock movement recorded successfully!');
      setIsModalOpen(false);
      setFormData({
        productId: '',
        quantity: 1,
        movementType: 'IN',
        reason: '',
      });
      fetchMovements();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to record stock movement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const movementBadge = (type: MovementType) => {
    if (type === 'IN') {
      return (
        <Badge variant="success">
          <ArrowDownRight className="w-3 h-3 mr-1" /> STOCK IN
        </Badge>
      );
    }
    if (type === 'OUT') {
      return (
        <Badge variant="danger">
          <ArrowUpRight className="w-3 h-3 mr-1" /> STOCK OUT
        </Badge>
      );
    }
    return (
      <Badge variant="warning">
        <RotateCcw className="w-3 h-3 mr-1" /> ADJUSTMENT
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Stock Movements Audit Log</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Audit history for warehouse inventory IN, OUT, and physical stock adjustments
          </p>
        </div>

        {hasRole('ADMIN', 'WAREHOUSE') && (
          <Button onClick={handleOpenModal} icon={<Plus className="w-4 h-4" />}>
            Log Stock Movement
          </Button>
        )}
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-bold text-slate-900">Inventory Movement Logs</span>
        </div>

        <div className="w-44">
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            options={[
              { label: 'All Movements', value: '' },
              { label: 'Stock IN (+)', value: 'IN' },
              { label: 'Stock OUT (-)', value: 'OUT' },
              { label: 'Adjustment', value: 'ADJUSTMENT' },
            ]}
          />
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Timestamp & Date</th>
                <th className="py-3.5 px-4">Product & SKU</th>
                <th className="py-3.5 px-4">Movement Type</th>
                <th className="py-3.5 px-4">Quantity</th>
                <th className="py-3.5 px-6">Reason / Reference</th>
                <th className="py-3.5 px-6 text-right">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Spinner size="md" />
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(mov.timestamp || mov.createdAt).toLocaleString()}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{mov.product?.name || 'Unknown Product'}</div>
                      <div className="text-[10px] font-mono text-slate-400">SKU: {mov.product?.sku}</div>
                    </td>

                    <td className="py-4 px-4">{movementBadge(mov.movementType)}</td>

                    <td className="py-4 px-4 font-black text-sm text-slate-900">
                      {mov.movementType === 'IN' ? '+' : mov.movementType === 'OUT' ? '-' : ''}
                      {mov.quantity} units
                    </td>

                    <td className="py-4 px-6 text-slate-600 max-w-xs truncate">
                      {mov.reason || 'Manual inventory update'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span className="font-semibold text-slate-800">{mov.createdBy?.name || 'System'}</span>
                      <span className="block text-[10px] text-slate-400">{mov.createdBy?.role}</span>
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

      {/* Log Stock Movement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Inventory Stock Movement"
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Select
            label="Select Product"
            required
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            options={productsList.map((p) => ({
              label: `${p.name} (SKU: ${p.sku}) — Available Stock: ${p.stock}`,
              value: p.id,
            }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Movement Type"
              required
              value={formData.movementType}
              onChange={(e) => setFormData({ ...formData, movementType: e.target.value as MovementType })}
              options={[
                { label: 'Stock IN (+)', value: 'IN' },
                { label: 'Stock OUT (-)', value: 'OUT' },
                { label: 'Adjustment', value: 'ADJUSTMENT' },
              ]}
            />

            <Input
              label="Quantity"
              type="number"
              min="1"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            />
          </div>

          <TextArea
            label="Reason / Reference Note"
            rows={3}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="e.g. Received shipment PO-88712 or Damaged goods disposal..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Log Movement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
