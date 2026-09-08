import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Edit,
  Trash2,
  Briefcase,
} from "lucide-react";
import OwnerEmployeeForm from "./ui/OwnerEmployeeForm";
import { useOwner } from "../../context/OwnerContext";
import { useQueryParams } from "../../hooks/useQueryParams";
import { Eye } from "lucide-react";
import EmployeeDetailsModal from "./ui/EmployeeDetailsModal";

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  building: string;
  salary: number;
  status: "active" | "inactive";
}

export function EmployeeManagement() {
  const { employees, setEmployees } = useOwner();
  const { removeParam, setParam } = useQueryParams();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  // Handler function
  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const updateManager = (id: any) => {
    setParam("id", id);
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    setEmployees(employees.filter((e:any) => e.id !== id));
  };

  const filteredEmployees = employees.filter(
    (employee:any) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.building.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Optional action handler
  const handleEmployeeAction = (action: string, employeeId: string) => {
    switch (action) {
      case "verify":
        // API call to verify employee
        console.log("Verify employee:", employeeId);
        break;
      case "suspend":
        // API call to suspend employee
        console.log("Suspend employee:", employeeId);
        break;
      case "activate":
        // API call to activate employee
        console.log("Activate employee:", employeeId);
        break;
      case "message":
        // Open message dialog
        console.log("Message employee:", employeeId);
        break;
      case "edit":
        // Open edit form
        console.log("Edit employee:", employeeId);
        break;
    }
  };

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Employee Management
            </h1>
            <p className="text-gray-600">
              Manage your workforce across all buildings
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

        {/* Add Employee Form */}
        {showAddForm && (
          <OwnerEmployeeForm
            setEmployees={setEmployees}
            employees={employees}
            setShowAddForm={setShowAddForm}
          />
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
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
                {filteredEmployees.map((employee:any, index:any) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {employee.name}
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
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {employee.employee.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">
                          {employee.employee.employeeRole}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">
                        {employee?.employee?.building?.buildingName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        ${employee?.employee?.salary}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          employee.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewEmployee(employee)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="View Employee Details"
                        >
                          <Eye className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                        </button>
                        <button
                          onClick={() => updateManager(employee.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
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
      {/* // Render modal */}
      <EmployeeDetailsModal
        isOpen={showEmployeeModal}
        onClose={() => {
          setShowEmployeeModal(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onEmployeeAction={handleEmployeeAction}
      />
    </>
  );
}
