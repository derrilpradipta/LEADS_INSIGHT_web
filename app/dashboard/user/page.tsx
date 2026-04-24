"use client";

import { useEffect, useState } from "react";
import { Shield, Clock, Loader2 } from "lucide-react";

interface UserData {
  id: string | number;
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
    const previousUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });

      if (!res.ok) {
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
    <div className="p-4 lg:p-8 space-y-6">
      <div className="bg-white rounded-2xl lg:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {/* Header Responsif */}
        <div className="p-5 lg:p-6 border-b border-gray-50 flex items-center gap-3 lg:gap-4">
          <div className="p-2.5 lg:p-3 bg-indigo-50 text-indigo-600 rounded-xl lg:rounded-2xl shadow-sm">
            <Shield size={20} className="lg:w-6 lg:h-6" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-800 tracking-tight">User Control Panel</h1>
            <p className="text-[10px] lg:text-sm text-gray-400 font-medium">Kelola hak akses dan aktivitas staff</p>
          </div>
        </div>

        {/* Wrapper Table untuk Horizontal Scroll di Mobile */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[650px]">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 lg:px-8 py-4 text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama & Username</th>
                <th className="px-6 lg:px-8 py-4 text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Terakhir Input</th>
                <th className="px-6 lg:px-8 py-4 text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Role Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin inline text-indigo-600" /></td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 lg:px-8 py-4 lg:py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs lg:text-sm">
                        {user.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm lg:text-base font-bold text-gray-800 leading-none">{user.nama}</div>
                        <div className="text-[10px] lg:text-xs text-gray-400 font-medium mt-1">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 lg:px-8 py-4 lg:py-5 text-center">
                    {user.lastInput ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] lg:text-[10px] font-black">
                        <Clock size={10} />
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
                  <td className="px-6 lg:px-8 py-4 lg:py-5 text-center">
                    <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200/50">
                      {['ADMIN', 'STAFF'].map((r) => (
                        <button
                          key={r}
                          onClick={() => handleUpdateRole(user.id, r)}
                          className={`px-3 lg:px-5 py-1.5 rounded-lg text-[8px] lg:text-[9px] font-black tracking-widest transition-all duration-200 ${
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