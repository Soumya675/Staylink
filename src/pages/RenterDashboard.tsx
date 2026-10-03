import React, { useState, useEffect } from 'react';
import { User, Property, Enquiry, VisitRequest } from '../types';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import {
  Heart,
  Calendar,
  MessageSquare,
  ArrowRightLeft,
  User as UserIcon,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Building,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface RenterDashboardProps {
  currentUser: User;
  allProperties: Property[];
  favourites: string[];
  comparedProperties: Property[];
  onToggleFavourite: (id: string) => void;
  onToggleCompare: (property: Property) => void;
  onSelectProperty: (id: string) => void;
  onOpenCompareModal: () => void;
}

export const RenterDashboard: React.FC<RenterDashboardProps> = ({
  currentUser,
  allProperties,
  favourites,
  comparedProperties,
  onToggleFavourite,
  onToggleCompare,
  onSelectProperty,
  onOpenCompareModal
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'favourites' | 'visits' | 'enquiries' | 'profile'>('overview');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [enqData, visData] = await Promise.all([
        api.getEnquiries(currentUser.id, 'renter'),
        api.getVisitRequests(currentUser.id, 'renter')
      ]);
      setEnquiries(enqData);
      setVisits(visData);
      if (enqData.length > 0 && !activeChatId) {
        setActiveChatId(enqData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId || !replyText.trim()) return;

    setSendingReply(true);
    try {
      await api.replyToEnquiry(activeChatId, {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: 'renter',
        message: replyText
      });
      setReplyText('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const favouriteProperties = allProperties.filter(p => favourites.includes(p.id));
  const activeEnquiry = enquiries.find(e => e.id === activeChatId) || enquiries[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentUser.name}</h1>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified Renter
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.email} · {currentUser.phone} · Member since {currentUser.memberSince}
            </p>
          </div>
        </div>

        {/* Comparison Trigger if queued */}
        {comparedProperties.length > 0 && (
          <button
            onClick={onOpenCompareModal}
            className="px-3.5 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Compare Selected ({comparedProperties.length}/3)</span>
          </button>
        )}
      </div>

      {/* Segmented Navigation Bar */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-xl text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-center rounded-md transition-colors ${
            activeTab === 'overview' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('favourites')}
          className={`flex-1 py-2 text-center rounded-md transition-colors ${
            activeTab === 'favourites' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Saved Homes ({favourites.length})
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`flex-1 py-2 text-center rounded-md transition-colors ${
            activeTab === 'visits' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Visit Requests ({visits.length})
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`flex-1 py-2 text-center rounded-md transition-colors ${
            activeTab === 'enquiries' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Messages ({enquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 text-center rounded-md transition-colors ${
            activeTab === 'profile' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Tab: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Saved Favourites</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {favourites.length}
              </p>
              <button
                onClick={() => setActiveTab('favourites')}
                className="text-[11px] text-blue-600 font-medium mt-2 hover:underline inline-block"
              >
                View saved properties →
              </button>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Active Visit Appointments</span>
              <p className="text-2xl font-bold font-mono text-blue-600 mt-1 tabular-nums">
                {visits.filter(v => v.status === 'confirmed' || v.status === 'pending').length}
              </p>
              <button
                onClick={() => setActiveTab('visits')}
                className="text-[11px] text-blue-600 font-medium mt-2 hover:underline inline-block"
              >
                View appointment schedule →
              </button>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Direct Owner Conversations</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
                {enquiries.length}
              </p>
              <button
                onClick={() => setActiveTab('enquiries')}
                className="text-[11px] text-blue-600 font-medium mt-2 hover:underline inline-block"
              >
                Open message inbox →
              </button>
            </div>
          </div>

          {/* Upcoming Visits Alert */}
          {visits.filter(v => v.status === 'confirmed').length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Confirmed Visit Scheduled</span>
              </div>
              {visits.filter(v => v.status === 'confirmed').slice(0, 1).map(v => (
                <div key={v.id} className="text-xs text-emerald-950 flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <p className="font-bold">{v.propertyTitle}</p>
                    <p className="text-emerald-800 mt-0.5">
                      📅 Date: {v.visitDate} · ⏰ {v.visitTimeSlot}
                    </p>
                    {v.ownerNotes && (
                      <p className="text-[11px] text-emerald-900 font-medium mt-1">
                        Owner instructions: "{v.ownerNotes}"
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onSelectProperty(v.propertyId)}
                    className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 h-fit"
                  >
                    View Listing
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recent Saved Properties preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Your Recently Saved Properties</h3>
              {favouriteProperties.length > 3 && (
                <button
                  onClick={() => setActiveTab('favourites')}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  View all ({favouriteProperties.length})
                </button>
              )}
            </div>

            {favouriteProperties.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                You haven't saved any properties yet. Browse rentals to save your favourites!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favouriteProperties.slice(0, 3).map(prop => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    isFavourite={true}
                    isCompared={comparedProperties.some(c => c.id === prop.id)}
                    onToggleFavourite={onToggleFavourite}
                    onToggleCompare={onToggleCompare}
                    onSelect={onSelectProperty}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: SAVED HOMES */}
      {activeTab === 'favourites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Saved Accommodation ({favouriteProperties.length})
            </h2>
            {comparedProperties.length > 0 && (
              <button
                onClick={onOpenCompareModal}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
              >
                Compare ({comparedProperties.length}/3)
              </button>
            )}
          </div>

          {favouriteProperties.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No saved homes yet</p>
              <p className="text-xs text-slate-500">
                Click the heart icon on any listing to save it here for fast comparison.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favouriteProperties.map(prop => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isFavourite={true}
                  isCompared={comparedProperties.some(c => c.id === prop.id)}
                  onToggleFavourite={onToggleFavourite}
                  onToggleCompare={onToggleCompare}
                  onSelect={onSelectProperty}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: VISITS */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Physical Property Visit Requests ({visits.length})
          </h2>

          {visits.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No scheduled visits yet</p>
              <p className="text-xs text-slate-500">
                Schedule a visit on any property detail page to inspect the home in person.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visits.map(v => (
                <div
                  key={v.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={v.propertyImage || '/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg'}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover bg-slate-100"
                    />
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-slate-900">{v.propertyTitle}</h4>
                      <p className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {v.propertyAddress}, {v.propertyCity}
                      </p>
                      <p className="text-slate-700 font-medium">
                        Owner: {v.ownerName} · Visit Date: <span className="font-bold">{v.visitDate}</span> ({v.visitTimeSlot})
                      </p>
                      {v.ownerNotes && (
                        <p className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                          Owner Note: "{v.ownerNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                        v.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      ● {v.status}
                    </span>

                    <button
                      onClick={() => onSelectProperty(v.propertyId)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View Listing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: ENQUIRIES & CHAT */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Direct Homeowner Messages ({enquiries.length})
          </h2>

          {enquiries.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No messages yet</p>
              <p className="text-xs text-slate-500">
                Send enquiries directly to owners from any listing page.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[500px]">
              {/* Left Conversation List */}
              <div className="border-r border-slate-200 divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
                {enquiries.map(enq => (
                  <div
                    key={enq.id}
                    onClick={() => setActiveChatId(enq.id)}
                    className={`p-4 cursor-pointer text-xs transition-colors ${
                      activeChatId === enq.id ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span className="truncate">{enq.ownerName}</span>
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

              {/* Right Conversation Window */}
              {activeEnquiry ? (
                <div className="md:col-span-2 flex flex-col justify-between h-[600px] p-4">
                  {/* Chat header */}
                  <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{activeEnquiry.propertyTitle}</h4>
                      <p className="text-[11px] text-slate-500">
                        Chatting with Homeowner: <span className="font-semibold text-slate-800">{activeEnquiry.ownerName}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectProperty(activeEnquiry.propertyId)}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      View Property
                    </button>
                  </div>

                  {/* Messages Bubble List */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {activeEnquiry.replies.map(rep => {
                      const isMe = rep.senderRole === 'renter';
                      return (
                        <div
                          key={rep.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-md p-3 rounded-xl text-xs ${
                              isMe
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

                  {/* Reply Input Form */}
                  <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-200 flex gap-2">
                    <input
                      type="text"
                      required
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Write your response to the owner..."
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="submit"
                      disabled={sendingReply}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="md:col-span-2 flex items-center justify-center text-xs text-slate-400">
                  Select a conversation on the left to read messages.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: PROFILE & SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6 max-w-2xl">
          <h2 className="text-base font-bold text-slate-900">Profile & Notification Settings</h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Full Legal Name</label>
              <input
                type="text"
                defaultValue={currentUser.name}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                readOnly
                defaultValue={currentUser.email}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Phone Number (India)</label>
              <input
                type="tel"
                defaultValue={currentUser.phone}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Current City</label>
              <input
                type="text"
                defaultValue={currentUser.city || 'Bengaluru'}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => alert('Profile preferences updated!')}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-xs"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
