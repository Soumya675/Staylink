import React, { useState, useEffect } from 'react';
import { User, Property, Report, AuditLog } from '../types';
import { api } from '../services/api';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Building,
  FileText,
  Search,
  Eye,
  Check,
  X,
  History
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onSelectProperty: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onSelectProperty
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'reports' | 'users' | 'audit'>('queue');
  const [stats, setStats] = useState<any>({});
  const [reviewQueue, setReviewQueue] = useState<Property[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sData, qData, rData, uData, aData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminReviewQueue(),
        api.getAdminReports(),
        api.getAdminUsers(),
        api.getAdminAuditLogs()
      ]);
      setStats(sData);
      setReviewQueue(qData);
      setReports(rData);
      setUsersList(uData);
      setAuditLogs(aData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (propertyId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectReason.trim()) {
      alert('Mandatory reason required when rejecting a listing');
      return;
    }

    try {
      await api.reviewProperty(propertyId, action, rejectReason);
      setRejectingId(null);
      setRejectReason('');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Review action failed');
    }
  };

  const handleUpdateReport = async (reportId: string, status: string) => {
    try {
      await api.updateReport(reportId, status, 'Investigated and resolved by trust team.');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Report action failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold">StayLink Trust & Moderation Console</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enforcing zero-brokerage compliance, ownership verification, and anti-fraud monitoring.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          Admin: {currentUser.name}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Pending Review</span>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1 tabular-nums">
            {stats.pendingReviews || reviewQueue.length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Active Complaints</span>
          <p className="text-2xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
            {reports.filter(r => r.status === 'pending').length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Published Listings</span>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {stats.publishedListings || 8}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Registered Users</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {usersList.length}
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex-1 py-2 rounded-md transition-colors ${
            activeTab === 'queue' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Review Queue ({reviewQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 rounded-md transition-colors ${
            activeTab === 'reports' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Reported Listings ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 rounded-md transition-colors ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          User Accounts ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 rounded-md transition-colors ${
            activeTab === 'audit' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* Tab: REVIEW QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Pending Property Listing Moderation Queue
          </h2>

          {reviewQueue.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800">Queue is completely clear!</p>
              <p className="text-xs text-slate-500">All submissions have been reviewed and validated.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviewQueue.map(item => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.images[0] || '/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg'}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover bg-slate-100"
                    />
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-slate-600">
                        {item.propertyType} · {item.locality}, {item.city} · Rent: ₹{new Intl.NumberFormat('en-IN').format(item.rentMonthly)}/mo
                      </p>
                      <p className="text-slate-500">
                        Owner: <strong>{item.ownerName}</strong> ({item.ownerEmail} · {item.ownerPhone})
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    <button
                      onClick={() => onSelectProperty(item.id)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                    >
                      Preview Listing
                    </button>

                    <button
                      onClick={() => handleReviewAction(item.id, 'approve')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Verify</span>
                    </button>

                    <button
                      onClick={() => setRejectingId(rejectingId === item.id ? null : item.id)}
                      className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                    >
                      Reject...
                    </button>
                  </div>
                </div>
              ))}

              {rejectingId && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3 animate-in fade-in">
                  <label className="block text-xs font-bold text-rose-900">
                    Mandatory Reason for Rejection / Correction Request
                  </label>
                  <input
                    type="text"
                    required
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="e.g. Unclear photos, mismatched ownership documentation, or duplicate listing."
                    className="w-full px-3 py-2 text-xs border border-rose-300 rounded-lg bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setRejectingId(null)}
                      className="px-3 py-1 text-xs text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReviewAction(rejectingId, 'reject')}
                      className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Tenant & Community Complaints ({reports.length})
          </h2>

          <div className="space-y-3">
            {reports.map(rep => (
              <div
                key={rep.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rep.propertyTitle}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                      {rep.reason.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Reported by: {rep.reporterName} ({rep.reporterEmail})
                  </p>
                  <p className="text-slate-800 font-medium">Details: "{rep.details}"</p>
                  {rep.adminNotes && (
                    <p className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Resolution note: "{rep.adminNotes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    ● {rep.status}
                  </span>

                  {rep.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateReport(rep.id, 'resolved')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Registered Marketplace Users</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold text-slate-600">Name & Email</th>
                <th className="py-3 px-4 font-semibold text-slate-600">Phone</th>
                <th className="py-3 px-4 font-semibold text-slate-600">Role</th>
                <th className="py-3 px-4 font-semibold text-slate-600">City</th>
                <th className="py-3 px-4 font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map(u => (
                <tr key={u.id}>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{u.phone}</td>
                  <td className="py-3 px-4 uppercase font-semibold text-slate-700">{u.role}</td>
                  <td className="py-3 px-4 text-slate-700">{u.city || 'India'}</td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <span>Marketplace Moderation Audit Trail</span>
          </h2>
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono font-bold text-blue-600 uppercase text-[11px]">{log.action}</span>
                  <p className="text-slate-800 mt-0.5">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Admin: {log.adminName}</p>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
