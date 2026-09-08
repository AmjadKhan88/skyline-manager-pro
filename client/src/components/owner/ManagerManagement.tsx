import { useState } from "react";
import {
  UserCog,
  Plus,
  Search,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import OwnerManagerManagmentForm from "./ui/OwnerManagerManagmentForm";
import { useOwner } from "../../context/OwnerContext";
import { useQueryParams } from "../../hooks/useQueryParams";
import api from "../../configs/api";
import ManagerDetailsModal from "./ui/ManagerDetailsModal";

interface Manager {
  id: number;
  name: string;
  email: string;
  phone: string;
  building: string;
  salary: number;
  status: "active" | "inactive";
}

export function ManagerManagement() {
  const { managers, setManagers } = useOwner();

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { removeParam, setParam } = useQueryParams();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  // Add to state
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [showManagerModal, setShowManagerModal] = useState(false);

  // Handler function
  const handleViewManager = (manager: Manager) => {
    setSelectedManager(manager);
    setShowManagerModal(true);
  };

  const updateManager = (id: any) => {
    setParam("id", id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    toast.loading("Deleting manager...", { id: "delete-manager" });
    try {
      const { data } = await api.delete(`/api/managers/delete/${id}`);
      toast.success(data.message || "Manager deleted successfully");
      setManagers(managers.filter((m) => m.id !== id));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsDeleting(false);
      toast.dismiss("delete-manager");
    }
  };

  const filteredManagers = managers.filter(
    (manager) =>
      manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.manager.building.buildingName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manager Management
          </h1>
          <p className="text-gray-600">
            Oversee and manage your building managers
          </p>
        </div>
        <button
          onClick={() => {
            (setShowAddForm(!showAddForm), removeParam("id"));
          }}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Manager
        </button>
      </div>
      {/* Add Manager Form */}
      {showAddForm && (
        <OwnerManagerManagmentForm
          setManagers={setManagers}
          managers={managers}
          setShowAddForm={setShowAddForm}
        />
      )}
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search managers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      {/* Managers Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Building
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredManagers.map((manager, index) => (
                <tr
                  key={manager.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <UserCog className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {manager.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: #{index + 1}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {manager.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {manager?.manager?.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">
                      {manager.manager?.building?.buildingName || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">
                      ${manager?.manager?.salary}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        manager.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {manager.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewManager(manager)}
                        className="p-2 hover:bg-purple-50 rounded-lg transition-colors group"
                        title="View Manager Details"
                      >
                        <Eye className="w-4 h-4 text-purple-600 group-hover:text-purple-700" />
                      </button>
                      <button
                        onClick={() => updateManager(manager.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        disabled={isDeleting}
                        onClick={() => handleDelete(manager.id)}
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
      {/* // Render modal */}
      <ManagerDetailsModal
        isOpen={showManagerModal}
        onClose={() => {
          setShowManagerModal(false);
          setSelectedManager(null);
        }}
        manager={selectedManager}
        setSelectedManager={setSelectedManager}
        updateManager={updateManager}
      />
    </div>
  );
}
