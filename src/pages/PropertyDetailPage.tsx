import React, { useState } from 'react';
import { Property, User } from '../types';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import {
  Heart,
  ArrowRightLeft,
  Share2,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Building,
  Maximize2,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

interface PropertyDetailPageProps {
  property: Property;
  allProperties: Property[];
  currentUser: User | null;
  isFavourite: boolean;
  isCompared: boolean;
  onToggleFavourite: (id: string) => void;
  onToggleCompare: (property: Property) => void;
  onSelectProperty: (id: string) => void;
  onBack: () => void;
  onOpenScheduleVisit: () => void;
  onOpenReport: () => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  allProperties,
  currentUser,
  isFavourite,
  isCompared,
  onToggleFavourite,
  onToggleCompare,
  onSelectProperty,
  onBack,
  onOpenScheduleVisit,
  onOpenReport,
  onOpenAuth
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [enquiryMessage, setEnquiryMessage] = useState(
    `Hello ${property.ownerName}, I am interested in your ${property.propertyType} in ${property.locality}. Is it still available for moving in soon?`
  );
  const [moveInDate, setMoveInDate] = useState('Immediate');
  const [sendingEnquiry, setSendingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  // Format currency
  const formattedRent = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(property.rentMonthly);
  const formattedDeposit = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(property.securityDeposit);

  const similarListings = allProperties
    .filter(p => p.id !== property.id && p.city.toLowerCase() === property.city.toLowerCase())
    .slice(0, 3);

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }

    setSendingEnquiry(true);
    try {
      await api.createEnquiry({
        propertyId: property.id,
        renterId: currentUser.id,
        renterName: currentUser.name,
        renterEmail: currentUser.email,
        renterPhone: currentUser.phone,
        message: enquiryMessage,
        preferredMoveInDate: moveInDate
      });
      setEnquirySuccess(true);
      setTimeout(() => setEnquirySuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to send enquiry');
    } finally {
      setSendingEnquiry(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this direct-owner rental on StayLink: ${property.title} in ${property.locality}, ${property.city}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Listing link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation breadcrumb and actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search Results</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleCompare(property)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isCompared
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{isCompared ? 'In Compare List' : 'Compare'}</span>
          </button>

          <button
            onClick={() => onToggleFavourite(property.id)}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              isFavourite
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Save to Favourites"
          >
            <Heart className={`w-4 h-4 ${isFavourite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs transition-colors"
            title="Share Listing"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="space-y-3">
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
          <img
            src={property.images[activeImageIndex] || property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-xs text-white text-xs font-medium px-3 py-1 rounded-md flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct Homeowner Listing · Zero Brokerage</span>
          </div>

          <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-mono">
            {activeImageIndex + 1} / {property.images.length}
          </div>
        </div>

        {property.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Content (Left) + Contiguous Purchase/Action Module (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Property Details & Specifications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header & Title */}
          <div className="space-y-2 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-blue-600 font-bold">{property.propertyType}</span>
              <span>·</span>
              <span>{property.furnishing}</span>
              <span>·</span>
              <span>{property.superBuiltUpArea} sq ft</span>
              <span>·</span>
              <span className="text-emerald-700 font-semibold">{property.availableFrom === 'Immediate' ? 'Ready to move' : `Available from ${property.availableFrom}`}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 text-balance leading-snug">
              {property.title}
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{property.address || property.locality}, {property.locality}, {property.city} - {property.pincode}</span>
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Property Overview & Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 text-[11px]">Bedrooms & Baths</span>
                <p className="font-bold text-slate-900 mt-0.5">{property.bedrooms} Bed · {property.bathrooms} Bath</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 text-[11px]">Balconies</span>
                <p className="font-bold text-slate-900 mt-0.5">{property.balconies} Balcony</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 text-[11px]">Super / Carpet Area</span>
                <p className="font-bold text-slate-900 mt-0.5 font-mono tabular-nums">{property.superBuiltUpArea} / {property.carpetArea} sq ft</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 text-[11px]">Floor / Total Floors</span>
                <p className="font-bold text-slate-900 mt-0.5">Floor {property.floorNumber} of {property.totalFloors}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 text-[11px]">Parking Allotment</span>
                <p className="font-bold text-slate-900 mt-0.5">{property.parking}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 text-[11px]">Preferred Tenant</span>
                <p className="font-bold text-slate-900 mt-0.5">{property.preferredTenant}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              About This Home
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Transparent Charges & Utility Terms */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Transparent Fee Breakdown (No Hidden Charges)
              </h3>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero Brokerage
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Monthly Rent</span>
                <span className="font-bold font-mono tabular-nums text-slate-900">₹{formattedRent}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Security Deposit (Refundable upon move-out)</span>
                <span className="font-bold font-mono tabular-nums text-slate-900">₹{formattedDeposit}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Society Maintenance Charges</span>
                <span className="font-medium text-slate-800">
                  {property.maintenanceCharges > 0 ? `₹${property.maintenanceCharges} / month` : 'Included in rent'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Brokerage & Agent Commission</span>
                <span className="font-bold text-emerald-600">₹0 (Strictly ₹0)</span>
              </div>
              <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-600">Electricity Billing Terms</span>
                <span className="text-slate-800 font-medium text-right">{property.electricityChargesNote}</span>
              </div>
              <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-600">Water Supply Terms</span>
                <span className="text-slate-800 font-medium text-right">{property.waterChargesNote}</span>
              </div>
            </div>
          </div>

          {/* Amenities Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Amenities & Facilities
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
              {property.amenities.map((am, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{am}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules and Society Policies */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              House Rules & Agreement Terms
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {property.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-0.5">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety Advisory Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>StayLink Safety & Fraud Prevention Advisory</span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              Never transfer token advance, deposit, or gate entry fees via UPI/QR codes before physically visiting the property and verifying the owner's electricity bill or property tax receipt. StayLink never charges visit appointment fees.
            </p>
            <button
              onClick={onOpenReport}
              className="text-[11px] font-semibold text-rose-700 hover:underline flex items-center gap-1 mt-1"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Report this listing if an unauthorized broker contacts you</span>
            </button>
          </div>
        </div>

        {/* Right Column: Sticky Contiguous Purchase/Action Module */}
        <div className="space-y-6 lg:sticky lg:top-20">
          {/* Main Booking/Enquiry Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-6">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                  ₹{formattedRent}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ month</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Refundable Deposit: <span className="font-mono tabular-nums font-semibold text-slate-700">₹{formattedDeposit}</span>
              </div>
            </div>

            {/* In-Person Visit Action Button */}
            <button
              onClick={onOpenScheduleVisit}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Physical Visit</span>
            </button>

            {/* Direct Homeowner Profile */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
                  {property.ownerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900">{property.ownerName}</span>
                    {property.ownerVerified && (
                      <span title="Verified Owner">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">Homeowner · Verified Direct Listing</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Typical response:</span>
                <span className="font-medium text-slate-800">{property.ownerResponseTime}</span>
              </div>

              {/* Reveal Phone Button */}
              {showPhone ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-mono font-bold flex items-center justify-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{property.ownerPhone}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) onOpenAuth('login');
                    else setShowPhone(true);
                  }}
                  className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Show Owner Contact Number</span>
                </button>
              )}
            </div>

            {/* Direct Chat / Enquiry Box */}
            <form onSubmit={handleSendEnquiry} className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Send Direct Message to Owner
              </h4>

              {enquirySuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Enquiry dispatched! Track responses in your Renter Dashboard.</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Expected Move-in Timeline
                </label>
                <select
                  value={moveInDate}
                  onChange={e => setMoveInDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50"
                >
                  <option value="Immediate">Immediate (Within 7 days)</option>
                  <option value="15 Days">Within 15 Days</option>
                  <option value="Next Month">Next Month</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Your Enquiry Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={enquiryMessage}
                  onChange={e => setEnquiryMessage(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sendingEnquiry}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{sendingEnquiry ? 'Sending...' : 'Contact Owner Directly'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      {similarListings.length > 0 && (
        <section className="pt-8 border-t border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            Similar Direct Listings in {property.city}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarListings.map(p => (
              <PropertyCard
                key={p.id}
                property={p}
                isFavourite={isFavourite}
                onToggleFavourite={onToggleFavourite}
                onToggleCompare={onToggleCompare}
                onSelect={onSelectProperty}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
