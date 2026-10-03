import React, { useState } from 'react';
import { Property, User } from '../types';
import { api } from '../services/api';
import { X, AlertCircle, ShieldAlert, CheckCircle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  property,
  currentUser,
  onOpenAuth
}) => {
  const [reason, setReason] = useState<'misleading_photos' | 'broker_disguised' | 'incorrect_rent' | 'fake_property' | 'offensive_owner' | 'already_rented'>('broker_disguised');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!details.trim()) {
      setError('Please provide specific details explaining the report.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.submitReport({
        propertyId: property.id,
        reporterId: currentUser.id,
        reporterName: currentUser.name,
        reporterEmail: currentUser.email,
        reason,
        details
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Report Listing Issue</h3>
              <p className="text-xs text-slate-500">Protecting StayLink's zero-broker integrity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900">Report Received</h4>
            <p className="text-xs text-slate-600">
              Thank you for keeping StayLink safe. Our moderation team reviews every report within 12 business hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Report Category
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="broker_disguised">Disguised Broker / Demanding Brokerage Commission</option>
                <option value="misleading_photos">Misleading Photographs or Inaccurate Amenities</option>
                <option value="incorrect_rent">Demanding Higher Rent / Hidden Deposit Fees</option>
                <option value="fake_property">Non-Existent Property or Suspicious Landlord</option>
                <option value="already_rented">Property is Already Rented Out / Unavailable</option>
                <option value="offensive_owner">Inappropriate or Discriminatory Communication</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Evidence & Incident Details
              </label>
              <textarea
                rows={4}
                required
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Describe what occurred, dates, or contact notes so our trust team can investigate."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
              StayLink strictly bans brokers and middlemen. If proven, the poster's phone number and IP address will be blacklisted across India.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
            >
              {loading ? 'Submitting Report...' : 'Submit Report for Investigation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
