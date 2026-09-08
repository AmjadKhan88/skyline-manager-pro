import { useState } from "react";
import {  z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import {
  Building2,
  Users,
  Briefcase,
  Check,
  HandPlatter,
  Facebook,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { UserRole } from "../../types";
import useGlobal from "../../context/GlobalContext";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../../configs/api";

/* -------------------- ROLE CONFIG -------------------- */

const roleConfig: Record<UserRole, any> = {
  owner: {
    title: "Building Owner",
    icon: Building2,
    color: "bg-blue-600",
    benefits: [
      "Automated rent collection and financial tracking",
      "Comprehensive maintenance management system",
      "Real-time analytics and performance insights",
    ],
  },
  tenant: {
    title: "Tenant/Business",
    icon: Users,
    color: "bg-purple-600",
    benefits: [
      "Easy online payment processing",
      "Quick service request submission",
      "24/7 access to your shop portal",
      "Notification from owner or manager",
    ],
  },
  employee: {
    title: "Login is employee",
    icon: HandPlatter,
    color: "bg-gray-600",
    benefits: [
      "Easy online payment request",
      "Quick service request submission",
      "24/7 access to your employee portal",
      "Notification from owner or manager",
    ],
  },
  manager: {
    title: "Manager & building agent",
    icon: Briefcase,
    color: "bg-emerald-600",
    benefits: [
      "Employ & building management",
      "Client relationship coordination tools",
      "Commission tracking and reporting",
      "Order & notification from Owner/Manager",
    ],
  },
};

/* -------------------- ZOD SCHEMA -------------------- */

const authSchema = z.object({
  role: z.string(),
  state: z.enum(["login", "signup"]),
  name: z.string().optional(), // start optional
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
.superRefine((data, ctx) => {
  if (data.role === "owner" && data.state === "signup") {
    if (!data.name || data.name.trim().length < 2) {
      ctx.addIssue({
        path: ["name"],
        code: z.ZodIssueCode.too_small,
        minimum: 2,
        message: "Name is required",
      });
    }
  }
});


type AuthFormData = z.infer<typeof authSchema>;

/* -------------------- COMPONENT -------------------- */

interface RoleModalProps {
  selectedRole: UserRole;
  onClose: () => void;
}

export function RoleModal({ selectedRole, onClose }: RoleModalProps) {  
  const config = roleConfig[selectedRole];
  const {user,setUser} = useGlobal();
  const navigate = useNavigate();


  if(user && user.role) navigate(`/${user.role}`);


  const [state, setState] = useState<"login" | "signup">("login");
  const [form, setForm] = useState<AuthFormData>({
    role: selectedRole,
    state: "login",
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>("");
  const [loading, setLoading] = useState(false);


  if (!config) return null;
  const Icon = config.icon;

  /* -------------------- HANDLERS -------------------- */

  const updateField = (field: keyof AuthFormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const result = authSchema.safeParse({
    ...form,
    role: selectedRole,
    state,
  });

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};

    result.error.issues.forEach((err) => {
      const field = err.path[0] as string;
      fieldErrors[field] = err.message;
    });

    setErrors(fieldErrors);
    console.log(fieldErrors)
    return;
  }

  setErrors({});
  setServerError("");

  setLoading(true);

  try {

    const url = state === "login" ? "/auth/login" : "/auth/signup";

    const { data } = await api.post(url, result.data);

    if (data.success) {
      toast.success(data.message);
      setUser(data.data.user);
      onClose();
      navigate(`/${data.data.user.role}`);
    }

  } catch (error:any) {
    toast.error(error?.response?.data?.message || error.message);
    setServerError(error?.response?.data?.message || error.message);
    console.log(error);
  } finally {
    setLoading(false);
  }
 
  
};


  const handleSocialLogin = (provider: string) => {
    if (provider === "Google") {
      window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/google`;
    }
    onClose();
  };
  

  /* -------------------- JSX -------------------- */

  return (
    <Dialog open={!!selectedRole} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`${config.color} text-white p-2 rounded-lg`}>
              <Icon className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl">{config.title}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Benefits */}
        <div className="bg-accent/50 rounded-lg p-4 mb-6">
          <h4 className="mb-3">Key Benefits:</h4>
          <ul className="space-y-2">
            {config.benefits.map((benefit: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

         {serverError && (
              <p className="text-red-500 my-2 text-xs">{serverError}</p>
            )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedRole === "owner" && state === "signup" && (
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="p-5"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>
          )}

          <div>
            <Label>Email</Label>
            <Input
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="p-5"
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
           
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="p-5"
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg">
           {loading ? <Loader2 className="animate-spin" /> : state === "login" ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        {selectedRole === "owner" && (
          <>
            <div className="relative my-6">
              <Separator />
              <span className="absolute inset-0 flex items-center justify-center text-sm bg-background px-2">
                Or continue with
              </span>
            </div>

              <Button
                type="button"
                className="w-full"
                variant="destructive"
                onClick={() => handleSocialLogin("Google")}
              >
                Google
              </Button>


            <div className="text-center mt-6">
              <Button
                variant="link"
                onClick={() =>
                  {setState((prev) => (prev === "login" ? "signup" : "login")), setServerError("")}
                }
              >
                {state === "login" ? <p>Not a member? <span className="text-sky-600">Sign up here</span></p> : <p>Already a member? <span className="text-sky-600">Login here</span></p>}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
