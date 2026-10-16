import React, { useState } from 'react';
import { X, User, Phone, Tag, Clock, Send, ShieldAlert, Star } from 'lucide-react';
import { Customer } from '../types';
import { formatPhoneNumber, formatDateTime } from '../lib/normalizer';

interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
  onUpdate: (updated: Customer) => void;
  onSendMessage: (phone: string, name: string) => void;
}

export function CustomerDetailModal({
  customer,
  onClose,
  onUpdate,
  onSendMessage,
}: CustomerDetailModalProps) {
  const [name, setName] = useState(customer.name);
  const [notes, setNotes] = useState(customer.notes || '');
  const [isVip, setIsVip] = useState(customer.isVip);
  const [isBlacklisted, setIsBlacklisted] = useState(customer.isBlacklisted);

  const handleSave = () => {
    onUpdate({
      ...customer,
      name,
      notes,
      isVip,
      isBlacklisted,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111B21] border border-[#222E35] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col text-[#E9EDEF]">
        <div className="p-4 border-b border-[#222E35] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Customer Details</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#202C33] rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium">Customer Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full p-2.5 bg-[#0C1317] border border-[#222E35] rounded-xl text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Phone Number</label>
            <div className="mt-1 font-mono text-emerald-400 p-2.5 bg-[#0C1317] border border-[#222E35] rounded-xl">
              {formatPhoneNumber(customer.phoneNumber)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-3 bg-[#0C1317] border border-[#222E35] rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={isVip}
                onChange={(e) => setIsVip(e.target.checked)}
                className="accent-emerald-500"
              />
              <span className="font-semibold text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5" /> VIP Caller
              </span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-[#0C1317] border border-[#222E35] rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={isBlacklisted}
                onChange={(e) => setIsBlacklisted(e.target.checked)}
                className="accent-rose-500"
              />
              <span className="font-semibold text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Spam Block
              </span>
            </label>
          </div>

          <div>
            <label className="text-slate-400 font-medium">Internal Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add customer preference notes..."
              className="mt-1 w-full p-2.5 bg-[#0C1317] border border-[#222E35] rounded-xl text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="p-4 border-t border-[#222E35] flex items-center justify-between gap-3">
          <button
            onClick={() => onSendMessage(customer.phoneNumber, customer.name)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#202C33] hover:bg-[#2A3942] text-emerald-400 rounded-xl font-medium text-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Send Message
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3.5 py-2 text-slate-400 hover:text-white text-xs">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs shadow-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
