import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Calendar, Eye, Trash2, CheckCircle, Clock, Search, RefreshCw, Wifi, WifiOff, MessageSquare, Send, Archive, X, ExternalLink } from 'lucide-react';
import { contactMessageApi } from '../../api/endpoints.js';
import { supabase } from '../../config/supabase.js';
import { toast } from 'react-toastify';
import { formatUSDateTime, getUSTimeAgo } from '../../utils/dateUtils.js';

// Status configurations
const statusConfig = {
  new: {
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Clock,
    label: 'New'
  },
  read: {
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: Eye,
    label: 'Read'
  },
  replied: {
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: Send,
    label: 'Replied'
  },
  archived: {
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    icon: Archive,
    label: 'Archived'
  }
};

export const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const subscriptionRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    setupRealtimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  // Re-fetch when filter changes
  useEffect(() => {
    fetchMessages();
  }, [filter]);

  // Real-time subscription for contact messages
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin-contact-messages-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'contact_messages' },
        (payload) => {
          console.log('🔄 Contact message changed:', payload.eventType);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = transformMessage(payload.new);
            setMessages(prev => [newMessage, ...prev]);
            toast.info(`New message from ${newMessage.name}!`, {
              icon: '📬'
            });
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => 
              m._id === payload.new.id ? transformMessage(payload.new) : m
            ));
            // Update selected message if it's the one being updated
            if (selectedMessage?._id === payload.new.id) {
              setSelectedMessage(transformMessage(payload.new));
            }
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m._id !== payload.old.id));
            if (selectedMessage?._id === payload.old.id) {
              setSelectedMessage(null);
            }
            toast.info('Message deleted');
          }
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    subscriptionRef.current = channel;
  };

  // Transform message from DB format to frontend format
  const transformMessage = (msg) => ({
    _id: msg.id,
    id: msg.id,
    name: msg.name,
    email: msg.email,
    phone: msg.phone,
    message: msg.message,
    status: msg.status,
    submittedAt: msg.submitted_at,
    createdAt: msg.created_at,
    updatedAt: msg.updated_at
  });

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await contactMessageApi.getAll(params);
      const transformedMessages = (response.data.data || []).map(transformMessage);
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
    toast.success('Messages refreshed!');
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await contactMessageApi.updateStatus(id, status);
      toast.success(`Status updated to ${status}`);
      // Real-time will handle the update, but we can also update locally for immediate feedback
      setMessages(prev => prev.map(m => 
        m._id === id ? { ...m, status } : m
      ));
      if (selectedMessage?._id === id) {
        setSelectedMessage(prev => ({ ...prev, status }));
      }
    } catch (error) {
      console.error('Error updating message status:', error);
      toast.error('Error updating message status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await contactMessageApi.delete(id);
      toast.success('Message deleted');
      // Real-time will handle removal
      if (selectedMessage?._id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Error deleting message');
    }
  };

  const formatDate = (date) => {
    return formatUSDateTime(date);
  };

  const getTimeAgo = (date) => {
    return getUSTimeAgo(date);
  };

  // Filter messages by search term
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
    archived: messages.filter(m => m.status === 'archived').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Contact Messages</h1>
            <div className="flex items-center gap-3">
              <p className="text-slate-300">Manage customer inquiries and contact form submissions</p>
              {/* Realtime indicator */}
              <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                realtimeConnected 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {realtimeConnected ? (
                  <>
                    <Wifi size={12} />
                    <span>Live</span>
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} />
                    <span>Connecting...</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-blue-400" />
              <p className="text-blue-400 text-xs">New</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.new}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye size={14} className="text-yellow-400" />
              <p className="text-yellow-400 text-xs">Read</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.read}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Send size={14} className="text-green-400" />
              <p className="text-green-400 text-xs">Replied</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.replied}</p>
          </div>
          <div className="bg-slate-500/10 border border-slate-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Archive size={14} className="text-slate-400" />
              <p className="text-slate-400 text-xs">Archived</p>
            </div>
            <p className="text-2xl font-bold text-slate-400">{stats.archived}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'new', 'read', 'replied', 'archived'].map((status) => {
                const config = statusConfig[status];
                const count = status === 'all' ? stats.total : stats[status];
                return (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                      filter === status
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      filter === status ? 'bg-white/20' : 'bg-white/10'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-slate-400 mt-4">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-xl text-white mb-2">No messages found</p>
            <p className="text-slate-400">
              {searchTerm ? 'Try adjusting your search' : 'New messages will appear here'}
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Messages List */}
            <div className="space-y-3">
              <p className="text-slate-400 text-sm mb-2">
                Showing {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
              </p>
              {filteredMessages.map((message) => {
                const StatusIcon = statusConfig[message.status]?.icon || Clock;
                return (
                  <div
                    key={message._id}
                    onClick={() => {
                      setSelectedMessage(message);
                      // Auto-mark as read when opened (if new)
                      if (message.status === 'new') {
                        handleStatusUpdate(message._id, 'read');
                      }
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      selectedMessage?._id === message._id
                        ? 'bg-blue-900/30 border-blue-500/50 scale-[1.02]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate">{message.name}</h3>
                          {message.status === 'new' && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{message.email}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 flex-shrink-0 ${statusConfig[message.status]?.color}`}>
                        <StatusIcon size={12} />
                        {statusConfig[message.status]?.label}
                      </span>
                    </div>
                    
                    <p className="text-slate-300 text-sm line-clamp-2 mb-3">{message.message}</p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {getTimeAgo(message.submittedAt)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3" />
                        {message.phone}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Detail */}
            <div className="lg:sticky lg:top-6 h-fit">
              {selectedMessage ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  {/* Detail Header */}
                  <div className="bg-white/5 border-b border-white/10 p-4 flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">Message Details</h2>
                      <p className="text-slate-400 text-sm">{formatDate(selectedMessage.submittedAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(selectedMessage._id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="p-2 text-slate-400 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Detail Content */}
                  <div className="p-6 space-y-5">
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Name</label>
                        <p className="text-white font-semibold text-lg">{selectedMessage.name}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border inline-flex items-center gap-2 ${statusConfig[selectedMessage.status]?.color}`}>
                          {React.createElement(statusConfig[selectedMessage.status]?.icon || Clock, { size: 14 })}
                          {statusConfig[selectedMessage.status]?.label}
                        </span>
                      </div>
                    </div>

                    {/* Contact Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Email</label>
                        <a 
                          href={`mailto:${selectedMessage.email}`} 
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
                        >
                          <Mail size={16} />
                          {selectedMessage.email}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Phone</label>
                        <a 
                          href={`tel:${selectedMessage.phone}`} 
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
                        >
                          <Phone size={16} />
                          {selectedMessage.phone}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">Message</label>
                      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                        <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {selectedMessage.message}
                        </p>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wider block mb-3">Update Status</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(statusConfig).map(([status, config]) => {
                          const StatusIcon = config.icon;
                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(selectedMessage._id, status)}
                              className={`px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                selectedMessage.status === status
                                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                                  : 'bg-white/10 text-white hover:bg-white/20'
                              }`}
                            >
                              <StatusIcon size={16} />
                              {config.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-4 border-t border-white/10">
                      <label className="text-xs text-slate-500 uppercase tracking-wider block mb-3">Quick Actions</label>
                      <div className="flex gap-3 flex-wrap">
                        <a
                          href={`mailto:${selectedMessage.email}?subject=Re: Your inquiry&body=Dear ${selectedMessage.name},%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0A`}
                          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all"
                          onClick={() => handleStatusUpdate(selectedMessage._id, 'replied')}
                        >
                          <Send size={16} />
                          Reply via Email
                        </a>
                        <a
                          href={`tel:${selectedMessage.phone}`}
                          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold flex items-center gap-2 transition-all"
                        >
                          <Phone size={16} />
                          Call
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">Select a message to view details</p>
                  <p className="text-slate-500 text-sm mt-2">Click on any message from the list</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
