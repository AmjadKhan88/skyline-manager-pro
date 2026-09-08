// ManagerDetailsModal.tsx
import { useEffect, useState } from "react";
import { 
  X, User, Mail, Phone, Building2, DollarSign, 
  Shield, Calendar, MapPin, Globe, 
  CheckCircle, XCircle, FileText, 
  Download, MessageSquare, Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../../../configs/api";
import { useOwner } from "../../../context/OwnerContext";

interface Manager {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  role: string;
  ownerId: string;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
  manager: {
    id: string;
    userId: string;
    phone: string;
    buildingId: string;
    salary: number;
    avatar: string;
    cnic: string;
    extraFields: Array<{ key: string; value: string }>;
    createdAt: string;
    updatedAt: string;
    building: {
      buildingName: string;
      id: string;
      address: string;
    };
  };
}

interface ManagerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  manager: Manager | null;
  setSelectedManager: (manager: Manager | null) => void;
  updateManager: (id: string) => void;
}

export default function ManagerDetailsModal({ 
  isOpen, 
  onClose, 
  manager,
  setSelectedManager,
  updateManager
}: ManagerDetailsModalProps) {

    const {managers,setManagers} = useOwner();
  const [isStatusChanging, setIsStatusChanging] = useState<boolean>(false);

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

  if (!manager) return null;



  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' hh:mm a");
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateTenure = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffInMs = now.getTime() - start.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 30) return `${diffInDays} days`;
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    const years = Math.floor(diffInDays / 365);
    const remainingMonths = Math.floor((diffInDays % 365) / 30);
    return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
  };

  // change the status of manager
  const handleStatusChange = async (id:string)=> {
    setIsStatusChanging(true);
    toast.loading("Changing status...", { id: "change-status" });
     try {
       const { data } = await api.post(`/api/managers/status/${id}`);
       if(data.success){
        toast.success(data.message)
        setSelectedManager({
            ...manager,  // Spread all existing properties
            status: manager.status === 'active' ? 'inactive' : 'active'  // Override the status property
        });
        setManagers(managers.map((manager:any) => manager.id === id ? { ...manager, status: manager.status === 'active' ? 'inactive' : 'active' } : manager));
       }
     } catch (error:any) {
      toast.error(error?.response?.data?.message || error.message)
     } finally {
      setIsStatusChanging(false);
      toast.dismiss("change-status");
     }
  }

  const handleEditManager = () => {
    onClose();
    updateManager(manager.id);
  }

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
              <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {manager.manager.avatar ? (
                      <img
                        src={manager.manager.avatar}
                        alt={manager.name}
                        className="w-16 h-16 rounded-xl border-4 border-white/20 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-white/20">
                        <span className="text-2xl font-bold text-white">
                          {getInitials(manager.name)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {manager.name}
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                          <Mail className="w-3 h-3 text-white" />
                          <p className="text-white text-sm">{manager.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(manager.status)}`}>
                          {manager.status.toUpperCase()}
                        </span>
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
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2 text-white/90">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">{manager.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Tenure: {calculateTenure(manager.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Salary: ${manager.manager.salary.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Personal Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Contact Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 uppercase tracking-wider">
                            Phone Number
                          </label>
                          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-800 font-medium">{manager.manager.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 uppercase tracking-wider">
                            Email Address
                          </label>
                          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-800 font-medium truncate">{manager.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Assigned Building */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                        Assigned Building
                      </h3>
                      <div className="bg-white rounded-lg border border-emerald-200 p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{manager.manager.building.buildingName}</h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span>{manager.manager.building.address}</span>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                            Building ID: {manager.manager.building.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        Documents & Files
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Profile Photo</span>
                            {manager.manager.avatar && (
                              <button
                                onClick={() => window.open(manager.manager.avatar, '_blank')}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                          </div>
                          {manager.manager.avatar ? (
                            <img
                              src={manager.manager.avatar}
                              alt="Profile"
                              className="w-full h-32 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-gray-400">No photo</span>
                            </div>
                          )}
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">CNIC Document</span>
                            {manager.manager.cnic && (
                              <button
                                onClick={() => window.open(manager.manager.cnic, '_blank')}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                          </div>
                          {manager.manager.cnic ? (
                            <div className="relative w-full h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-md overflow-hidden">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Key className="w-12 h-12 text-blue-400" />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                                Identity Document
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-gray-400">No CNIC uploaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Stats & Info */}
                  <div className="space-y-6">
                    {/* Manager Stats */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        Manager Statistics
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Manager ID</span>
                          <code className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {manager.manager.id.substring(0, 12)}...
                          </code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">User ID</span>
                          <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {manager.id.substring(0, 12)}...
                          </code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Owner ID</span>
                          <code className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {manager.ownerId.substring(0, 12)}...
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        Timeline
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Created</span>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(manager.createdAt)}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Last Updated</span>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(manager.updatedAt)}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Profile Updated</span>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(manager.manager.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Extra Fields */}
                    {manager.manager.extraFields && manager.manager.extraFields.length > 0 && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-amber-600" />
                          Additional Information
                        </h3>
                        <div className="space-y-2">
                          {manager.manager.extraFields.map((field, index) => (
                            <div 
                              key={index}
                              className="flex justify-between items-center bg-white/50 p-2 rounded-lg"
                            >
                              <span className="text-sm text-gray-600 capitalize">{field.key}:</span>
                              <span className="text-sm font-medium text-gray-800">{field.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="mt-8 p-5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">Manager Actions</h4>
                      <p className="text-gray-300 text-sm mt-1">
                        Quick actions for managing this account
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => console.log("Send message to:", manager.id)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                      <button
                        onClick={handleEditManager}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-colors"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {manager.managerId ? (
                      <>
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>Manager has admin privileges</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span>Standard manager account</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleStatusChange(manager.id)}
                      disabled={isStatusChanging}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                        manager.status === "active"
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      {manager.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}