import React, { useState } from 'react';
import { Property, User } from '../types';
import { api } from '../services/api';
import { X, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  currentUser: User | null;
  onOpenAuth: () => void;
  onSuccess: () => void;
}

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  isOpen,
  onClose,
  property,
  currentUser,
  onOpenAuth,
  onSuccess
}) => {
  const [visitDate, setVisitDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<'Morning (10:00 AM - 12:00 PM)' | 'Afternoon (02:00 PM - 04:00 PM)' | 'Evening (05:00 PM - 07:00 PM)'>('Morning (10:00 AM - 12:00 PM)');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Minimum date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!visitDate) {
      setError('Please choose a preferred visit date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createVisitRequest({
        propertyId: property.id,
        renterId: currentUser.id,
        renterName: currentUser.name,
        renterPhone: currentUser.phone,
        renterEmail: currentUser.email,
        visitDate,
        visitTimeSlot: timeSlot,
        notes
      });
      setConfirmed(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setConfirmed(false);
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to schedule visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Schedule Physical Property Visit</h3>
              <p className="text-xs text-slate-500">Direct appointment with homeowner {property.ownerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900">Visit Request Sent Successfully!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Homeowner {property.ownerName} has been notified. You can track confirmation status and gate instructions in your Renter Dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                {error}
              </div>
            )}

            {/* Property Summary Pill */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
              <img
                src={property.images[0] || '/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg'}
                alt={property.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{property.title}</p>
                <p className="text-[11px] text-slate-500">{property.address || property.locality}, {property.city}</p>
                <p className="text-[11px] font-semibold text-blue-600">
                  ₹{new Intl.NumberFormat('en-IN').format(property.rentMonthly)} / mo · Zero Brokerage
                </p>
              </div>
            </div>

            {/* Date selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Visit Date</label>
              <input
                type="date"
                min={minDate}
                required
                value={visitDate}
                onChange={e => setVisitDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Time Slot selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Time Slot</label>
              <div className="space-y-2">
                {[
                  'Morning (10:00 AM - 12:00 PM)',
                  'Afternoon (02:00 PM - 04:00 PM)',
                  'Evening (05:00 PM - 07:00 PM)'
                ].map(slot => (
                  <label
                    key={slot}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      timeSlot === slot
                        ? 'border-blue-600 bg-blue-50/40 text-blue-950 font-medium'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeslot"
                      value={slot}
                      checked={timeSlot === slot}
                      onChange={() => setTimeSlot(slot as any)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional message to owner */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Note for Owner (Family size, parking check, etc.)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Relocating next month, would like to see covered car parking slot."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            </div>

            {/* Safety advisory */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                Safety Rule: StayLink never asks for visit fees or gate entry charges. Never transfer advance tokens before in-person verification.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
            >
              {loading ? 'Submitting Request...' : 'Confirm Visit Appointment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
