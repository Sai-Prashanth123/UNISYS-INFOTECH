import React, { useState, useEffect } from 'react';
import { invoiceAPI, clientAPI, adminAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Search, Filter, Plus, Edit, Eye, Trash2, DollarSign, Clock, AlertCircle, X, Save, ChevronDown } from 'lucide-react';
import { formatUSDate } from '../../utils/dateUtils.js';

export const InvoicesPayroll = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [invoices, setInvoices] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [showDeductions, setShowDeductions] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserHourlyPay, setSelectedUserHourlyPay] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    month: '',
    name: '',
    status: '',
    search: ''
  });

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    payrollMonth: '',
    invoiceDate: '',
    invoiceNumber: '',
    invoiceAmount: '',
    numberOfHours: '',
    clientName: '',
    endClient: '',
    employmentType: 'W2',
    name1099: '',
    status: 'Pending',
    paymentReceivedDate: '',
    notes: ''
  });

  // Deductions data
  const [deductions, setDeductions] = useState({
    amount1099: 0,
    amountW2: 0,
    unisysTax: 0,
    unisysCharges: 0,
    customDeduction1Name: '',
    customDeduction1Amount: 0,
    customDeduction2Name: '',
    customDeduction2Amount: 0,
    customDeduction3Name: '',
    customDeduction3Amount: 0,
    isOverride: false,
    overrideAmount: 0
  });

  useEffect(() => {
    fetchInvoices();
    if (activeTab === 'pending') {
      fetchPendingInvoices();
    }
  }, [activeTab, filters]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.month) params.month = filters.month;
      if (filters.name) params.name = filters.name;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const response = await invoiceAPI.getAll(params);
      setInvoices(response.data.invoices || []);
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoiceAPI.getPending();
      setPendingData(response.data.pendingByPerson || []);
    } catch (error) {
      toast.error('Failed to fetch pending invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await clientAPI.getAll();
      // Handle both response formats (clients array or direct array)
      const clientsData = response.data.clients || response.data || [];
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  };

  // Fetch clients and users when form opens
  useEffect(() => {
    if (showForm) {
      fetchClients();
      fetchUsers();
    }
  }, [showForm]);

  // Fetch users for hourly pay lookup
  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Auto-calculate invoice amount when name or hours change (only for new invoices)
  useEffect(() => {
    if (!editingInvoice && formData.name && formData.numberOfHours) {
      const user = users.find(u => u.name === formData.name);
      if (user && (user.role === 'employee' || user.role === 'employer')) {
        const hourlyPay = user.hourlyPay || user.hourly_pay || 0;
        setSelectedUserHourlyPay(hourlyPay);
        if (hourlyPay > 0) {
          const calculatedAmount = parseFloat(hourlyPay) * parseFloat(formData.numberOfHours);
          setFormData(prev => ({ ...prev, invoiceAmount: calculatedAmount.toFixed(2) }));
        }
      } else {
        setSelectedUserHourlyPay(null);
      }
    } else if (formData.name) {
      // For editing, just show the hourly pay but don't auto-calculate
      const user = users.find(u => u.name === formData.name);
      if (user && (user.role === 'employee' || user.role === 'employer')) {
        const hourlyPay = user.hourlyPay || user.hourly_pay || 0;
        setSelectedUserHourlyPay(hourlyPay);
      } else {
        setSelectedUserHourlyPay(null);
      }
    } else {
      setSelectedUserHourlyPay(null);
    }
  }, [formData.name, formData.numberOfHours, users, editingInvoice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingInvoice) {
        await invoiceAPI.update(editingInvoice._id, formData);
        toast.success('Invoice updated successfully');
      } else {
        await invoiceAPI.create(formData);
        toast.success('Invoice created successfully');
      }
      setShowForm(false);
      resetForm();
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (invoice) => {
    setEditingInvoice(invoice);
    // Fetch users to get hourly pay for the selected user
    await fetchUsers();
    setFormData({
      name: invoice.name,
      payrollMonth: invoice.payrollMonth,
      invoiceDate: invoice.invoiceDate.split('T')[0],
      invoiceNumber: invoice.invoiceNumber,
      invoiceAmount: invoice.invoiceAmount,
      numberOfHours: invoice.numberOfHours,
      clientName: invoice.clientName,
      endClient: invoice.endClient || '',
      employmentType: invoice.employmentType || 'W2',
      name1099: invoice.name1099 || '',
      status: invoice.status,
      paymentReceivedDate: invoice.paymentReceivedDate ? invoice.paymentReceivedDate.split('T')[0] : '',
      notes: invoice.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    
    setLoading(true);
    try {
      await invoiceAPI.delete(id);
      toast.success('Invoice deleted successfully');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to delete invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDeductions = async (invoice) => {
    setSelectedInvoice(invoice);
    setLoading(true);
    try {
      const response = await invoiceAPI.getById(invoice._id);
      if (response.data.deductions) {
        setDeductions(response.data.deductions);
      } else {
        setDeductions({
          amount1099: 0,
          amountW2: 0,
          unisysTax: 0,
          unisysCharges: 0,
          customDeduction1Name: '',
          customDeduction1Amount: 0,
          customDeduction2Name: '',
          customDeduction2Amount: 0,
          customDeduction3Name: '',
          customDeduction3Amount: 0,
          isOverride: false,
          overrideAmount: 0
        });
      }
      setShowDeductions(true);
    } catch (error) {
      toast.error('Failed to fetch deductions');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDeductions = async () => {
    setLoading(true);
    try {
      await invoiceAPI.updateDeductions(selectedInvoice._id, deductions);
      toast.success('Deductions updated successfully');
      setShowDeductions(false);
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to update deductions');
    } finally {
      setLoading(false);
    }
  };

  const calculateNetPayable = () => {
    if (deductions.isOverride) {
      return deductions.overrideAmount || 0;
    }
    const total = (deductions.amount1099 || 0) + 
                  (deductions.amountW2 || 0) + 
                  (deductions.unisysTax || 0) + 
                  (deductions.unisysCharges || 0) + 
                  (deductions.customDeduction1Amount || 0) + 
                  (deductions.customDeduction2Amount || 0) + 
                  (deductions.customDeduction3Amount || 0);
    return (selectedInvoice?.invoiceAmount || 0) - total;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      payrollMonth: '',
      invoiceDate: '',
      invoiceNumber: '',
      invoiceAmount: '',
      numberOfHours: '',
      clientName: '',
      endClient: '',
      employmentType: 'W2',
      name1099: '',
      status: 'Pending',
      paymentReceivedDate: '',
      notes: ''
    });
    setEditingInvoice(null);
    setSelectedUserHourlyPay(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Received':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Waiting on Client':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className={`flex gap-6 max-w-[1800px] mx-auto ${activeTab === 'list' ? '' : 'max-w-7xl'}`}>
        {/* Sidebar - Invoice List (only show on list tab) */}
        {activeTab === 'list' && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">Invoices</h2>
              {loading ? (
                <div className="text-center py-8 text-slate-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm">Loading...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No invoices found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <button
                      key={invoice._id}
                      onClick={() => {
                        setSelectedInvoiceId(invoice._id);
                        // Scroll to the invoice in the table
                        setTimeout(() => {
                          const element = document.getElementById(`invoice-${invoice._id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 100);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedInvoiceId === invoice._id
                          ? 'bg-blue-600/30 border border-blue-500/50'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-semibold text-sm truncate">{invoice.name || 'Unknown'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {invoice.invoiceNumber} • {invoice.payrollMonth}
                      </div>
                      <div className="text-xs text-emerald-400 font-medium mt-1">
                        ${(invoice.invoiceAmount || 0).toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Invoices & Payroll</h1>
          <p className="text-slate-300">Manage invoices, track payroll, and monitor payments</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            Invoices List
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            Pending Tracker
          </button>
        </div>

        {/* Invoices List Tab */}
        {activeTab === 'list' && (
          <>
            {/* Filters and Actions */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search by invoice number..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="month"
                  value={filters.month}
                  onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-800">All Status</option>
                  <option value="Received" className="bg-slate-800">Received</option>
                  <option value="Pending" className="bg-slate-800">Pending</option>
                  <option value="Waiting on Client" className="bg-slate-800">Waiting on Client</option>
                </select>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2 rounded-lg transition"
                >
                  <Plus size={20} />
                  Add Invoice
                </button>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-b border-slate-700/50">
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">End Client</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Payroll Month</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Invoice No</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Hours</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Payment Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {loading ? (
                      <tr>
                        <td colSpan="10" className="px-6 py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span>Loading invoices...</span>
                          </div>
                        </td>
                      </tr>
                    ) : invoices.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-6 py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <AlertCircle className="w-12 h-12 text-slate-500" />
                            <span>No invoices found</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      invoices.map((invoice, index) => (
                        <tr 
                          id={`invoice-${invoice._id}`}
                          key={invoice._id} 
                          onClick={() => setSelectedInvoiceId(invoice._id)}
                          className={`hover:bg-slate-700/20 transition-all duration-200 group cursor-pointer ${
                            selectedInvoiceId === invoice._id ? 'bg-blue-600/20 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <td className="px-6 py-5">
                            <span className="text-slate-300">{invoice.endClient || <span className="text-slate-500">-</span>}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ${invoice.employmentType === '1099' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                              {invoice.employmentType || 'W2'}
                              {invoice.employmentType === '1099' && invoice.name1099 && (
                                <span className="ml-1.5 text-[10px] opacity-80">({invoice.name1099})</span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {(invoice.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white font-semibold">{invoice.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-slate-300 font-medium">{invoice.payrollMonth}</td>
                          <td className="px-6 py-5">
                            <span className="text-slate-200 font-mono text-sm bg-slate-700/30 px-3 py-1 rounded-lg">{invoice.invoiceNumber}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-emerald-400 font-bold text-lg">${(invoice.invoiceAmount || 0).toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-slate-300 font-medium">{invoice.numberOfHours}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-slate-300 font-medium">
                            {invoice.paymentReceivedDate ? formatUSDate(invoice.paymentReceivedDate) : <span className="text-slate-500">-</span>}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleViewDeductions(invoice)}
                                className="p-2.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/40 transition-all hover:scale-110"
                                title="View Deductions"
                              >
                                <DollarSign size={18} />
                              </button>
                              <button
                                onClick={() => handleEdit(invoice)}
                                className="p-2.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/40 transition-all hover:scale-110"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(invoice._id)}
                                className="p-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-all hover:scale-110"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Pending Tracker Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading pending invoices...</div>
            ) : pendingData.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
                <AlertCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">All Clear!</h3>
                <p className="text-slate-300">No pending invoices at the moment</p>
              </div>
            ) : (
              pendingData.map((person) => (
                <div key={person.name} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-white">{person.name}</h3>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Total Pending</p>
                      <p className="text-3xl font-bold text-red-400">${(person.totalPending || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {person.invoices.map((invoice) => (
                      <div key={invoice._id} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="text-white font-semibold">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-slate-400">{invoice.payrollMonth} • {invoice.clientName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">${(invoice.invoiceAmount || 0).toLocaleString()}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mt-1 ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Invoice Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f1d35] border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingInvoice ? 'Edit Invoice' : 'Add New Invoice'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="text-slate-400" size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
                    <select
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value, invoiceAmount: '' })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-800">Select Employee/Employer</option>
                      {users.filter(u => u.role === 'employee' || u.role === 'employer').map(user => (
                        <option key={user._id || user.id} value={user.name} className="bg-slate-800">
                          {user.name} ({user.role}) - ${user.hourlyPay || user.hourly_pay || 0}/hr
                        </option>
                      ))}
                    </select>
                    {selectedUserHourlyPay !== null && (
                      <p className="text-xs text-blue-400 mt-1">
                        Hourly Rate: ${selectedUserHourlyPay}/hr
                      </p>
                    )}
                    {formData.name && selectedUserHourlyPay === null && (
                      <p className="text-xs text-yellow-400 mt-1">
                        Warning: Selected user doesn't have hourly pay set. Please set it in User Management.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Payroll Month *</label>
                    <input
                      type="month"
                      required
                      value={formData.payrollMonth}
                      onChange={(e) => setFormData({ ...formData, payrollMonth: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Invoice Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Invoice Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Number of Hours *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.numberOfHours}
                      onChange={(e) => setFormData({ ...formData, numberOfHours: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Invoice Amount *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.invoiceAmount}
                      onChange={(e) => setFormData({ ...formData, invoiceAmount: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      readOnly={selectedUserHourlyPay !== null && formData.numberOfHours && !editingInvoice}
                    />
                    {selectedUserHourlyPay !== null && formData.numberOfHours && (
                      <p className="text-xs text-green-400 mt-1">
                        Auto-calculated: ${selectedUserHourlyPay} × {formData.numberOfHours} hours
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Client Name *</label>
                    <div className="relative">
                      <select
                        required
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        disabled={loadingClients}
                      >
                        <option value="" className="bg-slate-800">
                          {loadingClients ? 'Loading clients...' : 'Select a client'}
                        </option>
                        {clients.map((client) => (
                          <option 
                            key={client._id || client.id} 
                            value={client.name}
                            className="bg-slate-800"
                          >
                            {client.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                    {clients.length === 0 && !loadingClients && (
                      <p className="text-xs text-yellow-400 mt-1">No clients found. Add clients in Client Management first.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Client</label>
                    <input
                      type="text"
                      value={formData.endClient}
                      onChange={(e) => setFormData({ ...formData, endClient: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g., End client name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Employment Type *</label>
                    <select
                      required
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value, name1099: e.target.value === 'W2' ? '' : formData.name1099 })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="W2" className="bg-slate-800">W2</option>
                      <option value="1099" className="bg-slate-800">1099</option>
                    </select>
                  </div>
                  {formData.employmentType === '1099' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">1099 Name *</label>
                      <input
                        type="text"
                        required={formData.employmentType === '1099'}
                        value={formData.name1099}
                        onChange={(e) => setFormData({ ...formData, name1099: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Enter 1099 name"
                      />
                    </div>
                  )}
                </div>

                <div className={`grid gap-4 ${formData.status === 'Received' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Status *</label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        status: e.target.value,
                        // Clear payment date if status is not "Received"
                        paymentReceivedDate: e.target.value === 'Received' ? formData.paymentReceivedDate : ''
                      })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="Pending" className="bg-slate-800">Pending</option>
                      <option value="Received" className="bg-slate-800">Received</option>
                      <option value="Waiting on Client" className="bg-slate-800">Waiting on Client</option>
                    </select>
                  </div>
                  {formData.status === 'Received' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Payment Received Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.paymentReceivedDate}
                        onChange={(e) => setFormData({ ...formData, paymentReceivedDate: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-white/10 text-slate-300 rounded-lg hover:bg-white/15 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Deductions Modal */}
        {showDeductions && selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f1d35] border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Payroll & Deductions</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {selectedInvoice.name} - {selectedInvoice.invoiceNumber}
                  </p>
                </div>
                <button
                  onClick={() => setShowDeductions(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="text-slate-400" size={24} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-2">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-slate-400">Invoice Amount</p>
                  <p className="text-3xl font-bold text-white">${(selectedInvoice?.invoiceAmount || 0).toLocaleString()}</p>
                </div>

                {selectedInvoice.employmentType === '1099' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">1099 Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={deductions.amount1099 || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setDeductions({ 
                          ...deductions, 
                          amount1099: value,
                          unisysTax: value > 0 ? 0 : deductions.unisysTax,
                          unisysCharges: value > 0 ? 0 : deductions.unisysCharges
                        });
                      }}
                      disabled={deductions.unisysTax > 0 || deductions.unisysCharges > 0}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {(deductions.unisysTax > 0 || deductions.unisysCharges > 0) && (
                      <p className="text-xs text-yellow-400 mt-1">Clear Unisys Tax/Charges to enable</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">W2 Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={deductions.amountW2 || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setDeductions({ 
                          ...deductions, 
                          amountW2: value,
                          unisysTax: value > 0 ? 0 : deductions.unisysTax,
                          unisysCharges: value > 0 ? 0 : deductions.unisysCharges
                        });
                      }}
                      disabled={deductions.unisysTax > 0 || deductions.unisysCharges > 0}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {(deductions.unisysTax > 0 || deductions.unisysCharges > 0) && (
                      <p className="text-xs text-yellow-400 mt-1">Clear Unisys Tax/Charges to enable</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Unisys Tax</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={deductions.unisysTax || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setDeductions({ 
                          ...deductions, 
                          unisysTax: value,
                          amount1099: value > 0 ? 0 : deductions.amount1099,
                          amountW2: value > 0 ? 0 : deductions.amountW2
                        });
                      }}
                      disabled={deductions.amount1099 > 0 || deductions.amountW2 > 0}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {(deductions.amount1099 > 0 || deductions.amountW2 > 0) && (
                      <p className="text-xs text-yellow-400 mt-1">Clear 1099/W2 Amount to enable</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Unisys Charges</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={deductions.unisysCharges || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setDeductions({ 
                          ...deductions, 
                          unisysCharges: value,
                          amount1099: value > 0 ? 0 : deductions.amount1099,
                          amountW2: value > 0 ? 0 : deductions.amountW2
                        });
                      }}
                      disabled={deductions.amount1099 > 0 || deductions.amountW2 > 0}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {(deductions.amount1099 > 0 || deductions.amountW2 > 0) && (
                      <p className="text-xs text-yellow-400 mt-1">Clear 1099/W2 Amount to enable</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-300">Other Deductions</h3>
                  
                  {/* Custom Deduction 1 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Deduction Name 1</label>
                      <input
                        type="text"
                        value={deductions.customDeduction1Name}
                        onChange={(e) => setDeductions({ ...deductions, customDeduction1Name: e.target.value })}
                        placeholder="e.g., Health Insurance"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Amount 1</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={deductions.customDeduction1Amount || ''}
                        onChange={(e) => setDeductions({ ...deductions, customDeduction1Amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Custom Deduction 2 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Deduction Name 2</label>
                      <input
                        type="text"
                        value={deductions.customDeduction2Name}
                        onChange={(e) => setDeductions({ ...deductions, customDeduction2Name: e.target.value })}
                        placeholder="e.g., Retirement"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Amount 2</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={deductions.customDeduction2Amount || ''}
                        onChange={(e) => setDeductions({ ...deductions, customDeduction2Amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Custom Deduction 3 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Deduction Name 3</label>
                      <input
                        type="text"
                        value={deductions.customDeduction3Name}
                        onChange={(e) => setDeductions({ ...deductions, customDeduction3Name: e.target.value })}
                        placeholder="e.g., Other"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Amount 3</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={deductions.customDeduction3Amount || ''}
                        onChange={(e) => setDeductions({ ...deductions, customDeduction3Amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                  <input
                    type="checkbox"
                    id="override"
                    checked={deductions.isOverride}
                    onChange={(e) => setDeductions({ ...deductions, isOverride: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="override" className="text-slate-300">Override Net Payable</label>
                </div>

                {deductions.isOverride && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Override Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={deductions.overrideAmount}
                      onChange={(e) => setDeductions({ ...deductions, overrideAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Net Payable</p>
                  <p className="text-3xl font-bold text-green-400">${calculateNetPayable().toLocaleString()}</p>
                  {!deductions.isOverride && (
                    <p className="text-xs text-slate-500 mt-2">
                      Calculated: ${(selectedInvoice?.invoiceAmount || 0).toLocaleString()} - ${((deductions.amount1099 || 0) + (deductions.amountW2 || 0) + (deductions.unisysTax || 0) + (deductions.unisysCharges || 0) + (deductions.customDeduction1Amount || 0) + (deductions.customDeduction2Amount || 0) + (deductions.customDeduction3Amount || 0)).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSaveDeductions}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
                  >
                    <Save size={20} />
                    {loading ? 'Saving...' : 'Save Deductions'}
                  </button>
                  <button
                    onClick={() => setShowDeductions(false)}
                    className="px-6 py-3 bg-white/10 text-slate-300 rounded-lg hover:bg-white/15 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesPayroll;
