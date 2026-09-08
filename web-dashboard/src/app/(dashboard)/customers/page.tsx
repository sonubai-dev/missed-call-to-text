"use client";

import { useEffect, useState } from "react";
import { Customer } from "@/types";
import { Users, Search, Star, Ban, Plus, Phone, Building, FileText, Check } from "lucide-react";
import { formatPhoneNumber, formatRelativeTime } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isNew, setIsNew] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) setCustomers(await res.json());
    } catch (e) {
      // Handled
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      id: editingCustomer?.id,
      name: formData.get("name") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      company: formData.get("company") as string,
      notes: formData.get("notes") as string,
      isVip: formData.get("isVip") === "on",
      isBlacklisted: formData.get("isBlacklisted") === "on",
      totalMissedCalls: editingCustomer?.totalMissedCalls || 0,
      lastCallTimestamp: editingCustomer?.lastCallTimestamp || Date.now(),
    };

    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditingCustomer(null);
    setIsNew(false);
    fetchCustomers();
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customer Directory</h1>
          <p className="text-sm text-[#8696A0]">
            Manage caller contacts, VIP priority tags, and business notes
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsNew(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-sm font-semibold transition-all shadow-md shadow-[#00A884]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8696A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#202C33] border border-[#222E35] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#8696A0] focus:outline-none focus:border-[#00A884]"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col justify-between hover:border-[#222E35]/80 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-white">{customer.name}</span>
                  {customer.isVip && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      VIP
                    </span>
                  )}
                  {customer.isBlacklisted && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400">
                      <Ban className="w-3 h-3" />
                      Blacklisted
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setEditingCustomer(customer)}
                  className="text-xs font-semibold text-[#00A884] hover:text-[#25D366]"
                >
                  Edit
                </button>
              </div>

              <div className="mt-2 space-y-1.5 text-xs text-[#8696A0]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#8696A0]" />
                  <span className="text-gray-200 font-medium">
                    {formatPhoneNumber(customer.phoneNumber)}
                  </span>
                </div>
                {customer.company && (
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-[#8696A0]" />
                    <span>{customer.company}</span>
                  </div>
                )}
                {customer.notes && (
                  <div className="flex items-start gap-2 pt-1 text-gray-300 italic bg-[#202C33]/50 p-2 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-[#8696A0] shrink-0 mt-0.5" />
                    <span>"{customer.notes}"</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#222E35]/60 flex items-center justify-between text-[11px] text-[#8696A0]">
              <span>Total Missed: {customer.totalMissedCalls}</span>
              <span>Last Call: {formatRelativeTime(customer.lastCallTimestamp)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {(isNew || editingCustomer) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#111B21] border border-[#222E35] rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">
              {isNew ? "Add New Customer" : "Edit Customer"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Customer Name
                </label>
                <input
                  name="name"
                  defaultValue={editingCustomer?.name || ""}
                  required
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Phone Number
                </label>
                <input
                  name="phoneNumber"
                  defaultValue={editingCustomer?.phoneNumber || "+91 "}
                  required
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Company (Optional)
                </label>
                <input
                  name="company"
                  defaultValue={editingCustomer?.company || ""}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingCustomer?.notes || ""}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isVip"
                    defaultChecked={editingCustomer?.isVip || false}
                    className="accent-[#00A884] rounded w-4 h-4"
                  />
                  Mark as VIP
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-rose-400 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isBlacklisted"
                    defaultChecked={editingCustomer?.isBlacklisted || false}
                    className="accent-rose-500 rounded w-4 h-4"
                  />
                  Blacklist Caller
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222E35]">
                <button
                  type="button"
                  onClick={() => {
                    setIsNew(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#202C33] text-sm font-semibold text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-sm font-bold text-white shadow-md shadow-[#00A884]/20"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
