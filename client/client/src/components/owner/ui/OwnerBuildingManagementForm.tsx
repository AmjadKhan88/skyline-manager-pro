import { Delete } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "react-select";
import { toast } from "react-hot-toast";
import api from "../../../configs/api";
import { useQueryParams } from "../../../hooks/useQueryParams";
import { useSearchParams } from 'react-router-dom';
import Spinner from "../../loaders/Spinner";

const BuildingTypeOptions = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "mixed-use", label: "Mixed-Use" },
  { value: "educational", label: "Educational" },
  { value: "healthcare", label: "Healthcare" },
  { value: "closed", label: "Closed" },
];

const StatusOptions = [
  { value: "operational", label: "Operational" },
  { value: "planning", label: "Planning" },
  { value: "under-construction", label: "Under Construction" },
  { value: "completed", label: "Completed" },
  { value: "occupied", label: "Occupied" },
  { value: "occupied", label: "Occupied" },
  { value: "renovating", label: "Renovating" },
];

const isActiveOptions = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
];

const customStyles = {
  control: (base: any) => ({
    ...base,
    padding: "4px",
    borderRadius: "10px",
    boxShadow: "none",
    borderColor: "#d1d5db",
    "&:hover": {
      borderColor: "#9ca3af",
    },
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#f3f4f6" : "white",
    color: state.isSelected ? "white" : "#374151",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
  }),
};

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

// Define Zod schema for validation
const buildingSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Building name is required" })
    .max(100, { message: "Building name must be 100 characters or less" }),
  address: z
    .string()
    .min(1, { message: "Address is required" })
    .max(200, { message: "Address must be 200 characters or less" }),
  floors: z
    .string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: "Number of floors must be a positive number",
    }),
  units: z
    .string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: "Number of units must be a positive number",
    }),
  manager: z
    .string()
    .max(400, { message: "Manager name must be 400 characters or less" })
    .optional(),
  buildingType: z.string().optional(),
  status: z.string().optional(),
  energyRating: z.string().optional(),
  greenCertification: z.string().optional(),
  description: z
    .string()
    .max(500, { message: "Description must be 500 characters or less" })
    .optional(),
  isActive: z.boolean().default(true),
});

// Infer the type from Zod schema
type BuildingFormData = z.infer<typeof buildingSchema>;

interface ExtraField {
  key: string;
  value: string;
}

interface BuildingManagementFormProps {
  buildings: Building[];
  setBuildings: React.Dispatch<React.SetStateAction<Building[]>>;
  setShowAddForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function BuildingManagementForm({
  buildings,
  setBuildings,
  setShowAddForm,
}: BuildingManagementFormProps) {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getParam, removeParam } = useQueryParams();

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<BuildingFormData>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      name: "",
      address: "",
      floors: "",
      units: "",
      manager: "",
      buildingType: "",
      status: "",
      energyRating: "",
      greenCertification: "",
      description: "",
      isActive: true,

    },
  });

  const onSubmit = async (data: BuildingFormData) => {
    setIsSubmitting(true);
    toast.loading("Adding building...", { id: "addingBuilding" });
    const newBuilding: Building = {
      name: data.name,
      address: data.address,
      floors: parseInt(data.floors),
      units: parseInt(data.units),
      occupancy: 0,
      managerId: data.manager,
      isActive: data.isActive,
      buildingType: data.buildingType,
      status: data.status,
      description: data.description,
      energyRating: data.energyRating,
      greenCertification: data.greenCertification,
      extraFields: extraFields.filter((f) => f.key && f.value),
    };


    try {
      // Simulate API call or processing

      if(id) {
        const { data } = await api.put(`/api/owner/buildings/${id}`, newBuilding);
        toast.success(data.message || "Building updated successfully");
        const updatedBuildings = buildings.map(b => b.id == id ? data.building : b);
        setBuildings(updatedBuildings);
        reset();
        setExtraFields([]);
        setShowAddForm(false);
        removeParam('id');
      }else {
        const { data } = await api.post("/api/owner/buildings", newBuilding);
        toast.success(data.message || "Building added successfully");
        setBuildings([...buildings, data.building]);
        reset();
        setExtraFields([]);
        setShowAddForm(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.error("Error adding building:", error);
      return;
    } finally {
      setIsSubmitting(false);
      toast.dismiss("addingBuilding");
    }


  };

  // Dynamic Extra Fields State
  const handleAddField = () => {
    setExtraFields([...extraFields, { key: "", value: "" }]);
  };

  const handleFieldChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const updated = [...extraFields];
    updated[index][field] = value;
    setExtraFields(updated);
  };

  const handleRemoveField = (index: number) => {
    const updated = [...extraFields];
    updated.splice(index, 1);
    setExtraFields(updated);
  };

  const cancelBuildingForm = () => {
    setShowAddForm(false);
    if(getParam('id')) removeParam('id');
  };

  useEffect(() => {
    if (id) {
      const building = buildings.find(b => b.id == id);
      if (building) {
        reset({
          name: building.name,
          address: building.address,
          floors: building.floors.toString(),
          units: building.units.toString(),
          manager: building.managerId || "",
          buildingType: building.buildingType,
          status: building.status,
          description: building.description,
          energyRating: building.energyRating,
          greenCertification: building.greenCertification,
        });
        setExtraFields(building.extraFields || []);
      }
    }
  }, [searchParams, reset]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{id ? "Update Building" : "Add New Building"}</h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Building Name */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Building Name
          </label>
          <input
            type="text"
            {...register("name")}
            className={`w-full px-4 py-2 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="e.g., Skyline Tower C"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Address</label>
          <input
            type="text"
            {...register("address")}
            className={`w-full px-4 py-2 border ${errors.address ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="e.g., 123 Main Street"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Number of Floors */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Number of Floors
          </label>
          <input
            type="number"
            {...register("floors")}
            className={`w-full px-4 py-2 border ${errors.floors ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="e.g., 20"
          />
          {errors.floors && (
            <p className="mt-1 text-sm text-red-600">{errors.floors.message}</p>
          )}
        </div>

        {/* Number of Units */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Number of Units
          </label>
          <input
            type="number"
            {...register("units")}
            className={`w-full px-4 py-2 border ${errors.units ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="e.g., 100"
          />
          {errors.units && (
            <p className="mt-1 text-sm text-red-600">{errors.units.message}</p>
          )}
        </div>

        {/* Building Characteristics */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Building Type
          </label>
          <Controller
            name="buildingType"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                className="w-full"
                placeholder="Select Building Type"
                styles={customStyles}
                options={BuildingTypeOptions}
                value={BuildingTypeOptions.find(
                  (option) => option.value === field.value
                )}
                onChange={(selected) => field.onChange(selected?.value)}
                isClearable
              />
            )}
          />
          {errors.buildingType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.buildingType.message}
            </p>
          )}
        </div>

        {/* Manager */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Manager (optional)</label>
          <input
            type="text"
            {...register("manager")}
            className={`w-full px-4 py-2 border ${errors.manager ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="e.g., John Doe"
          />
          {errors.manager && (
            <p className="mt-1 text-sm text-red-600">
              {errors.manager.message}
            </p>
          )}
        </div>

        {/* Building Status & Is Active */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-2">
              Building Status
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-full"
                  placeholder="Select Status"
                  styles={customStyles}
                  options={StatusOptions}
                  value={StatusOptions.find(
                    (option) => option.value === field.value
                  )}
                  onChange={(selected) => field.onChange(selected?.value)}
                  isClearable
                />
              )}
            />
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">
                {errors.status.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-2">
              Is Active
            </label>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-full"
                  styles={customStyles}
                  isSearchable={false}
                  options={isActiveOptions}
                  value={isActiveOptions.find(
                    (option) => option.value === field.value
                  )}
                  onChange={(selected) => field.onChange(selected?.value)}
                />
              )}
            />
            {errors.isActive && (
              <p className="mt-1 text-sm text-red-600">
                {errors.isActive.message}
              </p>
            )}
          </div>
        </div>

        {/* Energy Rating and Green Certification */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-2">
              Energy Rating
            </label>
            <input
              type="text"
              {...register("energyRating")}
              className={`w-full px-4 py-2 border ${errors.energyRating ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="e.g., A, B, C"
            />
            {errors.energyRating && (
              <p className="mt-1 text-sm text-red-600">
                {errors.energyRating.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-2">
              Green Certification
            </label>
            <input
              type="text"
              {...register("greenCertification")}
              className={`w-full px-4 py-2 border ${errors.greenCertification ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="e.g., LEED, BREEAM"
            />
            {errors.greenCertification && (
              <p className="mt-1 text-sm text-red-600">
                {errors.greenCertification.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 mb-2">
            Description
          </label>
          <textarea
            rows={3}
            {...register("description")}
            className={`w-full px-4 py-2 border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="e.g., description of the building"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Dynamic Extra Fields Section */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm text-gray-700">
              Extra Fields (Key - Value)
            </label>
            <span className="text-xs text-gray-500">
              Add custom fields for your building
            </span>
          </div>
          {extraFields.map((field, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                placeholder="Key (e.g., Year Built, Amenities)"
                value={field.key}
                onChange={(e) =>
                  handleFieldChange(index, "key", e.target.value)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Value"
                value={field.value}
                onChange={(e) =>
                  handleFieldChange(index, "value", e.target.value)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => handleRemoveField(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                aria-label="Remove field"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddField}
            type="button"
            className="flex items-center gap-2.5 border border-gray-500/30 px-4 py-2 text-sm text-gray-800 rounded bg-white hover:text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400/30 active:scale-95 transition"
          >
            <svg
              width="18"
              height="20"
              viewBox="0 0 18 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.798 1H4.12c-1.092 0-1.638 0-2.055.212a1.95 1.95 0 0 0-.852.852C1 2.481 1 3.027 1 4.12v11.308c0 1.091 0 1.637.212 2.054.187.367.486.665.852.852.417.213.963.213 2.055.213h1.755M8.798 1l5.849 5.849M8.798 1v4.289c0 .546 0 .819.106 1.027a1 1 0 0 0 .426.426c.209.107.482.107 1.028.107h4.289m0 0v.974M9.773 18.546l1.974-.395c.172-.034.258-.052.338-.083a1 1 0 0 0 .202-.108c.07-.05.133-.111.257-.236l4.052-4.052a1.378 1.378 0 1 0-1.95-1.95l-4.052 4.053c-.124.124-.186.186-.235.257a1 1 0 0 0-.108.201c-.032.08-.049.167-.083.339z"
                stroke="#FACC14"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add Custom Field
          </button>
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isSubmitting ? <Spinner/> : id ? "Update Building" : "Add Building"}
          </button>
          <button
            type="button"
            onClick={cancelBuildingForm}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}