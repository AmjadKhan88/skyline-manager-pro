import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Search, Plus, MoreVertical, Edit2, Trash2, Mail, Shield, X, Check, Building, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Managers() {
  const [managers, setManagers] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', salary: '', jobTitle: 'Property Manager', buildingId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [managersRes, buildingsRes] = await Promise.all([
        api.get('/staff?role=manager'),
        api.get('/buildings?limit=100')
      ]);
      setManagers(managersRes.data.data || managersRes.data || []);
      setBuildings(buildingsRes.data.data || buildingsRes.data || []);
    } catch (error) {
      toast.error('Failed to load managers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (manager = null) => {
    if (manager) {
      setEditingManager(manager);
      setFormData({
        name: manager.name,
        email: manager.email,
        phone: manager.phone || '',
        salary: manager.salary || '',
        jobTitle: manager.jobTitle || 'Property Manager',
        buildingId: manager.buildingId || ''
      });
    } else {
      setEditingManager(null);
      setFormData({
        name: '', email: '', phone: '', salary: '', jobTitle: 'Property Manager', buildingId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, role: 'manager' };
      if (editingManager) {
        await api.put(`/staff/${editingManager.id || editingManager._id}`, payload);
        toast.success('Manager updated successfully');
      } else {
        await api.post('/staff', payload);
        toast.success('Manager created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving manager');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this manager?')) return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success('Manager deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete manager');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.patch(`/staff/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleResendCredentials = async (id: string) => {
    try {
      await api.post(`/staff/${id}/resend-credentials`);
      toast.success('Credentials sent');
    } catch (error) {
      toast.error('Failed to send credentials');
    }
  };

  const filteredManagers = managers.filter(m => 
    m.name?.toLowerCase().includes(search.toLowerCase()) || 
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 dark:text-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Property Managers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your building managers</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus size={20} />
          Add Manager
        </button>
      </div>

      <div className="flex items-center bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md">
        <Search className="text-gray-400 ml-2" size={20} />
        <input 
          type="text"
          placeholder="Search managers..."
          className="bg-transparent border-none outline-none px-3 py-1 w-full dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-indigo-500" size={32} /></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-sm">
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Contact</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Building</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredManagers.map((manager) => (
                  <tr key={manager.id || manager._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                          {manager.name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{manager.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{manager.jobTitle || 'Manager'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{manager.email}</p>
                      <p className="text-xs text-gray-500">{manager.phone}</p>
                    </td>
                    <td className="p-4 text-sm">
                      {manager.building?.name || manager.buildingId || 'Unassigned'}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        manager.status === 'active' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        manager.status === 'pending' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {manager.status || 'active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleToggleStatus(manager.id || manager._id, manager.status || 'active')} className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-100 dark:bg-gray-700 rounded transition-colors" title="Toggle Status">
                          <Shield size={16} />
                        </button>
                        <button onClick={() => handleResendCredentials(manager.id || manager._id)} className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded transition-colors" title="Resend Credentials">
                          <Mail size={16} />
                        </button>
                        <button onClick={() => handleOpenModal(manager)} className="p-1.5 text-gray-500 hover:text-green-600 dark:hover:text-green-400 bg-gray-100 dark:bg-gray-700 rounded transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(manager.id || manager._id)} className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-700 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredManagers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No managers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold">{editingManager ? 'Edit Manager' : 'Add New Manager'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input type="text" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="Property Manager" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Salary</label>
                <input type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="60000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign to Building</label>
                <select value={formData.buildingId} onChange={e => setFormData({...formData, buildingId: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                  <option value="">-- Select Building --</option>
                  {buildings.map(b => (
                    <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </form>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-3 bg-gray-50 dark:bg-gray-800/50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                {editingManager ? 'Save Changes' : 'Create Manager'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
