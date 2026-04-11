import React from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, FileCheck, Calendar, Wallet } from 'lucide-react';

const FirmAccounts = () => {
  const invoices = [
    { id: "INV-2026-001", client: "Apollo Hospitals", amount: "₹85,000", status: "Paid", date: "02 Apr" },
    { id: "INV-2026-004", client: "Tech Mahindra", amount: "₹1,20,000", status: "Overdue", date: "25 Mar" },
    { id: "INV-2026-009", client: "Local NGO", amount: "₹15,000", status: "Draft", date: "10 Apr" },
  ];

  return (
    <div className="p-8 animate-in slide-in-from-right-8 duration-500">
      <h1 className="text-3xl font-bold mb-8">Firm Accounts</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-100 p-2 rounded-xl text-green-700"><ArrowUpRight size={20} /></div>
            <span className="text-[10px] font-bold text-slate-400">MONTHLY REVENUE</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">₹12.4 Lakhs</p>
          <p className="text-xs text-green-600 font-bold mt-1">+12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-red-100 p-2 rounded-xl text-red-700"><ArrowDownLeft size={20} /></div>
            <span className="text-[10px] font-bold text-slate-400">UNPAID FEES</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">₹3.8 Lakhs</p>
          <p className="text-xs text-red-600 font-bold mt-1">Requires Follow-up</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold">Recent Billing</h3>
          <button className="text-blue-700 text-xs font-bold hover:underline">View All Invoices</button>
        </div>
        <table className="w-full text-left">
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-8 py-5">
                  <div className="font-bold text-slate-800 text-sm">{inv.id}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{inv.date}</div>
                </td>
                <td className="px-8 py-5 text-sm font-medium">{inv.client}</td>
                <td className="px-8 py-5 text-sm font-bold text-slate-900">{inv.amount}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                    inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FirmAccounts;