import React from 'react';
import { Property } from '../types';
import { X, Check, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onRemove: (id: string) => void;
  onSelectProperty: (id: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  properties,
  onRemove,
  onSelectProperty
}) => {
  if (!isOpen || properties.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Side-by-Side Property Comparison ({properties.length}/3)
            </h3>
            <p className="text-xs text-slate-500">
              Compare transparent rent, deposits, furnishing, and amenities before visiting.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 w-44 font-semibold text-slate-500 bg-slate-50">Feature / Spec</th>
                {properties.map(p => (
                  <th key={p.id} className="py-3 px-4 min-w-[240px]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={p.images[0] || '/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg'}
                          alt={p.title}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{p.title}</p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {p.locality}, {p.city}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemove(p.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Monthly Rent</td>
                {properties.map(p => (
                  <td key={p.id} className="py-3 px-4 font-mono font-bold text-sm text-blue-600 tabular-nums">
                    ₹{new Intl.NumberFormat('en-IN').format(p.rentMonthly)} / mo
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Security Deposit</td>
                {properties.map(p => (
                  <td key={p.id} className="py-3 px-4 font-mono font-medium text-slate-800 tabular-nums">
                    ₹{new Intl.NumberFormat('en-IN').format(p.securityDeposit)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Brokerage</td>
                {properties.map(p => (
                  <td key={p.id} className="py-3 px-4 text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>₹0 (Zero Brokerage)</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Maintenance Charges</td>
                {properties.map(p => (
                  <td key={p.id} className="py-3 px-4 text-slate-700">
                    {p.maintenanceCharges > 0 ? `₹${p.maintenanceCharges} / month` : 'Included in rent'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Property Type</td>
                {properties.map(p => (
                  <td key={p.id} className="py-3 px-4 font-medium text-slate-900">{p.propertyType}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Furnishing</td>
                {properties.map(p => (
                  <td key={p.id} className="py-3 px-4 text-slate-800">{p.furnishing}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Super Area & Carpet Area</td>
                {properties.map(p => (
                  <td key={p.id} className="py-3 px-4 text-slate-800 font-mono tabular-nums">
                    {p.superBuiltUpArea} sq ft (Carpet: {p.carpetArea} sq ft)
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Bedrooms & Baths</td>
                {properties.map(p => (
                  <td key={p.id} className="py-3 px-4 text-slate-800">
                    {p.bedrooms} Beds · {p.bathrooms} Baths · {p.balconies} Balconies
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Parking Facility</td>
                {properties.map(p => (
                  <td key={p.id} className="py-3 px-4 text-slate-800">{p.parking}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Tenant Preference</td>
                {properties.map(p => (
                  <td key={p.id} className="py-3 px-4 text-slate-800">{p.preferredTenant}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Owner Response Time</td>
                {properties.map(p => (
                  <td key={p.id} className="py-3 px-4 text-slate-600 font-medium">
                    {p.ownerName} ({p.ownerResponseTime})
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Action</td>
                {properties.map(p => (
                  <td key={p.id} className="py-3 px-4">
                    <button
                      onClick={() => {
                        onSelectProperty(p.id);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span>View Full Listing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
