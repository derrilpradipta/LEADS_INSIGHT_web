"use client";
import { useEffect, useState } from "react";
import { Shield, Loader2, ChevronRight } from "lucide-react";

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

  useEffect(() => {
    fetchUsers();
    document.title = 'User Control';
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-5">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-gray-600">User Control</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gray-900 text-white rounded">
            <Shield size={15} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">User Control</h1>
            <p className="text-xs text-gray-400">Management Access</p>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-400" size={22} />
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map((user) => (
                <div key={user.id} className="p-5 space-y-3 hover:bg-gray-50/50 transition-colors">
                  {/* Top row: info + role toggle */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 bg-gray-100 border border-gray-200 rounded flex-shrink-0 flex items-center justify-center text-gray-600 font-semibold text-sm uppercase">
                        {user.nama.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-gray-800 text-sm truncate">{user.nama}</div>
                        <div className="text-xs text-gray-400 truncate">@{user.username}</div>
                      </div>
                    </div>

                    {/* Role Selector */}
                    <div className="flex p-0.5 bg-gray-100 border border-gray-200 rounded flex-shrink-0">
                      {['ADMIN', 'STAFF'].map((r) => (
                        <button
                          key={r}
                          onClick={() => handleUpdateRole(user.id, r)}
                          className={`px-3 py-1.5 text-[10px] font-semibold tracking-wider rounded transition-all ${
                            user.role?.toUpperCase() === r
                              ? 'bg-white text-gray-800 shadow-sm ring-1 ring-black/5'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom row: last activity */}
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.lastInput ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Aktivitas Terakhir</span>
                    </div>
                    <span className={`text-xs font-medium ${user.lastInput ? 'text-blue-600' : 'text-gray-400 italic'}`}>
                      {formatLastSeen(user.lastInput)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}