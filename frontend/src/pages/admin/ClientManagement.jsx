import React from 'react';
import { useThemeStore } from '../../store/index.js';
import { clientAPI, adminAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Search, Download, FileText, Upload, X } from 'lucide-react';

export const ClientManagement = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [clients, setClients] = React.useState([]);
  const [activeClients, setActiveClients] = React.useState([]);
  const [inactiveClients, setInactiveClients] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [totalClients, setTotalClients] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalActive, setTotalActive] = React.useState(0);
  const [totalInactive, setTotalInactive] = React.useState(0);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [sowFile, setSowFile] = React.useState(null); // File object for new client creation
  // Multi-SOW state
  const [sowPanelClient, setSowPanelClient] = React.useState(null); // { id, name }
  const [clientSows, setClientSows] = React.useState([]);
  const [sowsLoading, setSowsLoading] = React.useState(false);
  const [sowUploadFile, setSowUploadFile] = React.useState(null);
  const [sowUploadLabel, setSowUploadLabel] = React.useState('');
  const [sowUploading, setSowUploading] = React.useState(false);
  // Inline SOW list shown inside edit form
  const [editSows, setEditSows] = React.useState([]);
  const [editSowsLoading, setEditSowsLoading] = React.useState(false);
  const [editSowFile, setEditSowFile] = React.useState(null);
  const [editSowLabel, setEditSowLabel] = React.useState('');
  const [editSowUploading, setEditSowUploading] = React.useState(false);
  // Refs to clear file inputs after upload
  const sowPanelFileRef = React.useRef(null);
  const editSowFileRef = React.useRef(null);
  const newClientSowFileRef = React.useRef(null);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    sowName: '',
    resourceName: '',
    contactPerson: '',
    phone: '',
    address: '',
    technology: '',
    onboardingDate: '',
    offboardingDate: '',
    status: 'active',
    billingRatePerHr: '',
    share1Name: '',
    share1HrRate: '',
    share2Name: '',
    share2HrRate: '',
    share3Name: '',
    share3HrRate: '',
    unisysHold: '',
    unisysShareHrRate: '',
    assignedUsers: [] // [{ userId, hrRate }]
  });

  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  React.useEffect(() => {
    fetchClients();
  }, [search, page]);

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await clientAPI.getAll({ search, page, limit: 1000 });
      const fetched = response.data.clients || [];
      setClients(fetched);
      setActiveClients(fetched.filter(c => c.status === 'active'));
      setInactiveClients(fetched.filter(c => c.status === 'inactive'));
      setTotalClients(response.data.total || fetched.length);
      setTotalPages(response.data.pages || 1);
      // Compute active/inactive from total if on single page, otherwise use page counts
      setTotalActive(fetched.filter(c => c.status === 'active').length);
      setTotalInactive(fetched.filter(c => c.status === 'inactive').length);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Admin-only endpoint; returns employers + employees + others
      const res = await adminAPI.getUsers({});
      const list = res.data.users || [];
      const filtered = list.filter(u => u.role === 'employee' || u.role === 'employer');
      setUsers(filtered);
    } catch (e) {
      // non-fatal
      setUsers([]);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await clientAPI.update(editingId, formData);
        toast.success('Client updated successfully');
      } else {
        const created = await clientAPI.create(formData);
        const newId = created?.data?.client?._id || created?.data?.client?.id || created?.data?.client?.clientId;
        if (newId && sowFile) {
          const dataUrl = await readFileAsBase64(sowFile);
          const base64Data = dataUrl.split(',')[1] || dataUrl;
          // Save directly to multi-SOW table as SOW1 (single source of truth)
          await clientAPI.uploadNewSow(newId, {
            sowLabel: 'SOW1',
            fileName: sowFile.name,
            contentType: sowFile.type,
            base64Data
          });
          setSowFile(null);
          if (newClientSowFileRef.current) newClientSowFileRef.current.value = '';
        }
        toast.success('Client created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setSowFile(null);
      setEditSows([]);
      setEditSowFile(null);
      setEditSowLabel('');
      setFormData({
        name: '',
        email: '',
        sowName: '',
        resourceName: '',
        contactPerson: '',
        phone: '',
        address: '',
        technology: '',
        onboardingDate: '',
        offboardingDate: '',
        status: 'active',
        billingRatePerHr: '',
        share1Name: '',
        share1HrRate: '',
        share2Name: '',
        share2HrRate: '',
        share3Name: '',
        share3HrRate: '',
        unisysHold: '',
        unisysShareHrRate: '',
        assignedUsers: []
      });
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    const id = client._id || client.id;
    if (!id) {
      toast.error('Unable to edit: missing client id');
      return;
    }
    // Fetch full client details (includes assignedUsers) to prevent wiping assignments on edit
    clientAPI.getById(id).then((resp) => {
      const full = resp.data.client || client;
      setSowFile(null);
      setEditSows(full.sowDocuments || []);
      setEditSowFile(null);
      setEditSowLabel('');
      setFormData({
        ...full,
        sowName: full.sowName || full.industry || '',
        resourceName: full.resourceName || '',
        billingRatePerHr: full.billingRatePerHr ?? '',
        share1Name: full.share1Name || '',
        share1HrRate: full.share1HrRate ?? '',
        share2Name: full.share2Name || '',
        share2HrRate: full.share2HrRate ?? '',
        share3Name: full.share3Name || '',
        share3HrRate: full.share3HrRate ?? '',
        unisysHold: full.unisysHold ?? '',
        unisysShareHrRate: full.unisysShareHrRate ?? '',
        assignedUsers: full.assignedUsers || []
      });
      setEditingId(id);
      setShowForm(true);
    }).catch((err) => {
      const status = err?.response?.status;
      if (status === 404) {
        toast.error('Client not found. Refreshing list…');
        fetchClients();
        return;
      }
      // Fallback to existing data
      setSowFile(null);
      setEditSows([]);
      setEditSowFile(null);
      setEditSowLabel('');
      setFormData({
        ...client,
        sowName: client.sowName || client.industry || '',
        resourceName: client.resourceName || '',
        billingRatePerHr: client.billingRatePerHr ?? '',
        share1Name: client.share1Name || '',
        share1HrRate: client.share1HrRate ?? '',
        share2Name: client.share2Name || '',
        share2HrRate: client.share2HrRate ?? '',
        share3Name: client.share3Name || '',
        share3HrRate: client.share3HrRate ?? '',
        unisysHold: client.unisysHold ?? '',
        unisysShareHrRate: client.unisysShareHrRate ?? '',
        assignedUsers: client.assignedUsers || []
      });
      setEditingId(id);
      setShowForm(true);
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientAPI.delete(id);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  // ── Multi-SOW management ──
  const openSowPanel = async (client) => {
    const id = client._id || client.id;
    setSowPanelClient({ id, name: client.name });
    setSowUploadFile(null);
    setSowUploadLabel('');
    await fetchClientSows(id);
  };

  const closeSowPanel = () => {
    setSowPanelClient(null);
    setClientSows([]);
    setSowUploadFile(null);
    setSowUploadLabel('');
    // Refresh client list so SOW counts are up to date
    fetchClients();
  };

  const fetchClientSows = async (clientId) => {
    setSowsLoading(true);
    try {
      const res = await clientAPI.getSows(clientId);
      setClientSows(res.data.sows || []);
    } catch (error) {
      toast.error('Failed to fetch SOW documents');
      setClientSows([]);
    } finally {
      setSowsLoading(false);
    }
  };

  const handleSowUpload = async () => {
    if (!sowPanelClient || !sowUploadFile) return;
    setSowUploading(true);
    try {
      const dataUrl = await readFileAsBase64(sowUploadFile);
      const base64Data = dataUrl.split(',')[1] || dataUrl;
      await clientAPI.uploadNewSow(sowPanelClient.id, {
        sowLabel: sowUploadLabel.trim() || '',
        fileName: sowUploadFile.name,
        contentType: sowUploadFile.type,
        base64Data
      });
      toast.success('SOW document uploaded successfully');
      setSowUploadFile(null);
      setSowUploadLabel('');
      if (sowPanelFileRef.current) sowPanelFileRef.current.value = '';
      await fetchClientSows(sowPanelClient.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload SOW document');
    } finally {
      setSowUploading(false);
    }
  };

  const handleSowDelete = async (sowId, sowLabel) => {
    if (!sowPanelClient) return;
    if (!window.confirm(`Delete ${sowLabel}? This cannot be undone.`)) return;
    try {
      await clientAPI.deleteSow(sowPanelClient.id, sowId);
      toast.success(`${sowLabel} deleted`);
      await fetchClientSows(sowPanelClient.id);
    } catch (error) {
      toast.error('Failed to delete SOW document');
    }
  };

  // ── Inline SOW management (inside edit form) ──
  const fetchEditSows = async (clientId) => {
    setEditSowsLoading(true);
    try {
      const res = await clientAPI.getSows(clientId);
      setEditSows(res.data.sows || []);
    } catch {
      setEditSows([]);
    } finally {
      setEditSowsLoading(false);
    }
  };

  const handleEditSowUpload = async () => {
    if (!editingId || !editSowFile) return;
    setEditSowUploading(true);
    try {
      const dataUrl = await readFileAsBase64(editSowFile);
      const base64Data = dataUrl.split(',')[1] || dataUrl;
      await clientAPI.uploadNewSow(editingId, {
        sowLabel: editSowLabel.trim() || '',
        fileName: editSowFile.name,
        contentType: editSowFile.type,
        base64Data
      });
      toast.success('SOW document uploaded successfully');
      setEditSowFile(null);
      setEditSowLabel('');
      if (editSowFileRef.current) editSowFileRef.current.value = '';
      await fetchEditSows(editingId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload SOW');
    } finally {
      setEditSowUploading(false);
    }
  };

  const handleEditSowDelete = async (sowId, sowLabel) => {
    if (!editingId) return;
    if (!window.confirm(`Delete ${sowLabel}? This cannot be undone.`)) return;
    try {
      await clientAPI.deleteSow(editingId, sowId);
      toast.success(`${sowLabel} deleted`);
      await fetchEditSows(editingId);
    } catch {
      toast.error('Failed to delete SOW document');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 break-words">Client Management</h1>
            <p className="text-sm sm:text-base text-slate-300">Manage your client database</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setSowFile(null);
              setEditSows([]);
              setEditSowFile(null);
              setEditSowLabel('');
              setFormData({
                name: '',
                email: '',
                sowName: '',
                resourceName: '',
                contactPerson: '',
                phone: '',
                address: '',
                technology: '',
                onboardingDate: '',
                offboardingDate: '',
                status: 'active',
                billingRatePerHr: '',
                share1Name: '',
                share1HrRate: '',
                share2Name: '',
                share2HrRate: '',
                share3Name: '',
                share3HrRate: '',
                unisysHold: '',
                unisysShareHrRate: '',
                assignedUsers: []
              });
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 min-h-[44px] w-full sm:w-auto"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" /> <span>Add Client</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 sm:mb-6 flex gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search clients..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-sm sm:text-base text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px]"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300">
            <p className="text-xs sm:text-sm font-medium text-slate-200">Total Clients</p>
            <p className="text-3xl sm:text-4xl font-bold mt-2 text-white">{totalClients}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300">
            <p className="text-xs sm:text-sm font-medium text-slate-200">Active Clients</p>
            <p className="text-3xl sm:text-4xl font-bold mt-2 text-green-400">{totalActive}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300">
            <p className="text-xs sm:text-sm font-medium text-slate-200">Inactive Clients</p>
            <p className="text-3xl sm:text-4xl font-bold mt-2 text-red-400">{totalInactive}</p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">
              {editingId ? 'Edit Client' : 'Add New Client'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-slate-200">Client Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-sm sm:text-base text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">SOW Name *</label>
                  <input
                    type="text"
                    name="sowName"
                    value={formData.sowName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-slate-200">Client Onboarding SOW Documents</label>
                  {editingId ? (
                    <div className="space-y-3">
                      {/* Existing SOW Documents List */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                            <FileText size={16} />
                            Existing SOW Documents
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full">
                              {editSows.length}
                            </span>
                          </span>
                          {editSowsLoading && <span className="text-xs text-slate-500">Loading...</span>}
                        </div>
                        {editSows.length === 0 && !editSowsLoading ? (
                          <p className="text-sm text-slate-500 py-3">No SOW documents uploaded yet. Upload the first one below.</p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {editSows.map((sow) => (
                              <div key={sow.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                <FileText size={14} className="text-indigo-400 flex-shrink-0" />
                                <span className="text-xs font-semibold text-indigo-300 whitespace-nowrap">{sow.sowLabel}</span>
                                <span className="text-xs text-white truncate flex-1">{sow.fileName}</span>
                                <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(sow.uploadedAt).toLocaleDateString()}</span>
                                <a
                                  href={sow.downloadUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={sow.fileName}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-semibold rounded transition-all flex-shrink-0"
                                  title={`Download ${sow.sowLabel}`}
                                >
                                  <Download size={11} /> Download
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleEditSowDelete(sow.id, sow.sowLabel)}
                                  className="p-1 bg-red-600/70 hover:bg-red-700 text-white rounded transition-all flex-shrink-0"
                                  title={`Delete ${sow.sowLabel}`}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Upload New SOW Inline */}
                      <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-3 space-y-2">
                        <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                          <Upload size={14} /> Add New SOW
                        </span>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={editSowLabel}
                            onChange={(e) => setEditSowLabel(e.target.value)}
                            placeholder={`SOW${editSows.length + 1}`}
                            className="sm:w-28 px-2.5 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-400 focus:border-indigo-500"
                          />
                          <input
                            ref={editSowFileRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setEditSowFile(e.target.files?.[0] || null)}
                            className="flex-1 px-2.5 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white file:mr-2 file:text-[10px] file:bg-indigo-600 file:text-white file:border-0 file:rounded file:px-2 file:py-0.5"
                          />
                          <button
                            type="button"
                            onClick={handleEditSowUpload}
                            disabled={!editSowFile || editSowUploading}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
                          >
                            {editSowUploading ? (
                              <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                            ) : (
                              <><Upload size={12} /> Upload</>
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500">.pdf, .doc, .docx (max 10MB) — label auto-generates if blank</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs text-indigo-300 font-semibold mb-2 flex items-center gap-1.5">
                        <Upload size={14} /> Upload Initial SOW (SOW1)
                      </p>
                      <input
                        ref={newClientSowFileRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setSowFile(f);
                        }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                      />
                      <div className="mt-2 text-xs text-slate-400">
                        Allowed: .pdf, .doc, .docx (max 10MB). Will be saved as SOW1. You can add SOW2, SOW3, etc. after the client is created.
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Resource Name *</label>
                  <input
                    type="text"
                    name="resourceName"
                    value={formData.resourceName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Client Billing Amount / Hr ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="billingRatePerHr"
                    value={formData.billingRatePerHr}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Technology</label>
                  <input
                    type="text"
                    name="technology"
                    value={formData.technology}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Onboarding Date</label>
                  <input
                    type="date"
                    name="onboardingDate"
                    value={formData.onboardingDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Offboarding Date</label>
                  <input
                    type="date"
                    name="offboardingDate"
                    value={formData.offboardingDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-slate-200">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    rows="3"
                  />
                </div>
                
                {/* Shares */}
                <div className="md:col-span-2">
                  <div className="text-sm font-semibold text-slate-200 mb-2">Shares & HR Rates</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-200">Share-1 Name</label>
                      <input
                        type="text"
                        name="share1Name"
                        value={formData.share1Name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-200">Share-1 HR Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="share1HrRate"
                        value={formData.share1HrRate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-200">Share-2 Name</label>
                      <input
                        type="text"
                        name="share2Name"
                        value={formData.share2Name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-200">Share-2 HR Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="share2HrRate"
                        value={formData.share2HrRate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-200">Share-3 Name</label>
                      <input
                        type="text"
                        name="share3Name"
                        value={formData.share3Name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-200">Share-3 HR Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="share3HrRate"
                        value={formData.share3HrRate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-200">Unisys Hold</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="unisysHold"
                        value={formData.unisysHold}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-200">Unisys Share HR Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="unisysShareHrRate"
                        value={formData.unisysShareHrRate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Assign users + HR rate */}
                <div className="md:col-span-2">
                  <div className="text-sm font-semibold text-slate-200 mb-2">Client Assigned Employee/Employer</div>
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                    <div className="max-h-64 overflow-auto pr-1 space-y-2">
                      {users.length === 0 ? (
                        <div className="text-slate-400 text-sm">No employees/employers available</div>
                      ) : (
                        users.map((u) => {
                          const checked = formData.assignedUsers.some(a => a.userId === u.id);
                          const current = formData.assignedUsers.find(a => a.userId === u.id);
                          return (
                            <div key={u.id} className="flex items-center gap-3">
                              <label className="flex items-center gap-3 flex-1 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    if (checked) {
                                      setFormData({
                                        ...formData,
                                        assignedUsers: formData.assignedUsers.filter(a => a.userId !== u.id)
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        assignedUsers: [...formData.assignedUsers, { userId: u.id, hrRate: '' }]
                                      });
                                    }
                                  }}
                                  className="h-4 w-4 accent-blue-600"
                                />
                                <span className="text-sm text-white truncate">{u.name} ({u.role})</span>
                              </label>

                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                disabled={!checked}
                                value={current?.hrRate ?? ''}
                                onChange={(ev) => {
                                  const next = formData.assignedUsers.map(x =>
                                    x.userId === u.id ? { ...x, hrRate: ev.target.value } : x
                                  );
                                  setFormData({ ...formData, assignedUsers: next });
                                }}
                                className={`w-32 px-3 py-2 border rounded-lg text-white ${
                                  checked
                                    ? 'bg-white/10 border-white/20'
                                    : 'bg-white/5 border-white/10 opacity-60 cursor-not-allowed'
                                }`}
                                placeholder="HR Rate"
                              />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="active" className="bg-slate-800">Active</option>
                    <option value="inactive" className="bg-slate-800">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 min-h-[44px]">
                  {editingId ? 'Update Client' : 'Add Client'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      email: '',
                      sowName: '',
                      resourceName: '',
                      contactPerson: '',
                      phone: '',
                      address: '',
                      technology: '',
                      onboardingDate: '',
                      offboardingDate: '',
                      status: 'active',
                      billingRatePerHr: '',
                      share1Name: '',
                      share1HrRate: '',
                      share2Name: '',
                      share2HrRate: '',
                      share3Name: '',
                      share3HrRate: '',
                      unisysHold: '',
                      unisysShareHrRate: '',
                      assignedUsers: []
                    });
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 active:scale-95 min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clients Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">All Clients</h2>
          {loading ? (
            <p className="text-center py-8 text-white text-sm sm:text-base">Loading...</p>
          ) : clients.length > 0 ? (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-white">Name</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-white">Email</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-white hidden md:table-cell">SOW Name</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-white hidden md:table-cell">SOW Docs</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-white hidden md:table-cell">Resource</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-white hidden lg:table-cell">Contact</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-white hidden lg:table-cell">Technology</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-white hidden xl:table-cell">Onboarding</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-white hidden xl:table-cell">Offboarding</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-white">Status</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const clientId = client._id || client.id;
                    return (
                    <tr key={clientId} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="px-3 sm:px-4 py-2 sm:py-4 font-medium text-sm sm:text-base text-white truncate max-w-[150px]">{client.name}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-slate-200 truncate max-w-[180px]">{client.email}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-white hidden md:table-cell truncate max-w-[160px]">{client.sowName || client.industry}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-4 hidden md:table-cell">
                        <button
                          onClick={() => openSowPanel(client)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-semibold transition-all active:scale-95"
                          title="View & Download SOW Documents"
                        >
                          <FileText size={13} />
                          <span>{client.sowDocCount || 0}</span>
                          <Download size={11} className="text-indigo-400" />
                        </button>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-white hidden md:table-cell truncate max-w-[140px]">{client.resourceName || '-'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-white hidden lg:table-cell truncate max-w-[120px]">{client.contactPerson}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-white hidden lg:table-cell truncate max-w-[120px]">{client.technology || '-'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-white hidden xl:table-cell">{client.onboardingDate ? new Date(client.onboardingDate).toLocaleDateString() : '-'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-white hidden xl:table-cell">{client.offboardingDate ? new Date(client.offboardingDate).toLocaleDateString() : '-'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-4">
                        <button
                          onClick={async () => {
                            await clientAPI.update(clientId, { status: client.status === 'active' ? 'inactive' : 'active' });
                            fetchClients();
                          }}
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold min-h-[32px] sm:min-h-[36px] ${client.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                        >
                          {client.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-4">
                        <div className="flex gap-1.5 sm:gap-2">
                          <button
                            onClick={() => openSowPanel(client)}
                            className="p-1.5 sm:p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-300 active:scale-95 min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
                            title="SOW Documents"
                          >
                            <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                          <button
                            onClick={() => handleEdit(client)}
                            className="p-1.5 sm:p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 active:scale-95 min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
                            title="Edit Client"
                          >
                            <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                          <button
                            onClick={() => handleDelete(clientId)}
                            className="p-1.5 sm:p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 active:scale-95 min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
                            title="Delete Client"
                          >
                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-slate-300">No clients found</p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 sm:mt-6 pt-4 border-t border-white/10">
              <p className="text-xs sm:text-sm text-slate-300">
                Page {page} of {totalPages} ({totalClients} total clients)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-lg transition-all min-h-[36px]"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all min-h-[36px] ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-lg transition-all min-h-[36px]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SOW Documents Panel (Modal) ── */}
      {sowPanelClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f1d35] border border-white/20 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={22} className="text-indigo-400" />
                  SOW Documents
                  <span className="ml-1 inline-flex items-center justify-center w-7 h-7 bg-indigo-600 text-white text-xs font-bold rounded-full">
                    {clientSows.length}
                  </span>
                </h3>
                <p className="text-sm text-slate-300 mt-1">{sowPanelClient.name} — {clientSows.length} SOW{clientSows.length !== 1 ? 's' : ''} uploaded</p>
              </div>
              <button
                onClick={closeSowPanel}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-300" />
              </button>
            </div>

            {/* SOW List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {sowsLoading ? (
                <p className="text-center py-8 text-slate-400">Loading SOW documents...</p>
              ) : clientSows.length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={40} className="mx-auto text-slate-500 mb-3" />
                  <p className="text-slate-400">No SOW documents uploaded yet</p>
                  <p className="text-xs text-slate-500 mt-1">Upload your first SOW document below</p>
                </div>
              ) : (
                clientSows.map((sow, idx) => (
                  <div
                    key={sow.id}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-600/30 rounded-lg flex items-center justify-center">
                      <FileText size={18} className="text-indigo-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-indigo-300">{sow.sowLabel}</span>
                        <span className="text-xs text-slate-400">|</span>
                        <span className="text-sm text-white truncate">{sow.fileName}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Uploaded {new Date(sow.uploadedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <a
                        href={sow.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={sow.fileName}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95"
                        title={`Download ${sow.sowLabel}`}
                      >
                        <Download size={14} /> Download
                      </a>
                      <button
                        onClick={() => handleSowDelete(sow.id, sow.sowLabel)}
                        className="p-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-all duration-200 active:scale-95"
                        title={`Delete ${sow.sowLabel}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Upload New SOW */}
            <div className="p-5 border-t border-white/10 space-y-3">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Upload size={16} className="text-indigo-400" />
                Upload New SOW
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={sowUploadLabel}
                  onChange={(e) => setSowUploadLabel(e.target.value)}
                  placeholder={`SOW Label (e.g. SOW${clientSows.length + 1})`}
                  className="sm:w-36 px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <input
                  ref={sowPanelFileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setSowUploadFile(e.target.files?.[0] || null)}
                  className="flex-1 px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white file:mr-3 file:text-xs file:bg-indigo-600 file:text-white file:border-0 file:rounded-lg file:px-2 file:py-1"
                />
                <button
                  onClick={handleSowUpload}
                  disabled={!sowUploadFile || sowUploading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-300 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                >
                  {sowUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} /> Upload
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500">Allowed: .pdf, .doc, .docx (max 10MB). Label auto-generates if left blank.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
