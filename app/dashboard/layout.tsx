// app/dashboard/layout.tsx
import Sidebar from '../components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />

      {/* Ganti ml-72 menjadi lg:pl-72 (padding kiri hanya di layar besar).
        Tambahkan pt-20 agar konten tidak tertutup tombol Hamburger di mobile.
      */}
      <main className="flex-1 w-full pt-20 lg:pt-0 lg:pl-72 transition-all duration-300">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}