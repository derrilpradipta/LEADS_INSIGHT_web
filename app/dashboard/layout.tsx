// app/dashboard/layout.tsx
import Sidebar from '../components/sidebar'; // Sesuaikan path-nya

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      {/* Sidebar tetap fixed, lebarnya w-72 (288px) */}
      <Sidebar />

      {/* Main Content: Tambahkan margin-left sebesar w-72 (ml-72) */}
      <main className="flex-1 ml-72 p-8 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}