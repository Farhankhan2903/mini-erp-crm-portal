import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertTriangle, ArrowUpRight, Building2 } from 'lucide-react';
import { productService } from '../services/productService';
import type { ProductQueryParams } from '../services/productService';
import type { Product, PaginationMeta } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { SearchInput } from '../components/common/SearchInput';
import { Spinner } from '../components/common/Spinner';
import { formatINR } from '../utils/formatters';

export const ProductsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    stock: 0,
    minimumStock: 0,
    warehouse: '',
  });

  // Delete Confirm Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: ProductQueryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        lowStock: lowStockOnly || undefined,
        sortBy,
        sortOrder,
      };

      const res = await productService.getAll(params);
      if (res.success && res.data) {
        setProducts(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch {
      // Error handled via interceptor
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, lowStockOnly, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: 'Electronics',
      unitPrice: 0,
      stock: 0,
      minimumStock: 5,
      warehouse: 'Main Warehouse',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      unitPrice: Number(prod.unitPrice),
      stock: prod.stock,
      minimumStock: prod.minimumStock,
      warehouse: prod.warehouse,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
        showToast('success', 'Product updated successfully!');
      } else {
        await productService.create(formData);
        showToast('success', 'Product created successfully!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await productService.delete(deletingId);
      showToast('success', 'Product deleted successfully!');
      setDeletingId(null);
      fetchProducts();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Products & Inventory Catalog</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage product items, SKU numbers, pricing, and stock threshold alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasRole('ADMIN', 'WAREHOUSE', 'ACCOUNTS') && (
            <Button
              variant="outline"
              onClick={() => navigate('/inventory')}
              icon={<ArrowUpRight className="w-4 h-4" />}
            >
              Stock Audit Log
            </Button>
          )}

          {hasRole('ADMIN', 'WAREHOUSE') && (
            <Button onClick={handleOpenAddModal} icon={<Plus className="w-4 h-4" />}>
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            placeholder="Search SKU, product name, category..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Low Stock Alert Toggle Button */}
          <button
            onClick={() => {
              setLowStockOnly(!lowStockOnly);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              lowStockOnly
                ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Alert Filter</span>
          </button>

          <div className="w-40">
            <Select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so as 'asc' | 'desc');
              }}
              options={[
                { label: 'Newest First', value: 'createdAt-desc' },
                { label: 'Stock: Low to High', value: 'stock-asc' },
                { label: 'Stock: High to Low', value: 'stock-desc' },
                { label: 'Price: Low to High', value: 'unitPrice-asc' },
                { label: 'Price: High to Low', value: 'unitPrice-desc' },
                { label: 'Name A-Z', value: 'name-asc' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Main Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">SKU & Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Min Threshold</th>
                <th className="py-3.5 px-4">Warehouse</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Spinner size="md" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No products found matching current criteria.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const isLowStock = prod.stock <= prod.minimumStock;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            {prod.sku}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">{prod.name}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-600">{prod.category}</td>

                      <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                        {formatINR(prod.unitPrice)}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-sm ${
                              isLowStock ? 'text-rose-600 font-extrabold' : 'text-slate-900'
                            }`}
                          >
                            {prod.stock} units
                          </span>
                          {isLowStock && (
                            <Badge variant="danger">Low Stock</Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-500">{prod.minimumStock} units</td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {prod.warehouse}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasRole('ADMIN', 'WAREHOUSE') && (
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              title="Edit Product"
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {hasRole('ADMIN', 'WAREHOUSE') && (
                            <button
                              onClick={() => setDeletingId(prod.id)}
                              title="Delete Product"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          meta={pagination}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Item' : 'Add New Product Item'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dell PowerEdge Server R740"
            />

            <Input
              label="SKU Serial Code"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. SRV-DELL-740"
            />

            <Input
              label="Category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Hardware / Servers"
            />

            <Input
              label="Unit Price (₹ INR)"
              type="number"
              step="0.01"
              required
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
              placeholder="0.00"
            />

            <Input
              label="Initial Current Stock"
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              placeholder="0"
            />

            <Input
              label="Minimum Stock Threshold Alert"
              type="number"
              required
              value={formData.minimumStock}
              onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
              placeholder="10"
            />
          </div>

          <Input
            label="Warehouse Location"
            required
            value={formData.warehouse}
            onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
            placeholder="e.g. Main Warehouse Bay 3"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingProduct ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Confirm Product Deletion"
        size="sm"
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete this product item? This action will remove it from catalog.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeletingId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
};
