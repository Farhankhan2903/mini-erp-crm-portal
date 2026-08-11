import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Calendar, Phone, Mail, Building } from 'lucide-react';
import { customerService } from '../services/customerService';
import type { CustomerQueryParams } from '../services/customerService';
import type { Customer, CustomerStatus, CustomerType, PaginationMeta } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input, TextArea } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { SearchInput } from '../components/common/SearchInput';
import { Spinner } from '../components/common/Spinner';
import { formatDateIN, formatPhoneIN } from '../utils/formatters';

export const CustomersPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gst: '',
    customerType: 'RETAIL' as CustomerType,
    address: '',
    status: 'ACTIVE' as CustomerStatus,
    followUpDate: '',
    notes: '',
  });

  // Delete Confirm Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params: CustomerQueryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        customerType: typeFilter || undefined,
        sortBy,
        sortOrder,
      };

      const res = await customerService.getAll(params);
      if (res.success && res.data) {
        setCustomers(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch {
      // Error handled via interceptor
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, typeFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      businessName: '',
      gst: '',
      customerType: 'RETAIL',
      address: '',
      status: 'ACTIVE',
      followUpDate: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      mobile: cust.mobile,
      email: cust.email,
      businessName: cust.businessName || '',
      gst: cust.gst || '',
      customerType: cust.customerType,
      address: cust.address || '',
      status: cust.status,
      followUpDate: cust.followUpDate ? cust.followUpDate.slice(0, 10) : '',
      notes: cust.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id, formData);
        showToast('success', 'Customer updated successfully!');
      } else {
        await customerService.create(formData);
        showToast('success', 'Customer added successfully!');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await customerService.delete(deletingId);
      showToast('success', 'Customer deleted successfully!');
      setDeletingId(null);
      fetchCustomers();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to delete customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer CRM</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage customers, leads, follow-up schedules, and GST records
          </p>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <Button onClick={handleOpenAddModal} icon={<Plus className="w-4 h-4" />}>
            Add Customer
          </Button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            placeholder="Search name, email, mobile, GST..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Lead', value: 'LEAD' },
                { label: 'Prospect', value: 'PROSPECT' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' },
              ]}
            />
          </div>

          <div className="w-36">
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              options={[
                { label: 'All Types', value: '' },
                { label: 'Retail', value: 'RETAIL' },
                { label: 'Wholesale', value: 'WHOLESALE' },
                { label: 'Corporate', value: 'CORPORATE' },
              ]}
            />
          </div>

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
                { label: 'Oldest First', value: 'createdAt-asc' },
                { label: 'Name A-Z', value: 'name-asc' },
                { label: 'Follow Up Date', value: 'followUpDate-asc' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Customer & Business</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Follow-Up Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Spinner size="md" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No customers found matching current filters.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{cust.name}</div>
                      {cust.businessName && (
                        <div className="text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                          <Building className="w-3 h-3" /> {cust.businessName}
                        </div>
                      )}
                      {cust.gst && <div className="text-[10px] text-slate-400 font-mono mt-0.5">GSTIN: {cust.gst}</div>}
                    </td>

                    <td className="py-4 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {cust.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {formatPhoneIN(cust.mobile)}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant="purple">{cust.customerType}</Badge>
                    </td>

                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          cust.status === 'ACTIVE'
                            ? 'success'
                            : cust.status === 'LEAD'
                            ? 'warning'
                            : cust.status === 'PROSPECT'
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {cust.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-700">
                      {cust.followUpDate ? (
                        <div className="flex items-center gap-1.5 text-indigo-600 font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDateIN(cust.followUpDate)}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/customers/${cust.id}`)}
                          title="View Details & Follow Up"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasRole('ADMIN', 'SALES') && (
                          <button
                            onClick={() => handleOpenEditModal(cust)}
                            title="Edit Customer"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {hasRole('ADMIN') && (
                          <button
                            onClick={() => setDeletingId(cust.id)}
                            title="Delete Customer"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Customer / Business Contact Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Patel Traders / Shree Ganesh Distributors"
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@pateltraders.in"
            />
            <Input
              label="Mobile Number (10 Digits)"
              required
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="e.g. 9825012345"
            />
            <Input
              label="Business Name"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="e.g. Patel Trading Company Pvt Ltd"
            />
            <Input
              label="GSTIN (15 Digits)"
              value={formData.gst}
              onChange={(e) => setFormData({ ...formData, gst: e.target.value.toUpperCase() })}
              placeholder="e.g. 24AAACP1234A1Z5"
            />
            <Select
              label="Customer Type"
              value={formData.customerType}
              onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
              options={[
                { label: 'Retail', value: 'RETAIL' },
                { label: 'Wholesale', value: 'WHOLESALE' },
                { label: 'Corporate', value: 'CORPORATE' },
              ]}
            />
            <Select
              label="CRM Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
              options={[
                { label: 'Lead', value: 'LEAD' },
                { label: 'Prospect', value: 'PROSPECT' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' },
              ]}
            />
            <Input
              label="Follow-Up Date"
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
          </div>

          <TextArea
            label="Address (City, District, State, PIN Code)"
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. 102, GIDC Industrial Estate, Odhav, Ahmedabad, Gujarat - 382415"
          />

          <TextArea
            label="Notes"
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Initial inquiry or contact notes..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingCustomer ? 'Update Customer' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Confirm Customer Deletion"
        size="sm"
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete this customer? This action cannot be undone.
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
