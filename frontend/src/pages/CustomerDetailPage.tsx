import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  Building,
  MapPin,
  Clock,
  Plus,
  FileSpreadsheet,
  MessageSquare,
} from 'lucide-react';
import { customerService } from '../services/customerService';
import type { Customer } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input, TextArea } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Spinner } from '../components/common/Spinner';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Note Modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const fetchCustomerDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await customerService.getById(id);
      if (res.success && res.data) {
        setCustomer(res.data);
      }
    } catch (_err) {
      // Error handled via interceptor
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomerDetail();
  }, [fetchCustomerDetail]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteText.trim()) return;
    setIsSubmittingNote(true);

    try {
      await customerService.addNote(id, noteText.trim(), nextFollowUpDate || undefined);
      showToast('success', 'Follow-up note logged successfully!');
      setIsNoteModalOpen(false);
      setNoteText('');
      setNextFollowUpDate('');
      fetchCustomerDetail();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to log note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 font-medium">Customer not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/customers')}>
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </button>

        {hasRole('ADMIN', 'SALES') && (
          <Button onClick={() => setIsNoteModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Log Follow-Up Note
          </Button>
        )}
      </div>

      {/* Customer Overview Card */}
      <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-0 p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white tracking-tight">{customer.name}</h2>
              <Badge variant="purple">{customer.customerType}</Badge>
              <Badge
                variant={
                  customer.status === 'ACTIVE'
                    ? 'success'
                    : customer.status === 'LEAD'
                    ? 'warning'
                    : 'info'
                }
              >
                {customer.status}
              </Badge>
            </div>

            {customer.businessName && (
              <p className="text-indigo-200 text-sm font-medium flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-400" /> {customer.businessName}
              </p>
            )}

            {customer.gst && (
              <p className="text-xs text-slate-400 font-mono">GSTIN: {customer.gst}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" /> {customer.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-400" /> {customer.mobile}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Next Follow-Up:{' '}
              {customer.followUpDate ? (
                <span className="font-bold text-amber-300">
                  {new Date(customer.followUpDate).toLocaleDateString()}
                </span>
              ) : (
                'None scheduled'
              )}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" /> {customer.address || 'No address stored'}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Notes Audit & Order History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Historical Follow-Up Notes Log */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Follow-Up History & Notes</h3>
            </div>
            {hasRole('ADMIN', 'SALES') && (
              <Button size="sm" variant="outline" onClick={() => setIsNoteModalOpen(true)}>
                + Add Note
              </Button>
            )}
          </div>

          <div className="space-y-4 flex-1">
            {(!customer.notesHistory || customer.notesHistory.length === 0) && !customer.notes ? (
              <p className="py-8 text-center text-xs text-slate-400 font-medium">
                No follow-up notes logged yet.
              </p>
            ) : (
              <>
                {customer.notesHistory && customer.notesHistory.length > 0 ? (
                  customer.notesHistory.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                        {note.followUpDate && (
                          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Rescheduled: {new Date(note.followUpDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-800 whitespace-pre-line">
                        {note.note}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-700 whitespace-pre-line">
                    {customer.notes}
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Sales Challans Order History */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Sales Orders & Challans</h3>
            </div>
            {hasRole('ADMIN', 'SALES') && (
              <Button size="sm" onClick={() => navigate('/sales-challans/new')}>
                New Order
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-x-auto">
            {(!customer.salesChallans || customer.salesChallans.length === 0) ? (
              <p className="py-8 text-center text-xs text-slate-400 font-medium">
                No sales orders created for this customer yet.
              </p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                    <th className="py-2.5 px-3">Challan #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {customer.salesChallans.map((ch: any) => (
                    <tr key={ch.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-indigo-600">{ch.challanNumber}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {new Date(ch.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-semibold">{ch.totalQuantity} items</td>
                      <td className="py-3 px-3 text-right">
                        <Badge
                          variant={
                            ch.status === 'CONFIRMED'
                              ? 'success'
                              : ch.status === 'DRAFT'
                              ? 'warning'
                              : ch.status === 'CANCELLED'
                              ? 'danger'
                              : 'info'
                          }
                        >
                          {ch.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Log Follow-Up Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Log Follow-Up Note"
        size="md"
      >
        <form onSubmit={handleAddNote} className="space-y-4">
          <TextArea
            label="Follow-Up Note / Discussion Summary"
            required
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="e.g. Spoke with procurement head regarding quote approvals..."
          />

          <Input
            label="Next Scheduled Follow-Up Date"
            type="date"
            value={nextFollowUpDate}
            onChange={(e) => setNextFollowUpDate(e.target.value)}
            helperText="Optional: Reschedules customer's next follow-up alarm"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingNote}>
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
