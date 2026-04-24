"use client";

import { useEffect, useState } from "react";
import { Shield, Clock, Loader2 } from "lucide-react";

interface UserData {
  id: string | number; // Bisa string atau number tergantung database
  nama: string;
  username: string;
  role: string;
  lastInput: string | null;
}

export default function UserControlPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

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
    // 1. OPTIMISTIC UPDATE: Ubah di layar dulu agar tombol langsung geser
    const previousUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });

      if (!res.ok) {
        // Jika gagal di database, kembalikan tampilan ke sebelumnya
        setUsers(previousUsers);
        alert("Gagal memperbarui di database");
      }
    } catch (err) {
      setUsers(previousUsers);
      console.error("Network error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-8 space-y-6 bg-[#F8F9FC] min-h-screen">
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">User Control Panel</h1>
            <p className="text-sm text-gray-400 font-medium">Kelola hak akses dan pantau aktivitas staff</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama & Username</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Terakhir Input</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Role Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin inline text-indigo-600" /></td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {user.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{user.nama}</div>
                        <div className="text-xs text-gray-400 font-medium">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {user.lastInput ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black">
                        <Clock size={10} />
                        {/* Format tanggal agar lebih rapi */}
                        {new Date(user.lastInput).toLocaleString('id-ID', { 
                          day: '2-digit', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-300 italic font-medium">No Activity</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-center">
                    {/* SEGMENTED CONTROL: Lebih stabil & cakep dibanding dropdown */}
                    <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200/50">
                      {['ADMIN', 'STAFF'].map((r) => (
                        <button
                          key={r}
                          onClick={() => handleUpdateRole(user.id, r)}
                          className={`px-5 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all duration-200 ${
                            // Gunakan Optional Chaining (?.) dan toUpperCase() 
                            // untuk memastikan data dari DB cocok dengan ['ADMIN', 'STAFF']
                            user.role?.toUpperCase() === r 
                              ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}