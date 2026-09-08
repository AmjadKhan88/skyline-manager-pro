import { useEffect, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { optional, z } from "zod";
import { Delete, Loader2 } from "lucide-react";
import Select from "react-select";
import { useOwner } from "../../../context/OwnerContext";
import api from "../../../configs/api";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";

import { useSearchParams } from "react-router-dom";
import { useQueryParams } from "../../../hooks/useQueryParams";

const fileTypes = ["JPG", "PNG", "jpeg"];
const fileTypesForCnic = ["JPG", "PNG", "jpeg", "PDF"];

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  building: string;
  password: string;
  confirmPassword: string;
  salary: number;
  employeeRole: string;
  status: "active" | "inactive";
}

// Create conditional schema based on whether we have an id or not
const createEmplyeeSchema = (hasId: boolean) => {
  // Base schema for both create and update
  const baseSchema = z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    phone: z
      .string()
      .min(1, "Phone is required")
      .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format"),
    building: z.string().min(1, "Building is required"),
    salary: z.coerce
      .number()
      .min(1, "Salary must be at least $1")
      .max(1000000, "Salary cannot exceed $1,000,000")
      .positive("Salary must be positive"),
    status: z.enum(["active", "inactive"]),
    employeeRole: z.string().min(1, "Employee role is required"),
  });
  // If updating (hasId is true), password fields are optional
  if (hasId) {
    return baseSchema
      .extend({
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .optional()
          .or(z.literal("")),
        confirmPassword: z.string().optional().or(z.literal("")),
      })
      .refine(
        (data) => {
          // Only validate if BOTH password and confirmPassword are provided
          if (data.password && data.confirmPassword) {
            return data.password === data.confirmPassword;
          }
          // If only one is provided, show error
          if (data.password && !data.confirmPassword) {
            return false;
          }
          if (!data.password && data.confirmPassword) {
            return false;
          }
          return true;
        },
        {
          message: "Passwords do not match or only one field is filled",
          path: ["confirmPassword"],
        },
      );
  }
  // If creating (hasId is false), password fields are required
  return baseSchema
    .extend({
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
};

/* UTILITY TO GET CROPPED IMAGE AS FILE */
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: any,
): Promise<File> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], "avatar.jpg", { type: "image/jpeg" }));
    }, "image/jpeg");
  });
};

export default function OwnerEmployeeForm({
  setEmployees,
  employees,
  setShowAddForm,
}) {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Employee>({
    resolver: zodResolver(createEmplyeeSchema(!!id)),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      building: "",
      salary: 0,
      password: "",
      confirmPassword: "",
      employeeRole: "",
      status: "active",
    },
  });

  // Watch form values for real-time updates
  const formData = watch();
  // Avatar crop state
  const { buildings } = useOwner();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cnic, setCnic] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [formErrors, setFormErrors] = useState({});
  const [oldImage, setOldImage] = useState("");
  const [oldCnic, setOldCnic] = useState("");
  const { removeParam } = useQueryParams();

  // Dynamic key-value fields
  const [extraFields, setExtraFields] = useState<
    { key: string; value: string }[]
  >([]);

  const handleAvatarUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setCropOpen(true);
  };

  const handleCnicUpload = (file: File) => {
    setCnic(file);
  };

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
    setAvatar(croppedFile);
    setCropOpen(false);
  };

  // building select options
  const BuildingOptions: { value: string; label: string }[] = [];

  BuildingOptions.push(
    ...buildings.map((b) => ({ value: b.id, label: b.name })),
  );

  // custom style for buildig select
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
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
          ? "#f3f4f6"
          : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": {
        backgroundColor: "#f3f4f6",
      },
    }),
  };

  const onSubmit = async (data) => {
    try {
      if (!id) {
        if (!avatar || !cnic) {
          setFormErrors({
            avatar: avatar ? "" : "Please upload and crop an avatar image.",
            cnic: cnic ? "" : "Please upload a CNIC/ID/PASSPORT.",
          });
          return;
        }

        if (!(avatar instanceof File)) {
          toast.error("Invalid file format");
          return;
        }
      }

    

      // Simulate API call or processing
      toast.loading(id ? "Updating Employee..." : "Adding Employee...", {
        id: "addingEmployee",
      });

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      if (data.password) {
        formData.append("password", data.password);
      }
      formData.append("employeeRole", data.employeeRole);
      formData.append("phone", data.phone);
      formData.append("buildingId", data.building);
      formData.append("salary", data.salary);
      formData.append("status", data.status);
      if (avatar) {
        formData.append("avatar", avatar);
      }
      if (cnic) {
        formData.append("cnic", cnic);
      }
      formData.append(
        "extraFields",
        extraFields ? JSON.stringify(extraFields) : "",
      );

      const path = id ? `/api/owner/employees/${id}` : "/api/owner/employees";
      const response = await api.post(path, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        if (id) {
          setEmployees(
            employees.map((m) => (m.id == id ? response.data.employee : m)),
          );
        } else {
          setEmployees([...employees, response.data.employee]);
        }
        // Reset form
        setValue("name", "");
        setValue("email", "");
        setValue("phone", "");
        setValue("building", "");
        setValue("salary", 0);
        setValue("employeeRole", "");
        setValue("password", "");
        setValue("confirmPassword", "");
        setValue("status", "active");

        setExtraFields([]);
        setAvatar(null);
        setCnic(null);
        setShowAddForm(false);
        if (id) {
          removeParam("id");
        }
      }
    } catch (error) {
      toast.error(
        `Failed to ${id ? "update" : "add"} employee. Please try again.`,
      );
    } finally {
      toast.dismiss("addingEmployee");
    }
  };

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

    useEffect(() => {
      if (id) {
        const employee = employees.find((b) => b.id == id);
        if (employee) {
          console.log(employee);
          reset({
            name: employee.name,
            email: employee.email,
            building: employee.employee.buildingId,
            phone: employee.employee.phone,
            salary: employee.employee.salary,
            employeeRole: employee.employee.employeeRole,
            status: employee.status,
          });
          setOldImage(employee.employee.avatar);
          setOldCnic(employee.employee.cnic);
          setExtraFields(employee.employee.extraFields || []);
        }
      }
    }, [searchParams, reset]);

  return (
    <>
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Employee</h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Avatar Upload */}
        <div className="relative">
          <label className="block text-sm text-gray-700 mb-2">
            Avatar / Profile Picture
          </label>
          <FileUploader
            handleChange={handleAvatarUpload}
            onTypeError={() => toast.error("Invalid file type")}
            onSizeError={() => toast.error("File must be less than 3MB")}
            maxSize={3}
            label={id ? "Upload New Avatar (Optional)" : "Upload Avatar"}
            name="file"
            types={fileTypes}
          />
          {(avatar || oldImage) && (
            <img
              src={
                avatar instanceof File ? URL.createObjectURL(avatar) : oldImage
              }
              className="h-11 absolute top-7.5 left-2 rounded hover:h-20 transition-all duration-300"
              alt="Avatar Preview"
            />
          )}
          {formErrors.avatar && (
            <p className="mt-1 text-sm text-red-600">{formErrors.avatar}</p>
          )}
        </div>

        {/* CNIC Upload */}
        <div className="relative">
          <label className="block text-sm text-gray-700 mb-2">
            CNIC/ID / PASSPORT
          </label>
          <FileUploader
            handleChange={handleCnicUpload}
            onTypeError={() => toast.error("Invalid file type")}
            onSizeError={() => toast.error("File must be less than 2MB")}
            maxSize={2}
            label={
              id ? "Upload New CNIC (Optional)" : "Upload CNIC/ID / PASSPORT"
            }
            name="file"
            types={fileTypesForCnic}
          />
          {(cnic || oldCnic) && (
            <img
              src={cnic instanceof File ? URL.createObjectURL(cnic) : oldCnic}
              className="h-11 absolute top-7.5 left-2 rounded hover:h-20 transition-all duration-300"
              alt="Avatar Preview"
            />
          )}
          {formErrors.cnic && (
            <p className="mt-1 text-sm text-red-600">{formErrors.cnic}</p>
          )}
        </div>

        {/* // full name input  */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            {...register("name")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* // email input  */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            {...register("email")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., john@skyline.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* // phone number  */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Phone</label>
          <Controller
            name="phone"
            control={control}
            rules={{
              required: "Phone number is required",
              validate: (value) =>
                isValidPhoneNumber(value) ||
                "Invalid phone number for selected country",
            }}
            render={({ field }) => (
              <PhoneInput
                {...field}
                defaultCountry="PK"
                placeholder="Enter phone number"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            )}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

          {/* // assigned buildig  */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Assigned Building
          </label>
          <Controller
            name="building"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                className="w-full"
                placeholder="Select Building Type"
                styles={customStyles}
                options={BuildingOptions}
                value={BuildingOptions.find(
                  (option) => option.value === field.value,
                )}
                onChange={(selected) => field.onChange(selected?.value)}
                isClearable
              />
            )}
          />
          {errors.building && (
            <p className="mt-1 text-sm text-red-600">
              {errors.building.message}
            </p>
          )}
        </div>

          {/* // employee role  */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Employee Role
          </label>
          <select
            {...register("employeeRole")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select Role</option>
            <option value="maintenance">Maintenance</option>
            <option value="security">Security</option>
            <option value="cleaning">Cleaning</option>
            <option value="reception">Reception</option>
            <option value="landscaping">Landscaping</option>
          </select>
          {errors.employeeRole && (
            <p className="mt-1 text-sm text-red-600">
              {errors.employeeRole.message}
            </p>
          )}
        </div>

          {/* // monthly salary  */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Monthly Salary ($)
          </label>
          <input
            type="number"
            {...register("salary", { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., 3000"
          />
          {errors.salary && (
            <p className="mt-1 text-sm text-red-600">{errors.salary.message}</p>
          )}
        </div>

        {/* // password and cofiram password  */}
        {!id && (
          <>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </>
        )}

        {/* // status  */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Status</label>
          <label className="flex gap-3 items-center cursor-pointer relative mt-4">
            <input
              type="checkbox"
              className="hidden peer"
              {...register("status", {
                onChange: (e) =>
                  setValue("status", e.target.checked ? "active" : "inactive"),
              })}
            />
            <span className="w-5 h-5 border border-slate-300 rounded relative flex items-center justify-center peer-checked:border-blue-600"></span>
            <svg
              className="absolute hidden peer-checked:inline left-1 top-1/2 transform -translate-y-1/2"
              width="11"
              height="8"
              viewBox="0 0 11 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m10.092.952-.005-.006-.006-.005A.45.45 0 0 0 9.43.939L4.162 6.23 1.585 3.636a.45.45 0 0 0-.652 0 .47.47 0 0 0 0 .657l.002.002L3.58 6.958a.8.8 0 0 0 .567.242.78.78 0 0 0 .567-.242l5.333-5.356a.474.474 0 0 0 .044-.65Zm-5.86 5.349V6.3Z"
                fill="#2563EB"
                stroke="#2563EB"
                strokeWidth=".4"
              />
            </svg>
            <span className="text-gray-700 select-none">Active</span>
          </label>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Dynamic Extra Fields Section */}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 mb-2">
            Extra Fields (Key - Value)
          </label>
          {extraFields.map((field, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                placeholder="Key"
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
            Add Field
          </button>
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button
            disabled={isSubmitting}
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
           {isSubmitting ? <Loader2/> : id ? "Update Employee" : "Add Employee"}
          </button>
          <button
            type="button"
            onClick={() => {setShowAddForm(false),removeParam("id")}}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
    {/* CROPPER MODAL */}
      {cropOpen && imageSrc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg w-[90%] max-w-md">
            <div className="relative h-[300px] bg-black rounded overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              />
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(+e.target.value)}
              className="w-full mt-3"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setCropOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
      </>
  );
}
