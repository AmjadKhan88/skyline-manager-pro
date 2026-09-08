import { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Eye,
} from "lucide-react";
import BuildingManagementForm from "./ui/OwnerBuildingManagementForm";
import toast from "react-hot-toast";
import api from "../../configs/api";
import Spinner from "../loaders/Spinner";
import { useOwner } from "../../context/OwnerContext";
import { useQueryParams } from "../../hooks/useQueryParams";
import BuildingDetailsModal from "./ui/BuildingDetailsModal";

interface Building {
  id: number;
  name: string;
  address: string;
  floors: number;
  units: number;
  occupancy: number;
  manager: string;
}

export function BuildingManagement() {
  const { buildings, setBuildings } = useOwner();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { removeParam, setParam } = useQueryParams();
  // Add this to your parent component's state
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // In your building list/table, add a button to open the modal:
  const handleViewDetails = (building: Building) => {
    setSelectedBuilding(building);
    setShowDetailsModal(true);
  };

  const updateBuildings = (id: any) => {
    setParam("id", id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const { data } = await api.delete(`/api/owner/buildings/${id}`);
      toast.success(data.message || "Building deleted successfully");
      setBuildings(buildings.filter((b) => b.id !== id));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBuildings = buildings.filter(
    (building) =>
      building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Building Management
          </h1>
          <p className="text-gray-600">
            Manage all your properties in one place
          </p>
        </div>
        <button
          onClick={() => {
            (setShowAddForm(!showAddForm), removeParam("id"));
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Building
        </button>
      </div>

      {/* Add Building Form */}
      {showAddForm && (
        <BuildingManagementForm
          buildings={buildings}
          setBuildings={setBuildings}
          setShowAddForm={setShowAddForm}
        />
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search buildings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Buildings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuildings.map((building) => (
          <div
            key={building.id}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{building.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{building.address}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(building)}
                  className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => updateBuildings(building.id)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(building.id)}
                  disabled={isDeleting}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {isDeleting ? (
                    <Spinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Floors</span>
                <span className="font-semibold text-gray-900">
                  {building.floors}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Units</span>
                <span className="font-semibold text-gray-900">
                  {building.units}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Occupancy</span>
                <span className="font-semibold text-green-600">
                  {building.occupancy}%
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Manager</p>
                <p className="font-semibold text-gray-900">
                  {building.manager}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* // Render the modal at the end of your component: */}
      <BuildingDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBuilding(null);
        }}
        updateBuildings={updateBuildings}
        building={selectedBuilding}
      />
    </div>
  );
}
