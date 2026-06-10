import { useState, useEffect } from "react";
import axios from "axios";
import { FiUsers, FiUserPlus, FiCheckCircle, FiXCircle, FiDollarSign, FiClock, FiActivity, FiMapPin, FiCalendar } from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function StaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📝 नया स्टाफ जोड़ने का पूरा स्टेट (Address और Gender के साथ)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Salesman");
  const [gender, setGender] = useState("Male");
  const [address, setAddress] = useState(""); // 🏠 घर का पता
  const [baseSalary, setBaseSalary] = useState("");

  // 💰 एडवांस/सैलरी भुगतान का स्टेट
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [actionType, setActionType] = useState("Advance"); 
  const [amount, setAmount] = useState("");

  // 📅 आज का दिन और तारीख ऑटो-कैलकुलेट करने के लिए
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString("en-IN", options); // उदाहरण: Tuesday, 9 June, 2026

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setStaffList(res.data?.staff || [
        { _id: "1", name: "Rahul Sharma", phone: "9826011111", role: "Salesman", gender: "Male", address: "Vijay Nagar, Indore, MP", baseSalary: 12000, advanceTaken: 1500, todayStatus: "Present", monthlySalesDone: 45000 },
        { _id: "2", name: "Priya Patel", phone: "9826022222", role: "Counter Boy", gender: "Female", address: "Palasia, Indore, MP", baseSalary: 11000, advanceTaken: 0, todayStatus: "Not Marked", monthlySalesDone: 32000 },
        { _id: "3", name: "Deepak Yadav", phone: "9826033333", role: "Store Manager", gender: "Male", address: "Bhanwarkuan, Indore, MP", baseSalary: 18000, advanceTaken: 3000, todayStatus: "Absent", monthlySalesDone: 85000 }
      ]);
      setLoading(false);
    } catch (err) {
      console.error("Staff डेटा लोड करने में समस्या:", err);
      setLoading(false);
    }
  };

  // 1. नया स्टाफ जोड़ने का फंक्शन
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!name || !phone || !baseSalary || !address) return alert("सभी जानकारी और पता भरना अनिवार्य है!");

    try {
      const token = localStorage.getItem("token");
      const payload = { name, phone, role, gender, address, baseSalary: Number(baseSalary) };
      
      await axios.post(`${API}/api/staff/add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("🎉 नया स्टाफ सफलतापूर्वक जोड़ा गया!");
      setName(""); setPhone(""); setBaseSalary(""); setAddress(""); setGender("Male");
      fetchStaffData();
    } catch (err) {
      // बैकएंड न होने पर फ्रंटएंड टेस्टिंग के लिए डायरेक्ट जोड़ रहे हैं
      const newItem = { _id: Date.now().toString(), name, phone, role, gender, address, baseSalary: Number(baseSalary), advanceTaken: 0, todayStatus: "Not Marked", monthlySalesDone: 0 };
      setStaffList([...staffList, newItem]);
      setName(""); setPhone(""); setBaseSalary(""); setAddress(""); setGender("Male");
    }
  };

  // 2. हाजिरी (Attendance) मार्क करने का फंक्शन
  const markAttendance = async (staffId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/staff/attendance`, { staffId, status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStaffData();
    } catch (err) {
      setStaffList(staffList.map(s => s._id === staffId ? { ...s, todayStatus: status } : s));
    }
  };

  // 3. एडवांस या सैलरी एंट्री करने का फंक्शन
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedStaffId || !amount) return alert("स्टाफ और अमाउंट चुनना ज़रूरी है!");

    setStaffList(staffList.map(s => {
      if (s._id === selectedStaffId) {
        if (actionType === "Advance") {
          return { ...s, advanceTaken: s.advanceTaken + Number(amount) };
        } else {
          return { ...s, advanceTaken: 0 }; 
        }
      }
      return s;
    }));

    alert(`💰 ${actionType} एंट्री सफलतापूर्वक दर्ज की गई!`);
    setAmount("");
  };

  if (loading) return <div className="p-6 text-center font-bold dark:text-white">स्टाफ मेट्रिक्स लोड हो रहे हैं...</div>;

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto space-y-6">
      
      {/* 🌟 हेडर (Day और Date के साथ) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-[20px] shadow-sm border dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FiUsers className="text-indigo-600" /> Staff & Human Resources
          </h1>
          <p className="text-sm text-gray-500">कर्मचारियों की हाजिरी, घर का पता, एडवांस रिकॉर्ड और मासिक परफॉर्मेंस</p>
        </div>
        {/* लाइव दिन और तारीख का बॉक्स */}
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 rounded-xl font-bold text-xs sm:text-sm shadow-inner">
          <FiCalendar className="text-base" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* ग्रिड लेआउट */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* बायां कॉलम: फॉर्म्स */}
        <div className="space-y-6">
          
          {/* फॉर्म 1: नया स्टाफ रजिस्ट्रेशन */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md space-y-4">
            <h2 className="text-base font-black dark:text-white flex items-center gap-2 border-b pb-2">
              <FiUserPlus className="text-indigo-500" /> Add New Staff Member
            </h2>
            <form onSubmit={handleAddStaff} className="space-y-3">
              <input type="text" placeholder="Employee Name *" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none" />
              <input type="tel" placeholder="Mobile Number *" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none" />
              
              {/* रोल और जेंडर का ड्रॉपडाउन */}
              <div className="grid grid-cols-2 gap-2">
                <select value={role} onChange={(e) => setRole(e.target.value)} className="p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none font-bold">
                  <option value="Salesman">Salesman</option>
                  <option value="Counter Boy">Counter Boy</option>
                  <option value="Store Manager">Store Manager</option>
                  <option value="Delivery Boy">Delivery Boy</option>
                </select>
                
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none font-bold text-indigo-600">
                  <option value="Male">👦 Male</option>
                  <option value="Female">👧 Female</option>
                  <option value="Other">🧑 Other</option>
                </select>
              </div>

              {/* 🏠 घर का पता इनपुट */}
              <input type="text" placeholder="Full Home Address *" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none" />

              <input type="number" placeholder="Base Salary (₹) *" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} className="w-full p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none" />
              
              <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">Add Employee</button>
            </form>
          </div>

          {/* फॉर्म 2: एडवांस और सैलरी */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md space-y-4">
            <h2 className="text-base font-black dark:text-white flex items-center gap-2 border-b pb-2">
              <FiDollarSign className="text-emerald-500" /> Advance & Salary Settlements
            </h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-3">
              <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)} className="w-full p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none font-bold">
                <option value="">-- Select Employee --</option>
                {staffList.map(s => <option key={s._id} value={s._id}>{s.name} ({s.role})</option>)}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none font-bold text-emerald-600">
                  <option value="Advance">💸 Give Advance</option>
                  <option value="Salary">🏦 Final Salary Paid</option>
                </select>
                <input type="number" placeholder="Amount (₹) *" value={amount} onChange={(e) => setAmount(e.target.value)} className="p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md">Record Payment</button>
            </form>
          </div>

        </div>

        {/* दायां कॉलम: एक्टिव लिस्ट */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md space-y-4">
          <h2 className="text-base font-black border-b pb-3 dark:text-white flex items-center gap-2">
            <FiActivity className="text-indigo-500" /> Active Roster & Attendance Panel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1">
            {staffList.map((employee) => (
              <div key={employee._id} className="p-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 relative overflow-hidden">
                
                {/* कार्ड हेडर (जेंडर बैज के साथ) */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">{employee.name}</h3>
                      <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-md font-bold">
                        {employee.gender === "Male" ? "👦 M" : employee.gender === "Female" ? "👧 F" : "🧑 O"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold">{employee.role} | {employee.phone}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                    employee.todayStatus === "Present" ? "bg-green-100 text-green-700" :
                    employee.todayStatus === "Absent" ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-600"
                  }`}>
                    {employee.todayStatus}
                  </span>
                </div>

                {/* 🏠 घर का पता (Address Box) */}
                <div className="text-[11px] text-gray-500 bg-white/60 dark:bg-slate-900/40 p-2 rounded-lg flex items-start gap-1">
                  <FiMapPin className="mt-0.5 text-slate-400 shrink-0" />
                  <span className="truncate" title={employee.address}>Add: {employee.address}</span>
                </div>

                {/* वित्तीय ओवरव्यू */}
                <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Base Pay</p>
                    <p className="font-black text-slate-900 dark:text-white">₹{employee.baseSalary}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Advance</p>
                    <p className="font-black text-red-500">₹{employee.advanceTaken}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Sales Done</p>
                    <p className="font-black text-indigo-600 dark:text-indigo-400">₹{employee.monthlySalesDone}</p>
                  </div>
                </div>

                {/* क्विक हाजिरी एक्शन्स */}
                <div className="flex items-center justify-between border-t dark:border-slate-700 pt-2 text-xs">
                  <span className="text-gray-400 font-medium flex items-center gap-1"><FiClock /> Mark Today:</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => markAttendance(employee._id, "Present")} className="flex items-center gap-1 px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-[11px]">
                      Present
                    </button>
                    <button onClick={() => markAttendance(employee._id, "Absent")} className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[11px]">
                      Absent
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}

export default StaffManagement;