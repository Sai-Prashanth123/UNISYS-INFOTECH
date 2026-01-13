import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore } from '../../store/index.js';
import { clientLogosApi } from '../../api/endpoints';
import { Plus, Edit2, Trash2, Save, X, CheckCircle, XCircle, Upload, Image, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export const ClientLogoManagement = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    logoUrl: '',
    description: '',
    displayOrder: 0,
    isActive: true
  });

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      setLoading(true);
      const response = await clientLogosApi.getAllAdmin();
      setLogos(response.data);
    } catch (error) {
      console.error('Error fetching logos:', error);
      toast.error('Failed to fetch client logos');
    } finally {
      setLoading(false);
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file type
    const validTypes = ['image/png', 'image/webp', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please use PNG, WEBP, or JPG.');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, logoUrl: reader.result }));
      toast.success('Image uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.industry || !formData.logoUrl) {
      toast.error('Please fill in all required fields and upload a logo');
      return;
    }
    
    setSaving(true);
    try {
      if (editingId) {
        await clientLogosApi.update(editingId, formData);
        toast.success('Client logo updated successfully!');
      } else {
        await clientLogosApi.create(formData);
        toast.success('Client logo created successfully! It will now appear on the homepage.');
      }
      resetForm();
      fetchLogos();
    } catch (error) {
      console.error('Error saving logo:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save client logo';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (logo) => {
    setFormData(logo);
    setEditingId(logo._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client logo? It will be removed from the homepage immediately.')) {
      return;
    }
    setDeletingId(id);
    try {
      await clientLogosApi.delete(id);
      toast.success('Client logo deleted successfully!');
      fetchLogos();
    } catch (error) {
      console.error('Error deleting logo:', error);
      toast.error('Failed to delete client logo');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      logoUrl: '',
      description: '',
      // founded, headquarters, trustSignal removed
      displayOrder: 0,
      isActive: true
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  // Skeleton Loader Component
  const LogoSkeleton = () => (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white/20 rounded-full"></div>
          <div className="w-16 h-4 bg-white/20 rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-lg"></div>
          <div className="w-9 h-9 bg-white/20 rounded-lg"></div>
        </div>
      </div>
      <div className="mb-4 h-20 bg-white/10 rounded-lg"></div>
      <div className="w-3/4 h-6 bg-white/20 rounded mb-2"></div>
      <div className="w-1/2 h-4 bg-white/20 rounded mb-2"></div>
      <div className="w-full h-4 bg-white/20 rounded mb-2"></div>
      <div className="w-1/4 h-3 bg-white/20 rounded mt-2"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="w-72 h-9 bg-white/20 rounded mb-2 animate-pulse"></div>
              <div className="w-96 h-5 bg-white/10 rounded animate-pulse"></div>
              <div className="w-32 h-4 bg-white/10 rounded mt-1 animate-pulse"></div>
            </div>
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl animate-pulse"></div>
              <div className="w-40 h-12 bg-blue-600/50 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Loading Indicator */}
          <div className="flex items-center justify-center gap-3 mb-8 py-4">
            <Loader2 size={28} className="text-blue-400 animate-spin" />
            <span className="text-white text-lg font-medium">Loading client logos...</span>
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <LogoSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Client Logo Management</h1>
            <p className="text-slate-300">Manage client logos displayed on the homepage carousel</p>
            <p className="text-slate-400 text-sm mt-1">
              {logos.length} logo{logos.length !== 1 ? 's' : ''} • {logos.filter(l => l.isActive).length} active
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchLogos}
              disabled={loading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300"
              title="Refresh logos"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
            >
              {showAddForm ? <X size={20} /> : <Plus size={20} />}
              {showAddForm ? 'Cancel' : 'Add New Logo'}
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-white">
              {editingId ? 'Edit Client Logo' : 'Add New Client Logo'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">Industry *</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-slate-200">Logo File (PNG/WEBP/JPG) *</label>
                
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-500/20' 
                      : formData.logoUrl 
                        ? 'border-green-500/50 bg-green-500/10' 
                        : 'border-white/20 bg-white/5 hover:border-blue-500/50 hover:bg-white/10'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/webp,image/jpeg,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                  />
                  
                  {formData.logoUrl ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <img 
                          src={formData.logoUrl} 
                          alt="Preview" 
                          className="max-h-32 object-contain bg-white/10 p-4 rounded-lg border border-white/20" 
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2 text-green-400">
                        <CheckCircle size={20} />
                        <span className="text-sm font-medium">Image uploaded</span>
                      </div>
                      <p className="text-xs text-slate-400">Click or drag to replace</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${dragActive ? 'bg-blue-500/30' : 'bg-white/10'}`}>
                          {dragActive ? (
                            <Upload size={32} className="text-blue-400 animate-bounce" />
                          ) : (
                            <Image size={32} className="text-slate-400" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {dragActive ? 'Drop the image here' : 'Drag & drop your logo here'}
                        </p>
                        <p className="text-slate-400 text-sm mt-1">or click to browse</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                  <AlertCircle size={14} />
                  <span>Accepted formats: PNG, WEBP, JPG • Max size: 2MB</span>
                </div>
                
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                    className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove image
                  </button>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-slate-200">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-slate-200">Active (shown on homepage)</label>
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {editingId ? 'Update' : 'Create'} Logo
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={resetForm} 
                  disabled={saving}
                  className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Logos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((logo) => (
            <div
              key={logo._id}
              className={`relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 ${deletingId === logo._id ? 'opacity-60' : ''}`}
            >
              {/* Deleting Overlay */}
              {deletingId === logo._id && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={32} className="text-red-400 animate-spin" />
                    <span className="text-white text-sm font-medium">Deleting...</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {logo.isActive ? (
                    <CheckCircle size={20} className="text-green-400" />
                  ) : (
                    <XCircle size={20} className="text-red-400" />
                  )}
                  <span className="text-xs font-semibold text-white">
                    {logo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(logo)}
                    disabled={deletingId === logo._id}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
                    title="Edit Logo"
                  >
                    <Edit2 size={18} className="text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(logo._id)}
                    disabled={deletingId !== null}
                    className="p-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    title="Delete Logo"
                  >
                    {deletingId === logo._id ? (
                      <Loader2 size={18} className="text-white animate-spin" />
                    ) : (
                      <Trash2 size={18} className="text-white" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-center h-20 bg-white/5 rounded-lg p-2">
                <img
                  src={logo.logoUrl}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/150x60/1e293b/00BCD4?text=${encodeURIComponent(logo.name)}`;
                  }}
                />
              </div>

              <h3 className="text-xl font-bold mb-2 text-white">{logo.name}</h3>
              <p className="text-sm text-blue-400 mb-2">{logo.industry}</p>
              {logo.description && (
                <p className="text-sm mb-2 text-slate-200">
                  {logo.description}
                </p>
              )}
              <p className="text-xs mt-2 text-slate-400">
                Display Order: {logo.displayOrder}
              </p>
            </div>
          ))}
        </div>

        {logos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl mb-4 text-white">No client logos found</p>
            <p className="text-slate-300">Click "Add New Logo" to create your first client logo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientLogoManagement;
