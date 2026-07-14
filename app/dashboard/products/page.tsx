"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, Trash2, Check, X, ChevronRight, ChevronLeft,
Package, ToggleLeft, ToggleRight, Search } from "lucide-react";

interface Product {
  id: number;
  nama: string;
  aktif: boolean;
  createdAt: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (role !== "ADMIN") { router.push("/dashboard"); return; }
    document.title = "Produk | LeadTrack";
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: newName }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }
      setNewName("");
      setShowAddForm(false);
      fetchProducts();
    } catch { alert("Gagal menambahkan produk."); }
    finally { setAdding(false); }
  };

  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) return;
    setSavingId(id);
    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nama: editName }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }
      setEditingId(null);
      fetchProducts();
    } catch { alert("Gagal menyimpan perubahan."); }
    finally { setSavingId(null); }
  };

  const handleToggleAktif = async (id: number, aktif: boolean) => {
    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, aktif: !aktif }),
      });
      fetchProducts();
    } catch { alert("Gagal mengubah status."); }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Yakin hapus produk "${nama}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      fetchProducts();
    } catch { alert("Gagal menghapus produk."); }
    finally { setDeletingId(null); }
  };

  const aktifCount = products.filter(p => p.aktif).length;

  const filteredProducts = products.filter(p =>
    p.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // reset ke halaman 1 setiap kali pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-5">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-gray-600">Manajemen Produk</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Manajemen Produk</h1>
            <p className="text-xs text-gray-400 mt-0.5">Kelola daftar produk yang tersedia saat input data</p>
          </div>
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null); }}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-[12px] font-semibold px-4 py-2 rounded transition-colors"
          >
            <Plus size={14} /> Tambah Produk
          </button>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 max-w-4xl mx-auto space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
              <Package size={15} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">Total Produk</p>
              <p className="text-[22px] font-bold text-gray-900 leading-none">{products.length}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded flex items-center justify-center">
              <Check size={15} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">Aktif</p>
              <p className="text-[22px] font-bold text-gray-900 leading-none">{aktifCount}</p>
            </div>
          </div>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Produk Baru</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama produk..."
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setShowAddForm(false); setNewName(''); } }}
                className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              />
              <button
                onClick={handleAdd}
                disabled={adding || !newName.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-[12px] font-semibold rounded hover:bg-gray-700 transition-colors disabled:opacity-40"
              >
                {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Tambah
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewName(''); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Product list */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between gap-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">Daftar Produk</p>
            <div className="relative w-56">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded pl-8 pr-3 py-1.5 text-[12px] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              <Loader2 className="animate-spin inline mr-2" size={15} /> Memuat...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              {searchQuery ? `Tidak ada produk yang cocok dengan "${searchQuery}".` : "Belum ada produk."}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {paginatedProducts.map((product, index) => (
                <div key={product.id} className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${!product.aktif ? 'bg-gray-50/60' : 'hover:bg-gray-50/40'}`}>

                  {/* Nomor */}
                  <span className="text-[12px] text-gray-300 font-medium w-5 text-center flex-shrink-0">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                    </span>

                  {/* Nama — mode normal atau edit */}
                  {editingId === product.id ? (
                    <input
                      type="text"
                      value={editName}
                      autoFocus
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(product.id); if (e.key === 'Escape') setEditingId(null); }}
                      className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                    />
                  ) : (
                    <span className={`flex-1 text-[13px] font-medium ${product.aktif ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                      {product.nama}
                    </span>
                  )}

                  {/* Status badge */}
                  {editingId !== product.id && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded flex-shrink-0 ${product.aktif ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {product.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  )}

                  {/* Aksi */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {editingId === product.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(product.id)}
                          disabled={savingId === product.id}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50"
                        >
                          {savingId === product.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Toggle aktif/nonaktif */}
                        <button
                          onClick={() => handleToggleAktif(product.id, product.aktif)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title={product.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {product.aktif ? <ToggleRight size={15} className="text-emerald-500" /> : <ToggleLeft size={15} />}
                        </button>
                        {/* Edit nama */}
                        <button
                          onClick={() => { setEditingId(product.id); setEditName(product.nama); setShowAddForm(false); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        {/* Hapus */}
                        <button
                          onClick={() => handleDelete(product.id, product.nama)}
                          disabled={deletingId === product.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        >
                          {deletingId === product.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredProducts.length > 0 && totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[11px] text-gray-400">
                Halaman {currentPage} dari {totalPages} · {filteredProducts.length} produk
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[12px] font-medium text-gray-600 px-2">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] text-gray-400 px-1">
          Produk yang dinonaktifkan tidak akan muncul sebagai pilihan saat staff input data.
        </p>
      </div>
    </div>
  );
}