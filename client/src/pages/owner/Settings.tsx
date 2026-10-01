import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Shield,
  Building2,
  Hash,
  Sparkles,
  KeyRound,
  ChevronRight,
} from "lucide-react";
import { getErrorMessage } from "../../lib/utils";

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  basic: {
    label: "Basic",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  pro: {
    label: "Pro",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  enterprise: {
    label: "Enterprise",
    color:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  },
};

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<{
    subscriptionPlan: string;
    maxBuildings: number;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessAddress: "",
    taxId: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/owner/profile");
      const user = data.data.user; // real shape: { data: { user: { ...ownerProfile } } }
      const profile = user.ownerProfile || {};
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: profile.phone || "",
        businessName: profile.businessName || "",
        businessAddress: profile.businessAddress || "",
        taxId: profile.taxId || "",
      });
      setPlan({
        subscriptionPlan: profile.subscriptionPlan || "basic",
        maxBuildings: profile.maxBuildings ?? 3,
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/owner/profile", {
        name: formData.name,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        phone: formData.phone,
        taxId: formData.taxId,
      });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500 animate-pulse">Loading settings...</div>
    );
  }

  const planInfo = PLAN_LABELS[plan?.subscriptionPlan || "basic"];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          Account Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your owner profile and preferences
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center gap-4">
          <div
            style={{ fontFamily: "var(--font-display)" }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
          >
            {formData.name.charAt(0).toUpperCase() || "O"}
          </div>
          <div>
            <h2
              style={{ fontFamily: "var(--font-display)" }}
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              {formData.name || "Owner Name"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-sm">
              <Shield size={14} /> Owner Account
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <User size={16} className="text-gray-400" /> Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Mail size={16} className="text-gray-400" /> Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500 outline-none cursor-not-allowed"
              />
              <p className="text-xs text-gray-400">
                Contact support to change your login email.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Phone size={16} className="text-gray-400" /> Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Building2 size={16} className="text-gray-400" /> Business Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Hash size={16} className="text-gray-400" /> Tax ID
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) =>
                  setFormData({ ...formData, taxId: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MapPin size={16} className="text-gray-400" /> Business Address
              </label>
              <textarea
                rows={3}
                value={formData.businessAddress}
                onChange={(e) =>
                  setFormData({ ...formData, businessAddress: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-70"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Subscription plan */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                style={{ fontFamily: "var(--font-display)" }}
                className="font-bold text-gray-900 dark:text-white"
              >
                Current Plan
              </h3>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planInfo.color}`}
              >
                {planInfo.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Up to {plan?.maxBuildings} building
              {plan?.maxBuildings !== 1 ? "s" : ""} included
            </p>
          </div>
        </div>
        {plan?.subscriptionPlan !== "enterprise" && (
          <button className="px-4 py-2.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:opacity-90 transition-opacity">
            Upgrade Plan
          </button>
        )}
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h3
          style={{ fontFamily: "var(--font-display)" }}
          className="font-bold text-gray-900 dark:text-white mb-4"
        >
          Security
        </h3>
        <a
          href="/change-password"
          className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Change Password
              </p>
              <p className="text-xs text-gray-400">
                Update the password you use to log in
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
        </a>
      </div>
    </div>
  );
}
