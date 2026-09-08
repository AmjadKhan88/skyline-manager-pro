// BuildingDetailsModal.tsx
import { useEffect } from "react";
import { X, Building, MapPin, Layers, Home, Users, UserCheck, FileText, Battery, Leaf, Activity, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Building {
  id: number;
  name: string;
  address: string;
  floors: number;
  units: number;
  occupancy: number;
  manager: string;
  buildingType?: string;
  status?: string;
  energyRating?: string;
  greenCertification?: string;
  description?: string;
  isActive: boolean;
  extraFields?: { key: string; value: string }[];
}

interface BuildingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  building: Building | null;
}

export default function BuildingDetailsModal({ 
  isOpen, 
  onClose, 
  updateBuildings,
  building 
}: BuildingDetailsModalProps & { updateBuildings: (id: any) => void }) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!building) return null;

  const getBuildingTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "residential": return "🏠";
      case "commercial": return "🏢";
      case "industrial": return "🏭";
      case "mixed-use": return "🏙️";
      case "educational": return "🎓";
      case "healthcare": return "🏥";
      default: return "🏛️";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "operational": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "occupied": return "bg-purple-100 text-purple-800";
      case "under-construction": return "bg-yellow-100 text-yellow-800";
      case "planning": return "bg-gray-100 text-gray-800";
      case "renovating": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEnergyRatingColor = (rating: string) => {
    switch (rating?.toUpperCase()) {
      case "A": return "bg-emerald-100 text-emerald-800";
      case "B": return "bg-green-100 text-green-800";
      case "C": return "bg-yellow-100 text-yellow-800";
      case "D": return "bg-orange-100 text-orange-800";
      case "E": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const occupancyPercentage = (building.occupancy / building.units) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Building className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {building.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-white/80" />
                        <p className="text-white/80 text-sm">{building.address}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
                
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(building.status || "")}`}>
                    {building.status?.replace("-", " ") || "No Status"}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${building.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {building.isActive ? "Active" : "Inactive"}
                  </span>
                  {building.energyRating && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEnergyRatingColor(building.energyRating)}`}>
                      Energy: {building.energyRating}
                    </span>
                  )}
                  {building.greenCertification && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {building.greenCertification}
                    </span>
                  )}
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 custom-scrollbar">
                {/* Building Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Layers className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Floors</p>
                        <p className="text-2xl font-bold text-gray-900">{building.floors}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Home className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Units</p>
                        <p className="text-2xl font-bold text-gray-900">{building.units}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Occupancy</p>
                        <div className="flex items-end gap-2">
                          <p className="text-2xl font-bold text-gray-900">{building.occupancy}</p>
                          <span className="text-sm text-gray-500">
                            ({occupancyPercentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-500"
                          style={{ width: `${occupancyPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <UserCheck className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Manager</p>
                        <p className="text-lg font-semibold text-gray-900 truncate">
                          {building.manager || "Not Assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Building Type & Description */}
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Building Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-500">Building Type</label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl">{getBuildingTypeIcon(building.buildingType || "")}</span>
                            <p className="text-gray-800 font-medium">
                              {building.buildingType?.replace("-", " ") || "Not specified"}
                            </p>
                          </div>
                        </div>
                        
                        {building.description && (
                          <div>
                            <label className="text-sm text-gray-500 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Description
                            </label>
                            <p className="mt-2 text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                              {building.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Energy & Sustainability */}
                    {(building.energyRating || building.greenCertification) && (
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Leaf className="w-5 h-5 text-emerald-600" />
                          Sustainability
                        </h3>
                        <div className="space-y-3">
                          {building.energyRating && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Battery className="w-5 h-5 text-emerald-500" />
                                <span className="text-gray-700">Energy Rating</span>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEnergyRatingColor(building.energyRating)}`}>
                                {building.energyRating}
                              </span>
                            </div>
                          )}
                          {building.greenCertification && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Leaf className="w-5 h-5 text-emerald-500" />
                                <span className="text-gray-700">Green Certification</span>
                              </div>
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                                {building.greenCertification}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Active Status */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        Building Status
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {building.isActive ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {building.isActive ? "Building is Active" : "Building is Inactive"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {building.isActive ? "Currently operational and accepting tenants" : "Not currently operational"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Extra Fields */}
                    {building.extraFields && building.extraFields.length > 0 && (
                      <div className="bg-white rounded-xl p-5 border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-4">
                          Additional Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {building.extraFields.map((field, index) => (
                            <div 
                              key={index}
                              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                            >
                              <label className="text-xs text-gray-500 uppercase tracking-wider">
                                {field.key}
                              </label>
                              <p className="text-gray-800 font-medium mt-1 truncate">
                                {field.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Card */}
                <div className="mt-8 p-5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">Building Summary</h4>
                      <p className="text-gray-300 text-sm mt-1">
                        ID: #{building.id.toString().padStart(4, '0')} • 
                        Updated: Today • 
                        Last Modified: Just now
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">
                        {building.units - building.occupancy}
                      </p>
                      <p className="text-gray-300 text-sm">Available Units</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {updateBuildings(building.id), onClose();}}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Edit Building
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}