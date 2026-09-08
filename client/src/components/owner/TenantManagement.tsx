import { useState } from 'react';
import { UsersRound, Plus, Search, Mail, Phone, Edit, Trash2, Home, DollarSign } from 'lucide-react';

interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  building: string;
  unit: string;
  rent: number;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  leaseEnd: string;
}

export function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([
    { id: 1, name: 'Alice Cooper', email: 'alice.c@email.com', phone: '+1 234-567-8910', building: 'Skyline Tower A', unit: 'A-101', rent: 1500, paymentStatus: 'paid', leaseEnd: '2026-12-31' },
    { id: 2, name: 'Bob Thompson', email: 'bob.t@email.com', phone: '+1 234-567-8911', building: 'Skyline Tower B', unit: 'B-205', rent: 1800, paymentStatus: 'paid', leaseEnd: '2026-06-30' },
    { id: 3, name: 'Carol White', email: 'carol.w@email.com', phone: '+1 234-567-8912', building: 'Harbor View Plaza', unit: 'C-310', rent: 2200, paymentStatus: 'unpaid', leaseEnd: '2027-03-15' },
    { id: 4, name: 'Daniel Green', email: 'daniel.g@email.com', phone: '+1 234-567-8913', building: 'Garden Heights', unit: 'D-405', rent: 1600, paymentStatus: 'paid', leaseEnd: '2026-09-30' },
    { id: 5, name: 'Emma Harris', email: 'emma.h@email.com', phone: '+1 234-567-8914', building: 'Skyline Tower A', unit: 'A-202', rent: 1750, paymentStatus: 'partial', leaseEnd: '2026-11-15' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    building: '',
    unit: '',
    rent: '',
    leaseEnd: '',
  });

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const newTenant: Tenant = {
      id: tenants.length + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      building: formData.building,
      unit: formData.unit,
      rent: parseInt(formData.rent),
      paymentStatus: 'paid',
      leaseEnd: formData.leaseEnd,
    };
    setTenants([...tenants, newTenant]);
    setFormData({ name: '', email: '', phone: '', building: '', unit: '', rent: '', leaseEnd: '' });
    setShowAddForm(false);
  };

  const handleDelete = (id: number) => {
    setTenants(tenants.filter(t => t.id !== id));
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tenant Management</h1>
          <p className="text-gray-600">Manage tenants and track rental payments</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Tenant
        </button>
      </div>

      {/* Add Tenant Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Tenant</h3>
          <form onSubmit={handleAddTenant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., john@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., +1 234-567-8900"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Building</label>
              <input
                type="text"
                required
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Skyline Tower A"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Unit Number</label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., A-101"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Monthly Rent ($)</label>
              <input
                type="number"
                required
                value={formData.rent}
                onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., 1500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Lease End Date</label>
              <input
                type="date"
                required
                value={formData.leaseEnd}
                onChange={(e) => setFormData({ ...formData, leaseEnd: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add Tenant
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Property</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rent</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Lease End</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <UsersRound className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{tenant.name}</p>
                        <p className="text-sm text-gray-500">ID: #{tenant.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {tenant.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {tenant.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-gray-900">{tenant.building}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Home className="w-3 h-3" />
                        Unit {tenant.unit}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">{tenant.rent.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      tenant.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : tenant.paymentStatus === 'unpaid'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tenant.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{tenant.leaseEnd}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tenant.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
