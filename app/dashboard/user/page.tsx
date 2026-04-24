"use client";
import { useEffect, useState } from "react";
import { Shield, Loader2 } from "lucide-react";

interface UserData {
  id: string | number;
  nama: string;
  username: string;
  role: string;
  lastInput: string | null; // Data utama yang ingin ditampilkan
}

export default function UserControlPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi helper format waktu yang konsisten
  const formatLastSeen = (dateString: string | null) => {
    if (!dateString) return "Belum ada aktivitas";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return "Format waktu salah";
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/user/");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string | number, newRole: string) => {
    const previousUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });
      if (!res.ok) setUsers(previousUsers);
    } catch (err) {
      setUsers(previousUsers);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="p-4 lg:p-8 space-y-5 bg-[#F8F9FC] min-h-screen pb-24 font-sans">
      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="p-5 border-b border-gray-50 flex items-center gap-4 bg-indigo-50/10">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
            <Shield size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-800 tracking-tight">User Control</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Management Access</p>
          </div>
        </div>

        {/* List Section */}
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin inline text-indigo-600" /></div>
          ) : users.map((user) => (
            <div key={user.id} className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                {/* Info User */}
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex-shrink-0 flex items-center justify-center text-indigo-600 font-black text-xs border border-indigo-100 uppercase">
                    {user.nama.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-gray-800 text-sm truncate">{user.nama}</div>
                    {/* Last Input Muncul di sini juga agar cepat terlihat */}
                    <div className="text-[9px] text-gray-400 font-medium truncate">
                       Last: {user.lastInput ? formatLastSeen(user.lastInput) : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Role Selector */}
                <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200/50 flex-shrink-0">
                  {['ADMIN', 'STAFF'].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleUpdateRole(user.id, r)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${
                        user.role?.toUpperCase() === r 
                          ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                          : 'text-gray-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Bar Dinamis */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  {/* Dot indikator: Hijau jika ada data, Abu-abu jika kosong */}
                  <div className={`w-1.5 h-1.5 rounded-full ${user.lastInput ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Aktivitas Terakhir</span>
                </div>
                <span className={`text-[10px] font-bold ${user.lastInput ? 'text-indigo-600' : 'text-gray-400 italic'}`}>
                  {formatLastSeen(user.lastInput)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}