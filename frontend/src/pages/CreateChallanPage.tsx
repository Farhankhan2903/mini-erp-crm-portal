import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { challanService } from '../services/challanService';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import type { Customer, Product, ChallanStatus } from '../types';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import { formatINR } from '../utils/formatters';

interface LineItemRow {
  productId: string;
  quantity: number;
}

export const CreateChallanPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [status, setStatus] = useState<ChallanStatus>('DRAFT');
  const [items, setItems] = useState<LineItemRow[]>([{ productId: '', quantity: 1 }]);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setLoadingData(true);
        const [custRes, prodRes] = await Promise.all([
          customerService.getAll({ limit: 100 }),
          productService.getAll({ limit: 100 }),
        ]);

        if (custRes.success && custRes.data) {
          setCustomers(custRes.data);
          if (custRes.data.length > 0) setSelectedCustomerId(custRes.data[0].id);
        }

        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data);
          if (prodRes.data.length > 0) {
            setItems([{ productId: prodRes.data[0].id, quantity: 1 }]);
          }
        }
      } catch {
        showToast('error', 'Failed to load master customer and product data');
      } finally {
        setLoadingData(false);
      }
    };

    loadMasterData();
  }, []);

  const handleAddItemRow = () => {
    if (products.length === 0) return;
    setItems([...items, { productId: products[0].id, quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const productMap = new Map(products.map((p) => [p.id, p]));

  const totalQuantity = items.reduce((acc, row) => acc + (Number(row.quantity) || 0), 0);
  const estimatedTotalPrice = items.reduce((acc, row) => {
    const prod = productMap.get(row.productId);
    return acc + (prod ? Number(prod.unitPrice) * (Number(row.quantity) || 0) : 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      showToast('error', 'Please select a customer');
      return;
    }

    if (items.some((i) => !i.productId || i.quantity <= 0)) {
      showToast('error', 'Please ensure all line item products and positive quantities are set');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await challanService.create({
        customerId: selectedCustomerId,
        status,
        items,
      });

      if (res.success && res.data) {
        showToast('success', `Sales Challan #${res.data.challanNumber} created successfully!`);
        navigate('/sales-challans');
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to create Sales Challan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/sales-challans')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sales Challans
        </button>

        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-600" /> Create Sales Challan
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Status Header Card */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Customer & Order Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Customer"
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              options={customers.map((c) => ({
                label: `${c.name} ${c.businessName ? `(${c.businessName})` : ''}`,
                value: c.id,
              }))}
            />

            <Select
              label="Initial Order Status"
              required
              value={status}
              onChange={(e) => setStatus(e.target.value as ChallanStatus)}
              options={[
                { label: 'Draft (No stock reduction)', value: 'DRAFT' },
                { label: 'Confirmed (Reduces Stock Immediately)', value: 'CONFIRMED' },
              ]}
            />
          </div>

          {status === 'CONFIRMED' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Selecting CONFIRMED will verify stock availability and immediately deduct items from warehouse inventory.
              </span>
            </div>
          )}
        </Card>

        {/* Multi-Product Line Items Table Card */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Product Line Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItemRow}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Product Line
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((row, index) => {
              const selectedProduct = productMap.get(row.productId);
              const isStockShortage =
                status === 'CONFIRMED' && selectedProduct && selectedProduct.stock < row.quantity;

              return (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80"
                >
                  <div className="flex-1">
                    <Select
                      label={`Product #${index + 1}`}
                      required
                      value={row.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      options={products.map((p) => ({
                        label: `${p.name} (SKU: ${p.sku}) — ${formatINR(p.unitPrice)} [Stock: ${p.stock}]`,
                        value: p.id,
                      }))}
                    />
                  </div>

                  <div className="w-full md:w-32">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={row.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                      className="w-full bg-white text-slate-900 text-sm rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="w-full md:w-28 text-right">
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Subtotal</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatINR((selectedProduct ? Number(selectedProduct.unitPrice) : 0) * row.quantity)}
                    </span>
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(index)}
                      className="p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer self-end md:self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {isStockShortage && (
                    <div className="w-full text-xs font-bold text-rose-600">
                      ⚠️ Insufficient stock! Available: {selectedProduct.stock}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 bg-slate-50/80 p-5 rounded-2xl">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Line Quantity</p>
              <p className="text-lg font-black text-slate-900">{totalQuantity} items</p>
            </div>

            <div className="text-right space-y-1">
              <p className="text-xs text-slate-500 font-medium">
                Subtotal (Excl. Tax): <span className="font-bold text-slate-800">{formatINR(estimatedTotalPrice)}</span>
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Estimated GST (18%): <span className="font-bold text-amber-600">{formatINR(estimatedTotalPrice * 0.18)}</span>
              </p>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Grand Total (Incl. GST)</p>
              <p className="text-2xl font-black text-indigo-600">{formatINR(estimatedTotalPrice * 1.18)}</p>
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/sales-challans')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Generate Sales Challan
          </Button>
        </div>
      </form>
    </div>
  );
};
