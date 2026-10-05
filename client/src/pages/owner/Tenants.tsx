import React, { useState, useEffect, useRef } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trash2 as TrashIcon,
  PenLine,
  CheckCircle2,
} from "lucide-react";
import { cn, getErrorMessage } from "../../lib/utils";
import SignaturePad, {
  SignaturePadHandle,
} from "../../components/SignaturePad";
import { LeaseSignature } from "../../types/index";

export default function Tenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [signaturesByTenancy, setSignaturesByTenancy] = useState<
    Record<string, { signatures: LeaseSignature[]; isFullyExecuted: boolean }>
  >({});
  const [signModalTenancy, setSignModalTenancy] = useState<string | null>(null);
  const [typedName, setTypedName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const padRef = useRef<SignaturePadHandle>(null);

  const LIMIT = 10;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    buildingId: "",
    unitNumber: "",
    monthlyRent: "",
    depositAmount: "",
    leaseStart: "",
    leaseEnd: "",
  });

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (search) params.search = search;
      const { data } = await api.get("/tenants", { params });
      setTenants(data.data || []);
      setTotal(data.pagination?.total ?? data.data?.length ?? 0);
      const tenancyIds = (data.data || [])
        .map((t: any) => t.tenancies?.[0]?.id)
        .filter(Boolean);
      fetchSignatureStatus(tenancyIds);
    } catch {
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  const fetchSignatureStatus = async (tenancyIds: string[]) => {
    const results = await Promise.all(
      tenancyIds.map((id) =>
        api
          .get(`/signatures/tenancy/${id}`)
          .then((res) => [id, res.data.data] as const),
      ),
    );
    setSignaturesByTenancy((prev) => ({
      ...prev,
      ...Object.fromEntries(results),
    }));
  };

  useEffect(() => {
    api
      .get("/buildings", { params: { limit: 100 } })
      .then((res) => setBuildings(res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [page, search]);

  const handleOpenModal = (tenant: any = null) => {
    if (tenant) {
      setEditingTenant(tenant);
      const lease = tenant.tenancies?.[0] || {};
      setFormData({
        name: tenant.name,
        email: tenant.email,
        phone: tenant.profile?.phone || "",
        buildingId: lease.buildingId || "",
        unitNumber: lease.unitNumber || "",
        monthlyRent: lease.monthlyRent ? String(lease.monthlyRent) : "",
        depositAmount: lease.depositAmount ? String(lease.depositAmount) : "",
        leaseStart: lease.leaseStart
          ? String(lease.leaseStart).split("T")[0]
          : "",
        leaseEnd: lease.leaseEnd ? String(lease.leaseEnd).split("T")[0] : "",
      });
    } else {
      setEditingTenant(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        buildingId: "",
        unitNumber: "",
        monthlyRent: "",
        depositAmount: "",
        leaseStart: "",
        leaseEnd: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTenant) {
        await api.put(`/tenants/${editingTenant.id}`, formData);
        toast.success("Tenant updated successfully");
      } else {
        await api.post("/tenants", formData);
        toast.success(`Tenant created. Credentials sent to ${formData.email}.`);
      }
      setIsModalOpen(false);
      fetchTenants();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/tenants/${deleteId}`);
      toast.success("Tenant deleted");
      setDeleteId(null);
      fetchTenants();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleUpdatePaymentStatus = async (
    tenantId: string,
    tenancyId: string,
    currentStatus: string,
  ) => {
    if (!tenancyId) {
      toast.error("This tenant has no active lease to update.");
      return;
    }
    try {
      const statuses = ["paid", "partial", "overdue", "unpaid"];
      const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
      await api.patch(`/tenants/${tenantId}/payment`, {
        tenancyId,
        paymentStatus: statuses[nextIdx],
      });
      toast.success("Payment status updated");
      fetchTenants();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSign = async () => {
    if (!signModalTenancy || !agreed || !typedName.trim()) {
      toast.error("Please type your name and agree to the terms.");
      return;
    }
    const file = await padRef.current?.getSignatureFile();
    if (!file) {
      toast.error("Please draw a signature first.");
      return;
    }
    setSigning(true);
    try {
      const fd = new FormData();
      fd.append("tenancyId", signModalTenancy);
      fd.append("typedName", typedName);
      fd.append("agreed", "true");
      fd.append("signature", file);
      await api.post("/signatures", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Lease countersigned");
      setSignModalTenancy(null);
      setTypedName("");
      setAgreed(false);
      fetchSignatureStatus(Object.keys(signaturesByTenancy));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSigning(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Tenants
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total} tenant{total !== 1 ? "s" : ""} across your portfolio
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus size={18} /> Add Tenant
        </button>
      </div>

      <div className="relative w-full max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <RefreshCw className="animate-spin text-emerald-500" size={28} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-sm">
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">
                    Tenant
                  </th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">
                    Unit Info
                  </th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">
                    Rent
                  </th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">
                    Payment Status
                  </th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">
                    Signature
                  </th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => {
                  const lease = tenant.tenancies?.[0] || null;
                  const paymentStatus = lease?.paymentStatus || "unpaid";
                  return (
                    <tr
                      key={tenant.id}
                      className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold uppercase flex-shrink-0">
                            {tenant.name?.charAt(0) || "T"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {tenant.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {tenant.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          Unit {lease?.unitNumber || "—"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lease?.building?.name || "No active lease"}
                        </p>
                      </td>
                      <td className="p-4 text-sm">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          $
                          {lease
                            ? Number(lease.monthlyRent).toLocaleString()
                            : "0"}
                          /mo
                        </p>
                        <p className="text-xs text-gray-500">
                          Dep: $
                          {lease
                            ? Number(lease.depositAmount).toLocaleString()
                            : "0"}
                        </p>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() =>
                            handleUpdatePaymentStatus(
                              tenant.id,
                              lease?.id,
                              paymentStatus,
                            )
                          }
                          disabled={!lease}
                          className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full transition-opacity",
                            lease
                              ? "cursor-pointer hover:opacity-80"
                              : "cursor-not-allowed opacity-50",
                            paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : paymentStatus === "partial"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                : paymentStatus === "overdue"
                                  ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                                  : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
                          )}
                          title={
                            lease ? "Click to change status" : "No active lease"
                          }
                        >
                          {paymentStatus.toUpperCase()}
                        </button>
                      </td>
                      <td className="p-4">
                        {(() => {
                          if (!lease)
                            return (
                              <span className="text-xs text-gray-400">
                                No lease
                              </span>
                            );
                          const sigInfo = signaturesByTenancy[lease.id];
                          if (sigInfo?.isFullyExecuted) {
                            return (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                Executed
                              </span>
                            );
                          }
                          const staffSigned = sigInfo?.signatures.some(
                            (s) =>
                              s.signerRole === "owner" ||
                              s.signerRole === "manager",
                          );
                          if (staffSigned)
                            return (
                              <span className="text-xs text-amber-600 dark:text-amber-400">
                                Awaiting tenant
                              </span>
                            );
                          return (
                            <button
                              onClick={() => setSignModalTenancy(lease.id)}
                              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                            >
                              <PenLine className="w-3.5 h-3.5" /> Countersign
                            </button>
                          );
                        })()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenModal(tenant)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteId(tenant.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400">
                      {search
                        ? "No tenants match your search."
                        : "No tenants added yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-400">
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}{" "}
                of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300 px-2">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2
                style={{ fontFamily: "var(--font-display)" }}
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                {editingTenant ? "Edit Tenant" : "Add New Tenant"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide pb-1 border-b border-gray-100 dark:border-gray-800">
                Personal Info
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!!editingTenant}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide pb-1 pt-3 border-b border-gray-100 dark:border-gray-800">
                Lease & Unit Info{" "}
                {editingTenant && (
                  <span className="normal-case font-normal">
                    (requires an active lease to apply)
                  </span>
                )}
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Building *
                </label>
                <select
                  required={!editingTenant}
                  value={formData.buildingId}
                  onChange={(e) =>
                    setFormData({ ...formData, buildingId: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Building --</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Unit Number {!editingTenant && "*"}
                </label>
                <input
                  required={!editingTenant}
                  type="text"
                  value={formData.unitNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, unitNumber: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Apt 4B"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Monthly Rent {!editingTenant && "*"}
                  </label>
                  <input
                    required={!editingTenant}
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyRent: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Deposit Amount
                  </label>
                  <input
                    type="number"
                    value={formData.depositAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        depositAmount: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="1500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Lease Start {!editingTenant && "*"}
                  </label>
                  <input
                    required={!editingTenant}
                    type="date"
                    value={formData.leaseStart}
                    onChange={(e) =>
                      setFormData({ ...formData, leaseStart: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Lease End
                  </label>
                  <input
                    type="date"
                    value={formData.leaseEnd}
                    onChange={(e) =>
                      setFormData({ ...formData, leaseEnd: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              {!editingTenant && (
                <p className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  A temporary password will be generated and emailed to this
                  address automatically.
                </p>
              )}
            </form>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3 bg-gray-50 dark:bg-gray-900/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : editingTenant
                    ? "Save Changes"
                    : "Create Tenant"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <TrashIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Delete Tenant
                </p>
                <p className="text-sm text-gray-400">
                  This will also remove their lease records. This action cannot
                  be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Countersign Modal */}
      {signModalTenancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSignModalTenancy(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{ fontFamily: "var(--font-display)" }}
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                Countersign Lease
              </h2>
              <button onClick={() => setSignModalTenancy(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Signature
                </label>
                <SignaturePad ref={padRef} />
              </div>
              <label className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5"
                />
                I confirm this is my legal signature and I agree to the terms of
                this lease.
              </label>
              <button
                onClick={handleSign}
                disabled={signing}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
              >
                {signing ? "Signing..." : "Countersign Lease"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
