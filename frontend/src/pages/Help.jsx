import { FiHelpCircle, FiPhoneCall, FiMessageSquare, FiBookOpen } from "react-icons/fi";
import AIChatbot from "../components/help/AIChatbot";

function Help() {
  return (
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-slate-950 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4 dark:border-slate-800">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl text-emerald-600">
          <FiHelpCircle size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Help & Support</h1>
          <p className="text-xs text-slate-500">Need assistance? We are always here to help you</p>
        </div>
      </div>

      {/* Quick Guide */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl space-y-2">
        <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2"><FiBookOpen className="text-indigo-500" /> How to generate a bill instantly?</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          1. First, click on the <b>Billing</b> option in the sidebar.<br />
          2. Enter the customer's mobile number, then search and select products from below.<br />
          3. Click the <b>Print / Save Bill</b> button, and the receipt will be printed instantly from your thermal printer!
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        
        {/* WhatsApp Chat Support */}
        <div className="p-5 border dark:border-slate-800 rounded-2xl space-y-3 hover:border-emerald-500 transition group">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <FiMessageSquare size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white">WhatsApp Support</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Get answers to your queries 24/7 via live chat</p>
          </div>
          <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
            Chat Now
          </a>
        </div>

        {/* Call Support */}
        <div className="p-5 border dark:border-slate-800 rounded-2xl space-y-3 hover:border-indigo-500 transition group">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <FiPhoneCall size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white">Customer Care Call</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Speak directly with us from 9:00 AM to 7:00 PM</p>
          </div>
          <a href="tel:+919999999999" className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
            Call Support
          </a>
        </div>

      </div>

      <p className="text-center text-[11px] text-slate-400 pt-4 border-t dark:border-slate-800">
        Vyprox App Version 1.0.0 (SaaS Edition 2026)
      </p>

    </div>
  );
}

export default Help;