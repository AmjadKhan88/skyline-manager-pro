// EmployeeDetailsModal.tsx
import { useEffect, useState } from "react";
import { 
  X, User, Mail, Phone, Building2, DollarSign, 
  Shield, Calendar, MapPin, BadgeCheck, 
  FileText, Download, MessageSquare, 
  Clock, Key, AlertCircle, Verified,
  Briefcase, Fingerprint, UserCheck,
  Map, Home, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Employee {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending" | "suspended";
  role: string;
  ownerId: string;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    userId: string;
    phone: string;
    buildingId: string;
    employeeRole: string;
    salary: number;
    isVerified: boolean;
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

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEmployeeAction?: (action: string, employeeId: string) => void;
}

export default function EmployeeDetailsModal({ 
  isOpen, 
  onClose, 
  employee,
  onEmployeeAction
}: EmployeeDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'activity'>('overview');

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

  if (!employee) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' hh:mm a");
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-emerald-100 text-emerald-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "pending": return "bg-amber-100 text-amber-800";
      case "suspended": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "security": return "bg-blue-100 text-blue-800";
      case "maintenance": return "bg-purple-100 text-purple-800";
      case "cleaner": return "bg-green-100 text-green-800";
      case "receptionist": return "bg-pink-100 text-pink-800";
      case "technician": return "bg-orange-100 text-orange-800";
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

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
  };

  const handleAction = (action: string) => {
    if (onEmployeeAction) {
      onEmployeeAction(action, employee.id);
    }
    // Default actions if no handler provided
    switch (action) {
      case 'verify':
        console.log("Verify employee:", employee.id);
        break;
      case 'suspend':
        console.log("Suspend employee:", employee.id);
        break;
      case 'activate':
        console.log("Activate employee:", employee.id);
        break;
      case 'message':
        console.log("Message employee:", employee.id);
        break;
      case 'edit':
        console.log("Edit employee:", employee.id);
        break;
    }
  };

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
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {employee.employee.avatar ? (
                      <div className="relative">
                        <img
                          src={employee.employee.avatar}
                          alt={employee.name}
                          className="w-16 h-16 rounded-xl border-4 border-white/20 object-cover"
                        />
                        {employee.employee.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                            <Verified className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center border-4 border-white/20 relative">
                        <span className="text-2xl font-bold text-white">
                          {getInitials(employee.name)}
                        </span>
                        {employee.employee.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                            <Verified className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-white">
                          {employee.name}
                        </h2>
                        {employee.employee.isVerified && (
                          <BadgeCheck className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                          <Briefcase className="w-3 h-3 text-white" />
                          <p className="text-white text-sm capitalize">{employee.employee.employeeRole}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                          {employee.status.toUpperCase()}
                        </span>
                        {!employee.employee.isVerified && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
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
                
                {/* Tabs */}
                <div className="flex gap-4 mt-6 border-b border-white/20">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-2 px-1 font-medium transition-colors ${
                      activeTab === 'overview'
                        ? 'text-white border-b-2 border-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`pb-2 px-1 font-medium transition-colors ${
                      activeTab === 'documents'
                        ? 'text-white border-b-2 border-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Documents
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`pb-2 px-1 font-medium transition-colors ${
                      activeTab === 'activity'
                        ? 'text-white border-b-2 border-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Activity Log
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                {activeTab === 'overview' && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Column - Personal Info */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Contact Information */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Personal Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs text-gray-500 uppercase tracking-wider">
                                Phone Number
                              </label>
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-800 font-medium">{employee.employee.phone}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-gray-500 uppercase tracking-wider">
                                Email Address
                              </label>
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-800 font-medium truncate">{employee.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Employment Details */}
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-gray-600" />
                            Employment Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs text-gray-500 uppercase tracking-wider">
                                Employee Role
                              </label>
                              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <ShieldCheck className="w-4 h-4 text-gray-500" />
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(employee.employee.employeeRole)}`}>
                                  {employee.employee.employeeRole}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-gray-500 uppercase tracking-wider">
                                Monthly Salary
                              </label>
                              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <span className="text-xl font-bold text-gray-900">
                                  {formatSalary(employee.employee.salary)}
                                </span>
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
                                <h4 className="font-bold text-gray-900">{employee.employee.building.buildingName}</h4>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                  <MapPin className="w-3 h-3" />
                                  <span>{employee.employee.building.address}</span>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                                Building ID: {employee.employee.building.id.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Address Details */}
                        {employee.employee.extraFields && employee.employee.extraFields.some(f => 
                          ['address', 'city', 'district'].includes(f.key.toLowerCase())
                        ) && (
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                              <Map className="w-5 h-5 text-amber-600" />
                              Address Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {employee.employee.extraFields
                                .filter(f => ['address', 'city', 'district'].includes(f.key.toLowerCase()))
                                .map((field, index) => (
                                  <div key={index} className="bg-white/70 rounded-lg p-3">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
                                      {field.key}
                                    </label>
                                    <p className="text-gray-800 font-medium truncate">{field.value}</p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Stats & Info */}
                      <div className="space-y-6">
                        {/* Employee Stats */}
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Fingerprint className="w-5 h-5 text-purple-600" />
                            Employee ID & Tenure
                          </h3>
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-xs text-gray-500 uppercase tracking-wider">
                                Employee ID
                              </label>
                              <code className="block text-sm bg-purple-100 text-purple-800 p-2 rounded-lg font-mono truncate">
                                {employee.employee.id}
                              </code>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-gray-500 uppercase tracking-wider">
                                User ID
                              </label>
                              <code className="block text-sm bg-gray-100 text-gray-800 p-2 rounded-lg font-mono truncate">
                                {employee.id}
                              </code>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-gray-500 uppercase tracking-wider">
                                Employment Tenure
                              </label>
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-800 font-medium">
                                  {calculateTenure(employee.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Verification Status */}
                        <div className={`rounded-xl p-5 border ${
                          employee.employee.isVerified 
                            ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100'
                            : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100'
                        }`}>
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            {employee.employee.isVerified ? (
                              <Verified className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-amber-600" />
                            )}
                            Verification Status
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">Profile Verified</span>
                              {employee.employee.isVerified ? (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium flex items-center gap-1">
                                  <Verified className="w-3 h-3" />
                                  Verified
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                                  Not Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">Account Status</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(employee.status)}`}>
                                {employee.status}
                              </span>
                            </div>
                          </div>
                          {!employee.employee.isVerified && (
                            <button
                              onClick={() => handleAction('verify')}
                              className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                              Verify Employee
                            </button>
                          )}
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
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Joined</span>
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(employee.createdAt)}</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Profile Updated</span>
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(employee.employee.updatedAt)}</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Account Updated</span>
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(employee.updatedAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        {employee.employee.extraFields && employee.employee.extraFields.filter(f => 
                          !['address', 'city', 'district'].includes(f.key.toLowerCase())
                        ).length > 0 && (
                          <div className="bg-gradient-to-br from-gray-50 to-blue-gray-50 rounded-xl p-5 border border-gray-200">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-gray-600" />
                              Additional Information
                            </h3>
                            <div className="space-y-2">
                              {employee.employee.extraFields
                                .filter(f => !['address', 'city', 'district'].includes(f.key.toLowerCase()))
                                .map((field, index) => (
                                  <div 
                                    key={index}
                                    className="flex justify-between items-center bg-white/70 p-2 rounded-lg"
                                  >
                                    <span className="text-sm text-gray-600 capitalize">{field.key}:</span>
                                    <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                                      {field.value}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Profile Photo */}
                      <div className="bg-white rounded-xl p-5 border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-600" />
                          Profile Photo
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {employee.employee.avatar ? (
                            <div className="space-y-4">
                              <img
                                src={employee.employee.avatar}
                                alt="Profile"
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <div className="flex gap-3">
                                <button
                                  onClick={() => window.open(employee.employee.avatar, '_blank')}
                                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                                <button
                                  onClick={() => handleAction('edit')}
                                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                  Change Photo
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500">No profile photo uploaded</p>
                              <button
                                onClick={() => handleAction('edit')}
                                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                Upload Photo
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CNIC Document */}
                      <div className="bg-white rounded-xl p-5 border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Key className="w-5 h-5 text-gray-600" />
                          CNIC Document
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {employee.employee.cnic ? (
                            <div className="space-y-4">
                              <div className="relative w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Key className="w-16 h-16 text-indigo-400" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                  <p className="text-white font-medium">Identity Document</p>
                                  <p className="text-white/80 text-sm">Uploaded: {formatDate(employee.employee.createdAt)}</p>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => window.open(employee.employee.cnic, '_blank')}
                                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                                <button
                                  onClick={() => console.log("Verify CNIC:", employee.id)}
                                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Verified className="w-4 h-4" />
                                  Verify
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500">No CNIC document uploaded</p>
                              <button
                                onClick={() => handleAction('edit')}
                                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                Upload CNIC
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Verification Requirements */}
                    <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-amber-600" />
                        Verification Requirements
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              employee.employee.avatar ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {employee.employee.avatar ? (
                                <UserCheck className="w-4 h-4" />
                              ) : (
                                <User className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">Profile Photo</p>
                              <p className="text-sm text-gray-500">
                                {employee.employee.avatar ? 'Uploaded' : 'Required'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              employee.employee.cnic ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {employee.employee.cnic ? (
                                <Verified className="w-4 h-4" />
                              ) : (
                                <Key className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">CNIC Document</p>
                              <p className="text-sm text-gray-500">
                                {employee.employee.cnic ? 'Uploaded' : 'Required'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="p-6">
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        Recent Activity
                      </h3>
                      <div className="space-y-4">
                        {/* Activity Items */}
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-gray-800">Account created and profile setup completed</p>
                            <p className="text-sm text-gray-500 mt-1">{formatDate(employee.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-gray-800">Assigned to {employee.employee.building.buildingName}</p>
                            <p className="text-sm text-gray-500 mt-1">{formatDate(employee.employee.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 mt-2 bg-purple-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-gray-800">Profile information updated</p>
                            <p className="text-sm text-gray-500 mt-1">{formatDate(employee.employee.updatedAt)}</p>
                          </div>
                        </div>
                        {employee.status !== 'active' && (
                          <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 mt-2 bg-red-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-gray-800">Account status changed to {employee.status}</p>
                              <p className="text-sm text-gray-500 mt-1">{formatDate(employee.updatedAt)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* No Activity Message */}
                      {!employee.createdAt && (
                        <div className="text-center py-12">
                          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">No activity recorded yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Employee Access Level: {employee.role}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleAction('message')}
                      className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                    <button
                      onClick={() => handleAction(employee.status === 'active' ? 'suspend' : 'activate')}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                        employee.status === 'active'
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {employee.status === 'active' ? 'Suspend' : 'Activate'}
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