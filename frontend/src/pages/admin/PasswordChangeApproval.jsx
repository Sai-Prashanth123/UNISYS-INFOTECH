import React, { useState, useEffect } from 'react';
import { passwordChangeAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Lock, CheckCircle, XCircle, Clock, AlertCircle, User, Calendar } from 'lucide-react';

export const PasswordChangeApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('Pending');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = filter !== 'All' ? { status: filter } : {};
      const response = await passwordChangeAPI.getAllRequests(params);
      setRequests(response.data.data.requests || []);
    } catch (error) {
      toast.error('Failed to fetch password change requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, userName) => {
    if (!window.confirm(`Approve password change for ${userName}?`)) {
      return;
    }

    try {
      await passwordChangeAPI.approveRequest(requestId);
      toast.success(`Password change approved for ${userName}`);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await passwordChangeAPI.rejectRequest(selectedRequest._id, { reason: rejectReason });
      toast.success(`Password change rejected for ${selectedRequest.userId.name}`);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      Approved: 'bg-green-500/10 text-green-400 border-green-500/30',
      Rejected: 'bg-red-500/10 text-red-400 border-red-500/30'
    };
    return badges[status] || badges.Pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock size={16} />;
      case 'Approved':
        return <CheckCircle size={16} />;
      case 'Rejected':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      employer: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      employee: 'bg-green-500/10 text-green-400 border-green-500/30'
    };
    return badges[role] || badges.employee;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Password Change Requests</h1>
          <p className="text-sm md:text-base text-slate-400">Review and approve password change requests from users</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 mb-4 md:mb-6 flex flex-wrap gap-2">
          {['Pending', 'Approved', 'Rejected', 'All'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 md:px-6 py-2 rounded-lg font-medium transition text-sm ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No {filter !== 'All' ? filter.toLowerCase() : ''} requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Requested</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Reviewed</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-slate-700/20 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {request.userId?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{request.userId?.name}</p>
                            <p className="text-slate-400 text-sm">{request.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadge(request.userId?.role)}`}>
                          {request.userId?.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Calendar size={16} />
                          <span>{new Date(request.requestedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(request.requestedAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {request.reviewedAt ? (
                          <div>
                            <p className="text-slate-300 text-sm">
                              {new Date(request.reviewedAt).toLocaleDateString()}
                            </p>
                            {request.reviewedBy && (
                              <p className="text-slate-500 text-xs">
                                by {request.reviewedBy.name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {request.status === 'Pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(request._id, request.userId?.name)}
                              className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/40 transition"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleRejectClick(request)}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : request.status === 'Rejected' && request.reason ? (
                          <div className="max-w-xs">
                            <p className="text-xs text-slate-400 mb-1">Reason:</p>
                            <p className="text-sm text-red-300">{request.reason}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1d35] border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Reject Request</h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <XCircle className="text-slate-400" size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-slate-300 mb-4">
                Rejecting password change request for <span className="font-bold text-white">{selectedRequest?.userId?.name}</span>
              </p>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                placeholder="Provide a reason for rejecting this request..."
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRejectSubmit}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Reject Request
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-6 py-3 bg-white/10 text-slate-300 rounded-lg hover:bg-white/15 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
