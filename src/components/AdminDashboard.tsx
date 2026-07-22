import React, { useState } from 'react';
import {
  LayoutDashboard,
  Plus,
  Printer,
  Download,
  Trash2,
  Edit2,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Activity,
  DollarSign,
  TrendingUp,
  Receipt
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  active: boolean;
}

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  monthPeriod: string;
  date: string;
  weekIndex: number;
  timestamp: number;
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  reason: string;
  date: string;
  monthPeriod: string;
  timestamp: number;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: number;
}

interface StudentMetric {
  id: string;
  name: string;
  active: boolean;
  paid: number;
  isLunas: boolean;
  remaining: number;
  lastPayDate: string;
}

interface AdminDashboardProps {
  students: Student[];
  payments: Payment[];
  expenses: Expense[];
  activityLogs: ActivityLog[];
  studentMetrics: StudentMetric[];
  theme: {
    bg: string;
    hoverBg: string;
    text: string;
    border: string;
    accentBg: string;
  };
  settings: {
    className: string;
    weeklyTarget: number;
    monthlyTarget: number;
  };
  setStudentModal: React.Dispatch<React.SetStateAction<{ open: boolean; editId: string | null; name: string }>>;
  setPaymentModal: React.Dispatch<React.SetStateAction<{ open: boolean; editId: string | null; studentId: string; amount: string; weekIndex: number; date: string }>>;
  setExpenseModal: React.Dispatch<React.SetStateAction<{ open: boolean; editId: string | null; amount: string; category: string; reason: string; date: string }>>;
  handleDeleteStudent: (id: string, name: string) => Promise<void>;
  handleDeletePayment: (id: string, studentName: string, amount: number) => Promise<void>;
  handleDeleteExpense: (id: string, reason: string, amount: number) => Promise<void>;
  handlePrintReport: () => void;
  handleExportExcel: () => void;
}

export default function AdminDashboard({
  students,
  payments,
  expenses,
  activityLogs,
  studentMetrics,
  theme,
  settings,
  setStudentModal,
  setPaymentModal,
  setExpenseModal,
  handleDeleteStudent,
  handleDeletePayment,
  handleDeleteExpense,
  handlePrintReport,
  handleExportExcel
}: AdminDashboardProps) {
  
  // Search and filter inside Admin Manager tables
  const [studentSearch, setStudentSearch] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [expenseSearch, setExpenseSearch] = useState("");

  const filteredStudents = studentMetrics.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredPayments = payments.filter(p =>
    p.studentName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.date.includes(paymentSearch)
  ).sort((a, b) => b.timestamp - a.timestamp);

  const filteredExpenses = expenses.filter(e =>
    e.reason.toLowerCase().includes(expenseSearch.toLowerCase()) ||
    e.category.toLowerCase().includes(expenseSearch.toLowerCase())
  ).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-8">
      
      {/* Export / Quick Admin Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 transition-colors shadow-sm">
        <div>
          <h2 className="font-black text-lg text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
            <LayoutDashboard className={`w-5 h-5 ${theme.text}`} />
            Panel Utama Administrator
          </h2>
          <p className="text-xs text-neutral-500">Kelola database siswa, catat setoran iuran, kelola pengeluaran kelas, dan unduh laporan.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStudentModal({ open: true, editId: null, name: "" })}
            className={`px-3 py-1.5 rounded-lg text-white font-bold text-xs flex items-center space-x-1 ${theme.bg} ${theme.hoverBg}`}
          >
            <Plus className="w-4 h-4" />
            <span>Siswa</span>
          </button>
          
          <button
            onClick={() => setPaymentModal({ open: true, editId: null, studentId: "", amount: settings.weeklyTarget.toString(), weekIndex: 1, date: new Date().toISOString().substring(0, 10) })}
            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Bayar Kas</span>
          </button>

          <button
            onClick={() => setExpenseModal({ open: true, editId: null, amount: "", category: "ATK", reason: "", date: new Date().toISOString().substring(0, 10) })}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Pengeluaran</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center space-x-1 border border-neutral-200 dark:border-neutral-700"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center space-x-1 border border-neutral-200 dark:border-neutral-700"
          >
            <Download className="w-4 h-4" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Management Tables & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Managers */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Students Manager */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-extrabold text-sm text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                Manajemen Anggota Siswa ({students.length})
              </h3>
              <input
                type="text"
                placeholder="Cari siswa..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="px-2.5 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
              />
            </div>

            <div className="max-h-60 overflow-y-auto border border-neutral-100 dark:border-neutral-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/80 text-neutral-500 font-bold border-b border-neutral-100 dark:border-neutral-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3 text-right">Terbayar</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="py-2 px-3 font-semibold text-neutral-800 dark:text-neutral-200">{s.name}</td>
                      <td className="py-2 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">Rp {s.paid.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setStudentModal({ open: true, editId: s.id, name: s.name })}
                            className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-700"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id, s.name)}
                            className="p-1 rounded bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Payments History Manager */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-extrabold text-sm text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-green-500" />
                Histori Seluruh Setoran Masuk ({payments.length})
              </h3>
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="px-2.5 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
              />
            </div>

            <div className="max-h-72 overflow-y-auto border border-neutral-100 dark:border-neutral-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/80 text-neutral-500 font-bold border-b border-neutral-100 dark:border-neutral-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Siswa</th>
                    <th className="py-2.5 px-3">Minggu</th>
                    <th className="py-2.5 px-3 text-right">Jumlah</th>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3 text-center">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="py-2 px-3 font-semibold text-neutral-800 dark:text-neutral-200">{p.studentName}</td>
                      <td className="py-2 px-3 text-neutral-500">M{p.weekIndex}</td>
                      <td className="py-2 px-3 text-right font-black text-green-600 dark:text-green-400">Rp {p.amount.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-3 text-neutral-400">{p.date}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleDeletePayment(p.id, p.studentName, p.amount)}
                          className="p-1 rounded bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Expenses History Manager */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-extrabold text-sm text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-red-500" />
                Daftar Seluruh Pengeluaran ({expenses.length})
              </h3>
              <input
                type="text"
                placeholder="Cari pengeluaran..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="px-2.5 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
              />
            </div>

            <div className="max-h-60 overflow-y-auto border border-neutral-100 dark:border-neutral-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/80 text-neutral-500 font-bold border-b border-neutral-100 dark:border-neutral-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Keperluan / Kategori</th>
                    <th className="py-2.5 px-3 text-right">Jumlah</th>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3 text-center">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-800 mr-2 uppercase">{e.category}</span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{e.reason}</span>
                      </td>
                      <td className="py-2 px-3 text-right font-black text-red-600 dark:text-red-400">- Rp {e.amount.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-3 text-neutral-400">{e.date}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleDeleteExpense(e.id, e.reason, e.amount)}
                          className="p-1 rounded bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: Activity Log Panel */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl transition-colors space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h4 className="font-extrabold text-sm text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-500" />
                Log Aktivitas Sistem
              </h4>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                Real-time
              </span>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {activityLogs.map((log) => (
                <div key={log.id} className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800/60 flex items-start space-x-2.5 text-xs">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-neutral-800 dark:text-neutral-200">{log.action}</p>
                    <p className="text-[11px] text-neutral-500 leading-normal">{log.details}</p>
                    <span className="text-[10px] text-neutral-400 font-medium block">
                      {new Date(log.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <div className="py-8 text-center text-xs text-neutral-400 italic">
                  Belum ada catatan aktivitas.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
