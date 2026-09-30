import React, { useState } from "react";
import {
  Users,
  Search,
  Star,
  Ban,
  Plus,
  Phone,
  Building,
  FileText,
  Clock,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { Customer } from "../types";
import { formatPhoneNumber, formatRelativeTime } from "../lib/normalizer";

interface CustomersViewProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: (newCustomer: Omit<Customer, "id">) => void;
  onSendMessage: (phoneNumber: string, name?: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onSelectCustomer,
  onAddCustomer,
  onSendMessage,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "VIP" | "BLACKLISTED" | "CONVERTED">("ALL");
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  const [newCustForm, setNewCustForm] = useState({
    name: "",
    phoneNumber: "+91 ",
    company: "",
    email: "",
    notes: "",
    isVip: false,
    isBlacklisted: false,
    status: "NEW" as const,
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCustomer({
      ...newCustForm,
      totalMissedCalls: 0,
      lastCallTimestamp: Date.now(),
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          customerId: "",
          type: "STATUS_CHANGE",
          description: "Customer record created manually in CRM",
          timestamp: Date.now(),
        },
      ],
    });
    setIsAddingCustomer(false);
    setNewCustForm({
      name: "",
      phoneNumber: "+91 ",
      company: "",
      email: "",
      notes: "",
      isVip: false,
      isBlacklisted: false,
      status: "NEW",
    });
  };

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filter === "VIP") return c.isVip;
    if (filter === "BLACKLISTED") return c.isBlacklisted;
    if (filter === "CONVERTED") return c.status === "CONVERTED";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Customer CRM Directory</h1>
          <p className="text-xs text-[#8696A0] mt-0.5">
            Manage caller contacts, VIP priority tags, blacklist filters, and activity timelines
          </p>
        </div>
        <button
          onClick={() => setIsAddingCustomer(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold transition-all shadow-md shadow-[#00A884]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8696A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone number, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#202C33] border border-[#222E35] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#8696A0] focus:outline-none focus:border-[#00A884]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "VIP", "BLACKLISTED", "CONVERTED"] as const).map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === tag
                  ? "bg-[#00A884] text-white shadow-sm"
                  : "bg-[#202C33] text-[#8696A0] hover:text-white"
              }`}
            >
              {tag === "ALL" ? `All (${customers.length})` : tag}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col justify-between hover:border-[#00A884]/50 transition-all cursor-pointer group"
            onClick={() => onSelectCustomer(customer)}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-white group-hover:text-[#00A884] transition-colors">
                    {customer.name}
                  </span>

                  {customer.isVip && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <Star className="w-3 h-3 fill-current" />
                      VIP
                    </span>
                  )}

                  {customer.isBlacklisted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      <Ban className="w-3 h-3" />
                      Blacklisted
                    </span>
                  )}

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      customer.status === "CONVERTED"
                        ? "bg-[#25D366]/15 text-[#25D366]"
                        : customer.status === "CONTACTED"
                        ? "bg-sky-500/15 text-sky-400"
                        : "bg-gray-500/15 text-gray-300"
                    }`}
                  >
                    {customer.status}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendMessage(customer.phoneNumber, customer.name);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#202C33] hover:bg-[#00A884] hover:text-white text-[#8696A0] text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Message</span>
                </button>
              </div>

              <div className="mt-2.5 space-y-1.5 text-xs text-[#8696A0]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#00A884]" />
                  <span className="text-gray-200 font-mono font-medium">
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
                  <div className="flex items-start gap-2 pt-1 text-gray-300 italic bg-[#202C33]/60 p-2.5 rounded-xl border border-[#222E35]/40 text-xs">
                    <FileText className="w-3.5 h-3.5 text-[#8696A0] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">"{customer.notes}"</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#222E35]/60 flex items-center justify-between text-[11px] text-[#8696A0]">
              <span className="flex items-center gap-1">
                <span>Missed Calls:</span>
                <span className="font-bold text-white">{customer.totalMissedCalls}</span>
              </span>
              <span>Last Call: {formatRelativeTime(customer.lastCallTimestamp)}</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-[#8696A0]">
            <Users className="w-12 h-12 text-[#8696A0] mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-white text-sm">No Customers Found</p>
            <p className="text-xs mt-1">Try adjusting your search criteria or add a new customer.</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-[#111B21] border border-[#222E35] rounded-2xl p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-4">Add New Customer</h2>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newCustForm.name}
                  onChange={(e) => setNewCustForm({ ...newCustForm, name: e.target.value })}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 00000"
                  value={newCustForm.phoneNumber}
                  onChange={(e) => setNewCustForm({ ...newCustForm, phoneNumber: e.target.value })}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apollo Diagnostics"
                  value={newCustForm.company}
                  onChange={(e) => setNewCustForm({ ...newCustForm, company: e.target.value })}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Important details about this customer..."
                  value={newCustForm.notes}
                  onChange={(e) => setNewCustForm({ ...newCustForm, notes: e.target.value })}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCustForm.isVip}
                    onChange={(e) => setNewCustForm({ ...newCustForm, isVip: e.target.checked })}
                    className="accent-[#00A884] w-4 h-4 rounded"
                  />
                  <span>VIP Priority</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCustForm.isBlacklisted}
                    onChange={(e) => setNewCustForm({ ...newCustForm, isBlacklisted: e.target.checked })}
                    className="accent-rose-500 w-4 h-4 rounded"
                  />
                  <span>Blacklist Spam</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#222E35] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCustomer(false)}
                  className="px-4 py-2 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-[#8696A0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-xs font-bold text-white shadow-md shadow-[#00A884]/20"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
