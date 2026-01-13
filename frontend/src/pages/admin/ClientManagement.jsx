import React from 'react';
import { useThemeStore } from '../../store/index.js';
import { clientAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export const ClientManagement = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [clients, setClients] = React.useState([]);
  const [activeClients, setActiveClients] = React.useState([]);
  const [inactiveClients, setInactiveClients] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    industry: '',
    contactPerson: '',
    phone: '',
    address: '',
    technology: '',
    onboardingDate: '',
    offboardingDate: '',
    status: 'active'
  });

  React.useEffect(() => {
    fetchClients();
  }, [search, page]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await clientAPI.getAll({ search, page, limit: 10 });
      setClients(response.data.clients);
      setActiveClients(response.data.clients.filter(c => c.status === 'active'));
      setInactiveClients(response.data.clients.filter(c => c.status === 'inactive'));
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
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
        await clientAPI.create(formData);
        toast.success('Client created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', email: '', industry: '', contactPerson: '', phone: '', address: '', technology: '', onboardingDate: '', offboardingDate: '', status: 'active' });
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setFormData(client);
    setEditingId(client._id || client.id);
    setShowForm(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Client Management</h1>
            <p className="text-slate-300">Manage your client database</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', email: '', industry: '', contactPerson: '', phone: '', address: '', technology: '', onboardingDate: '', offboardingDate: '', status: 'active' });
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
          >
            <Plus size={20} /> Add Client
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <p className="text-sm font-medium text-slate-200">Total Clients</p>
            <p className="text-4xl font-bold mt-2 text-white">{clients.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <p className="text-sm font-medium text-slate-200">Active Clients</p>
            <p className="text-4xl font-bold mt-2 text-green-400">{activeClients.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <p className="text-sm font-medium text-slate-200">Inactive Clients</p>
            <p className="text-4xl font-bold mt-2 text-red-400">{inactiveClients.length}</p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-white">
              {editingId ? 'Edit Client' : 'Add New Client'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Client Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105">
                  {editingId ? 'Update Client' : 'Add Client'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', email: '', industry: '', contactPerson: '', phone: '', address: '', technology: '', onboardingDate: '', offboardingDate: '', status: 'active' });
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clients Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-white">All Clients</h2>
          {loading ? (
            <p className="text-center py-8 text-white">Loading...</p>
          ) : clients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-semibold text-white">Name</th>
                    <th className="text-left p-4 font-semibold text-white">Email</th>
                    <th className="text-left p-4 font-semibold text-white">Industry</th>
                    <th className="text-left p-4 font-semibold text-white">Contact Person</th>
                    <th className="text-left p-4 font-semibold text-white">Technology</th>
                    <th className="text-left p-4 font-semibold text-white">Onboarding</th>
                    <th className="text-left p-4 font-semibold text-white">Offboarding</th>
                    <th className="text-left p-4 font-semibold text-white">Status</th>
                    <th className="text-left p-4 font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const clientId = client._id || client.id;
                    return (
                    <tr key={clientId} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-white">{client.name}</td>
                      <td className="p-4 text-slate-200">{client.email}</td>
                      <td className="p-4 text-white">{client.industry}</td>
                      <td className="p-4 text-white">{client.contactPerson}</td>
                      <td className="p-4 text-white">{client.technology || '-'}</td>
                      <td className="p-4 text-white">{client.onboardingDate ? new Date(client.onboardingDate).toLocaleDateString() : '-'}</td>
                      <td className="p-4 text-white">{client.offboardingDate ? new Date(client.offboardingDate).toLocaleDateString() : '-'}</td>
                      <td className="p-4">
                        <button
                          onClick={async () => {
                            await clientAPI.update(clientId, { status: client.status === 'active' ? 'inactive' : 'active' });
                            fetchClients();
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${client.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                        >
                          {client.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                          title="Edit Client"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(clientId)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300"
                          title="Delete Client"
                        >
                          <Trash2 size={18} />
                        </button>
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
        </div>
      </div>
    </div>
  );
};
