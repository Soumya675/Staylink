import React, { useState, useEffect } from 'react';
import { User, Property, Enquiry, VisitRequest } from '../types';
import { api } from '../services/api';
import { INDIAN_CITIES } from '../data/seedData';
import {
  Building2,
  Plus,
  Eye,
  MessageSquare,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  Upload,
  ShieldCheck,
  Check,
  Trash2,
  Edit3,
  MapPin,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

interface OwnerDashboardProps {
  currentUser: User;
  onSelectProperty: (id: string) => void;
  onRefreshProperties: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  currentUser,
  onSelectProperty,
  onRefreshProperties
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'add' | 'enquiries' | 'visits' | 'kyc'>('overview');
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Multi-step form state
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: '2 BHK',
    city: 'Bengaluru',
    locality: '',
    address: '',
    landmark: '',
    state: 'Karnataka',
    pincode: '',
    rentMonthly: 28000,
    securityDeposit: 75000,
    maintenanceCharges: 2000,
    electricityChargesNote: 'Individual BESCOM digital meter as per domestic government tariff',
    waterChargesNote: 'Cauvery connection & borewell supply included in maintenance',
    furnishing: 'Semi-Furnished',
    availableFrom: 'Immediate',
    preferredTenant: 'All',
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    superBuiltUpArea: 1150,
    carpetArea: 950,
    floorNumber: 3,
    totalFloors: 5,
    parking: 'Car & Bike',
    amenities: ['Power Backup', 'Lift', '24/7 Security Guard', 'Covered Car Parking'],
    rules: ['Direct owner agreement with zero brokerage', 'Quiet residential hours after 10:30 PM'],
    images: ['/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg']
  });

  // Chat reply state
  const [activeEnquiryId, setActiveEnquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Visit action state
  const [ownerNotes, setOwnerNotes] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await api.uploadImage(base64, file.name);
        setFormData(prev => ({
          ...prev,
          images: [res.url, ...prev.images]
        }));
      } catch (err: any) {
        alert(err.message || 'Failed to upload photo');
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    loadOwnerData();
  }, [currentUser.id]);

  const loadOwnerData = async () => {
    setLoading(true);
    try {
      const allProps = await api.getProperties();
      // Filter for this owner or demo owner
      const owned = allProps.properties.filter(
        p => p.ownerId === currentUser.id || currentUser.role === 'owner'
      );
      setMyProperties(owned);

      const [enqData, visData] = await Promise.all([
        api.getEnquiries(currentUser.id, 'owner'),
        api.getVisitRequests(currentUser.id, 'owner')
      ]);
      setEnquiries(enqData);
      setVisits(visData);
      if (enqData.length > 0 && !activeEnquiryId) {
        setActiveEnquiryId(enqData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (prop: Property) => {
    const nextStatus = prop.status === 'published' ? 'unavailable' : 'published';
    try {
      await api.updateProperty(prop.id, { status: nextStatus });
      loadOwnerData();
      onRefreshProperties();
    } catch (err: any) {
      alert(err.message || 'Failed to update property status');
    }
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProperty({
        ...formData,
        propertyType: formData.propertyType as any,
        furnishing: formData.furnishing as any,
        preferredTenant: formData.preferredTenant as any,
        parking: formData.parking as any,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        ownerEmail: currentUser.email,
        ownerPhone: currentUser.phone
      });
      alert('Listing created and published successfully!');
      setWizardStep(1);
      setActiveTab('properties');
      loadOwnerData();
      onRefreshProperties();
    } catch (err: any) {
      alert(err.message || 'Failed to submit property');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEnquiryId || !replyText.trim()) return;

    setSendingReply(true);
    try {
      await api.replyToEnquiry(activeEnquiryId, {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: 'owner',
        message: replyText
      });
      setReplyText('');
      loadOwnerData();
    } catch (err: any) {
      alert(err.message || 'Failed to reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateVisit = async (visitId: string, status: any, note?: string) => {
    try {
      await api.updateVisitRequest(visitId, {
        status,
        ownerNotes: note || 'Confirmed by owner. Gate guard informed.'
      });
      setSelectedVisitId(null);
      setOwnerNotes('');
      loadOwnerData();
    } catch (err: any) {
      alert(err.message || 'Failed to update visit');
    }
  };

  const activeEnquiry = enquiries.find(e => e.id === activeEnquiryId) || enquiries[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{currentUser.name}'s Owner Portal</h1>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Landlord
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your rental listings directly with zero broker interference · City: {currentUser.city || 'Bengaluru'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('add')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Segmented Navigation Bar */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-2xl text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-center rounded-md transition-colors ${
            activeTab === 'overview' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-2 text-center rounded-md transition-colors ${
            activeTab === 'properties' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Listings ({myProperties.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-2 text-center rounded-md transition-colors ${
            activeTab === 'add' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          + Post Property
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`flex-1 py-2 text-center rounded-md transition-colors ${
            activeTab === 'enquiries' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tenant Enquiries ({enquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`flex-1 py-2 text-center rounded-md transition-colors ${
            activeTab === 'visits' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Visit Appointments ({visits.length})
        </button>
        <button
          onClick={() => setActiveTab('kyc')}
          className={`flex-1 py-2 text-center rounded-md transition-colors ${
            activeTab === 'kyc' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Owner KYC
        </button>
      </div>

      {/* Tab: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Total Listings</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {myProperties.length}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">
                {myProperties.filter(p => p.status === 'published').length} Live
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Total Listing Views</span>
              <p className="text-2xl font-bold font-mono text-blue-600 mt-1 tabular-nums">
                {myProperties.reduce((acc, p) => acc + p.viewsCount, 0)}
              </p>
              <span className="text-[11px] text-slate-400">Across Indian searchers</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Direct Inquiries</span>
              <p className="text-2xl font-bold font-mono text-purple-600 mt-1 tabular-nums">
                {enquiries.length}
              </p>
              <button
                onClick={() => setActiveTab('enquiries')}
                className="text-[11px] text-blue-600 hover:underline block mt-0.5 font-medium"
              >
                Respond to tenants →
              </button>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Pending Visit Requests</span>
              <p className="text-2xl font-bold font-mono text-amber-600 mt-1 tabular-nums">
                {visits.filter(v => v.status === 'pending').length}
              </p>
              <button
                onClick={() => setActiveTab('visits')}
                className="text-[11px] text-blue-600 hover:underline block mt-0.5 font-medium"
              >
                Review appointments →
              </button>
            </div>
          </div>

          {/* Quick Listings Preview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Your Active Rental Listings</h3>
              <button
                onClick={() => setActiveTab('properties')}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Manage all listings
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {myProperties.map(p => (
                <div key={p.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images[0] || '/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg'}
                      alt=""
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                      <p className="text-slate-500">{p.locality}, {p.city} · ₹{new Intl.NumberFormat('en-IN').format(p.rentMonthly)}/mo</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {p.status}
                    </span>
                    <button
                      onClick={() => onSelectProperty(p.id)}
                      className="px-2.5 py-1 text-slate-700 border border-slate-200 rounded hover:bg-slate-50"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleToggleStatus(p)}
                      className="px-2.5 py-1 text-slate-700 border border-slate-200 rounded hover:bg-slate-50"
                    >
                      {p.status === 'published' ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: MY LISTINGS */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              My Rental Listings ({myProperties.length})
            </h2>
            <button
              onClick={() => setActiveTab('add')}
              className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
            >
              + Add Property
            </button>
          </div>

          <div className="space-y-3">
            {myProperties.map(prop => (
              <div
                key={prop.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex gap-4">
                  <img
                    src={prop.images[0] || '/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg'}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover bg-slate-100"
                  />
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{prop.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        prop.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {prop.status}
                      </span>
                    </div>

                    <p className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {prop.address || prop.locality}, {prop.locality}, {prop.city}
                    </p>

                    <div className="text-slate-700 font-mono font-bold tabular-nums">
                      ₹{new Intl.NumberFormat('en-IN').format(prop.rentMonthly)} / mo · Deposit: ₹{new Intl.NumberFormat('en-IN').format(prop.securityDeposit)}
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Views: {prop.viewsCount} · Enquiries: {prop.enquiriesCount} · Zero Brokerage
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => onSelectProperty(prop.id)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View Listing
                  </button>

                  <button
                    onClick={() => handleToggleStatus(prop)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    {prop.status === 'published' ? (
                      <>
                        <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Mark Unavailable</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Reactivate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: ADD PROPERTY MULTI-STEP WIZARD */}
      {activeTab === 'add' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">List Your Property on StayLink</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect directly with genuine tenants across India with 100% zero brokerage.
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-5 gap-1.5 text-center text-xs border-b border-slate-100 pb-4">
            <div className={`p-2 rounded-lg font-semibold ${wizardStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              1. Specs
            </div>
            <div className={`p-2 rounded-lg font-semibold ${wizardStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              2. Location
            </div>
            <div className={`p-2 rounded-lg font-semibold ${wizardStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              3. Pricing
            </div>
            <div className={`p-2 rounded-lg font-semibold ${wizardStep === 4 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              4. Photos
            </div>
            <div className={`p-2 rounded-lg font-semibold ${wizardStep === 5 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              5. Publish
            </div>
          </div>

          <form onSubmit={handleCreateProperty} className="space-y-4">
            {/* Step 1: Basic Info */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Property Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Spacious 2 BHK with Balcony near HSR Sector 2"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Property Type</label>
                    <select
                      value={formData.propertyType}
                      onChange={e => setFormData({ ...formData, propertyType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs"
                    >
                      <option value="1 RK">1 RK Room</option>
                      <option value="1 BHK">1 BHK Flat</option>
                      <option value="2 BHK">2 BHK Apartment</option>
                      <option value="3 BHK">3 BHK Luxury Flat</option>
                      <option value="PG / Co-Living">PG & Co-Living</option>
                      <option value="Independent House / Villa">Independent Villa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Furnishing Status</label>
                    <select
                      value={formData.furnishing}
                      onChange={e => setFormData({ ...formData, furnishing: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs"
                    >
                      <option value="Furnished">Fully Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={e => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={e => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Balconies</label>
                    <input
                      type="number"
                      value={formData.balconies}
                      onChange={e => setFormData({ ...formData, balconies: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe sunlight, kitchen fixtures, floor level, society environment, and nearby public transport."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.title || !formData.description) alert('Please fill in title and description');
                      else setWizardStep(2);
                    }}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold"
                  >
                    Next: Location Details →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City</label>
                    <select
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                    >
                      {INDIAN_CITIES.map(c => (
                        <option key={c.name} value={c.name}>{c.name} ({c.state})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Locality / Sector</label>
                    <input
                      type="text"
                      required
                      value={formData.locality}
                      onChange={e => setFormData({ ...formData, locality: e.target.value })}
                      placeholder="e.g. HSR Sector 2, Koramangala 4th Block"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Flat 302, Green Glen Towers, 14th Main"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Landmark</label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                      placeholder="e.g. Opposite BDA Complex"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="560102"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.locality || !formData.address) alert('Please provide locality and address');
                      else setWizardStep(3);
                    }}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold"
                  >
                    Next: Pricing & Terms →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Pricing & Terms */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.rentMonthly}
                      onChange={e => setFormData({ ...formData, rentMonthly: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Security Deposit (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.securityDeposit}
                      onChange={e => setFormData({ ...formData, securityDeposit: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Maintenance (₹/mo)</label>
                    <input
                      type="number"
                      value={formData.maintenanceCharges}
                      onChange={e => setFormData({ ...formData, maintenanceCharges: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Electricity Meter Terms</label>
                  <input
                    type="text"
                    value={formData.electricityChargesNote}
                    onChange={e => setFormData({ ...formData, electricityChargesNote: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Water Supply Terms</label>
                  <input
                    type="text"
                    value={formData.waterChargesNote}
                    onChange={e => setFormData({ ...formData, waterChargesNote: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>StayLink Zero-Brokerage Covenant: Listing on StayLink confirms you will not charge or demand brokerage from renters.</span>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold"
                  >
                    Next: Property Photos →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Photos & Amenities */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Upload Property Photographs (Max 5MB per image)
                  </label>
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50 hover:bg-slate-100/60 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                    <p className="font-semibold text-slate-800">
                      {uploadingPhoto ? 'Uploading and optimizing photo...' : 'Click to select photo or drag and drop'}
                    </p>
                    <p className="text-[11px] text-slate-400">JPEG, PNG, or WebP</p>
                  </div>
                </div>

                {/* Photos Preview Strip */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-600">Selected Photos ({formData.images.length}):</span>
                  <div className="flex gap-2.5 overflow-x-auto pt-2 pb-1">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full text-[10px]"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(5)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold"
                  >
                    Next: Review & Publish →
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Review & Publish */}
            {wizardStep === 5 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{formData.title}</span>
                    <span className="font-mono font-bold text-blue-600">
                      ₹{new Intl.NumberFormat('en-IN').format(formData.rentMonthly)} / mo
                    </span>
                  </div>
                  <p className="text-slate-600">{formData.locality}, {formData.city}</p>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>{formData.propertyType}</span>
                    <span>·</span>
                    <span>{formData.furnishing}</span>
                    <span>·</span>
                    <span>Deposit: ₹{new Intl.NumberFormat('en-IN').format(formData.securityDeposit)}</span>
                  </div>
                  {formData.images[0] && (
                    <img src={formData.images[0]} alt="" className="w-full h-36 object-cover rounded-lg" />
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                  >
                    Publish Listing Free
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tab: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Tenant Enquiries & Messages ({enquiries.length})
          </h2>

          {enquiries.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No tenant enquiries yet</p>
              <p className="text-xs text-slate-500">
                When prospective renters enquire about your listings, their messages will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[500px]">
              {/* Left List */}
              <div className="border-r border-slate-200 divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
                {enquiries.map(enq => (
                  <div
                    key={enq.id}
                    onClick={() => setActiveEnquiryId(enq.id)}
                    className={`p-4 cursor-pointer text-xs transition-colors ${
                      activeEnquiryId === enq.id ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span className="truncate">{enq.renterName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 truncate">{enq.propertyTitle}</p>
                    <p className="text-slate-500 text-[11px] truncate mt-1">
                      {enq.replies[enq.replies.length - 1]?.message || enq.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Right Conversation Area */}
              {activeEnquiry ? (
                <div className="md:col-span-2 flex flex-col justify-between h-[600px] p-4">
                  <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Enquiry from {activeEnquiry.renterName}</h4>
                      <p className="text-[11px] text-slate-500">
                        Phone: {activeEnquiry.renterPhone} · Email: {activeEnquiry.renterEmail}
                      </p>
                    </div>
                    <span className="text-xs font-bold font-mono text-blue-600">
                      ₹{new Intl.NumberFormat('en-IN').format(activeEnquiry.propertyRent)} / mo
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {activeEnquiry.replies.map(rep => {
                      const isOwner = rep.senderRole === 'owner';
                      return (
                        <div
                          key={rep.id}
                          className={`flex flex-col ${isOwner ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-md p-3 rounded-xl text-xs ${
                              isOwner
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-slate-100 text-slate-900 rounded-bl-none'
                            }`}
                          >
                            <p className="font-semibold text-[10px] opacity-80 mb-0.5">
                              {rep.senderName} ({rep.senderRole})
                            </p>
                            <p>{rep.message}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-200 flex gap-2">
                    <input
                      type="text"
                      required
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Write your response to the tenant..."
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="submit"
                      disabled={sendingReply}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="md:col-span-2 flex items-center justify-center text-xs text-slate-400">
                  Select a tenant conversation on the left.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: VISITS */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Tenant Visit Requests ({visits.length})
          </h2>

          <div className="space-y-3">
            {visits.map(vis => (
              <div
                key={vis.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-slate-900">{vis.propertyTitle}</h4>
                  <p className="text-slate-600">
                    Tenant: <strong>{vis.renterName}</strong> · Phone: {vis.renterPhone}
                  </p>
                  <p className="text-slate-800 font-medium">
                    Requested Date: <span className="font-bold text-blue-600">{vis.visitDate}</span> ({vis.visitTimeSlot})
                  </p>
                  {vis.notes && (
                    <p className="text-[11px] text-slate-500 italic">Tenant note: "{vis.notes}"</p>
                  )}
                  {vis.ownerNotes && (
                    <p className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Gate note: "{vis.ownerNotes}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                    vis.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    ● {vis.status}
                  </span>

                  {vis.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateVisit(vis.id, 'confirmed', 'Confirmed! Gate security Shankar informed.')}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                      >
                        Confirm Slot
                      </button>
                      <button
                        onClick={() => handleUpdateVisit(vis.id, 'cancelled', 'Slot not available.')}
                        className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: OWNER KYC */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Owner Verification & Trust Badge</h2>
              <p className="text-xs text-slate-500">
                Verified homeowners receive 3.5x more inquiries and high trust ranking.
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Electricity Bill & Ownership Verified</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Your registered mobile (+91 98234 56789) and electricity consumer account matching Koramangala 4th block have been authenticated.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900">Submitted Verification Records</h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">BESCOM Electricity Consumer Bill</p>
                <p className="text-[11px] text-slate-500">Consumer Account #584920194 · Verified</p>
              </div>
              <span className="text-emerald-700 font-bold">Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
