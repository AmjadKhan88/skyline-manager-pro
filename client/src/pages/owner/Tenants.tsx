import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Search, Plus, Edit2, Trash2, X, RefreshCw, DollarSign } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Tenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', buildingId: '', unitNumber: '', monthlyRent: '', depositAmount: '', leaseStart: '', leaseEnd: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tenantsRes, buildingsRes] = await Promise.all([
        api.get('/tenants'),
        api.get('/buildings?limit=100')
      ]);
      setTenants(tenantsRes.data.data || tenantsRes.data || []);
      setBuildings(buildingsRes.data.data || buildingsRes.data || []);
    } catch (error) {
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tenant = null) => {
    if (tenant) {
      setEditingTenant(tenant);
      const activeLease = tenant.leases?.[0] || {};
      setFormData({
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone || '',
        buildingId: tenant.buildingId || '',
        unitNumber: tenant.unitNumber || activeLease.unitNumber || '',
        monthlyRent: activeLease.monthlyRent || '',
        depositAmount: activeLease.depositAmount || '',
        leaseStart: activeLease.leaseStart ? new Date(activeLease.leaseStart).toISOString().split('T')[0] : '',
        leaseEnd: activeLease.leaseEnd ? new Date(activeLease.leaseEnd).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingTenant(null);
      setFormData({
        name: '', email: '', phone: '', buildingId: '', unitNumber: '', monthlyRent: '', depositAmount: '', leaseStart: '', leaseEnd: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTenant) {
        await api.put(`/tenants/${editingTenant.id || editingTenant._id}`, formData);
        toast.success('Tenant updated successfully');
      } else {
        await api.post('/tenants', formData);
        toast.success('Tenant created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving tenant');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;
    try {
      await api.delete(`/tenants/${id}`);
      toast.success('Tenant deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete tenant');
    }
  };

  const handleUpdatePaymentStatus = async (tenantId: string, tenancyId: string, currentStatus: string) => {
    try {
      const statuses = ['paid', 'partial', 'overdue', 'unpaid'];
      const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
      const newStatus = statuses[nextIdx];
      
      await api.patch(`/tenants/${tenantId}/payment`, { tenancyId, paymentStatus: newStatus });
      toast.success('Payment status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase()) || 
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.unitNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 dark:text-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your renters and leases</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
        >
          <Plus size={20} />
          Add Tenant
        </button>
      </div>

      <div className="flex items-center bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md">
        <Search className="text-gray-400 ml-2" size={20} />
        <input 
          type="text"
          placeholder="Search tenants or units..."
          className="bg-transparent border-none outline-none px-3 py-1 w-full dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-emerald-500" size={32} /></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-sm">
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Tenant</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Unit Info</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Rent</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Payment Status</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((tenant) => {
                  const lease = tenant.leases?.[0] || {};
                  const paymentStatus = tenant.paymentStatus || 'unpaid';
                  
                  return (
                  <tr key={tenant.id || tenant._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                          {tenant.name?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{tenant.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{tenant.email}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{tenant.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium">Unit: {tenant.unitNumber || lease.unitNumber || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Bldg: {tenant.building?.name || tenant.buildingId || 'N/A'}</p>
                    </td>
                    <td className="p-4 text-sm">
                      <p className="font-medium">${lease.monthlyRent || '0'}/mo</p>
                      <p className="text-xs text-gray-500">Dep: ${lease.depositAmount || '0'}</p>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleUpdatePaymentStatus(tenant.id || tenant._id, lease.id || lease._id, paymentStatus)}
                        className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity",
                          paymentStatus === 'paid' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          paymentStatus === 'partial' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                          paymentStatus === 'overdue' ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}
                        title="Click to change status"
                      >
                        {paymentStatus.toUpperCase()}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(tenant)} className="p-1.5 text-gray-500 hover:text-green-600 dark:hover:text-green-400 bg-gray-100 dark:bg-gray-700 rounded transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(tenant.id || tenant._id)} className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-700 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
                {filteredTenants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No tenants found.
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
              <h2 className="text-xl font-bold">{editingTenant ? 'Edit Tenant' : 'Add New Tenant'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Personal Info</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="+1 234 567 8900" />
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white border-b pb-2 pt-4">Lease & Unit Info</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Assign to Building</label>
                <select value={formData.buildingId} onChange={e => setFormData({...formData, buildingId: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                  <option value="">-- Select Building --</option>
                  {buildings.map(b => (
                    <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit Number</label>
                <input type="text" value={formData.unitNumber} onChange={e => setFormData({...formData, unitNumber: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="Apt 4B" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Rent</label>
                  <input type="number" value={formData.monthlyRent} onChange={e => setFormData({...formData, monthlyRent: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="1500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deposit Amount</label>
                  <input type="number" value={formData.depositAmount} onChange={e => setFormData({...formData, depositAmount: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="1500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Lease Start</label>
                  <input type="date" value={formData.leaseStart} onChange={e => setFormData({...formData, leaseStart: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lease End</label>
                  <input type="date" value={formData.leaseEnd} onChange={e => setFormData({...formData, leaseEnd: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                </div>
              </div>
            </form>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-3 bg-gray-50 dark:bg-gray-800/50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                {editingTenant ? 'Save Changes' : 'Create Tenant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
