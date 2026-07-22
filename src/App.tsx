import React, { useState, useEffect } from 'react';
import {
  db,
  auth,
  googleProvider
} from './firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  Settings,
  Code,
  LogOut,
  LogIn,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Printer,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Info,
  Sliders,
  DollarSign,
  Smartphone,
  Globe,
  PlusCircle,
  HelpCircle,
  Eye,
  Check,
  TrendingUp,
  Clock,
  AlertTriangle,
  Shield,
  Lightbulb,
  Folder,
  Terminal,
  File
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';


// --- TYPES FOR APPLICATION ---
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
  weekIndex: number; // 1-4
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

interface GlobalSettings {
  className: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  weeklyTarget: number;
  monthlyTarget: number;
  infoClass: string;
  notificationEnabled: boolean;
}

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  type: string;
  timestamp: number;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: number;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>({
    className: "XI DKV 1",
    logoUrl: "https://picsum.photos/id/180/150/150",
    bannerUrl: "https://picsum.photos/id/10/800/300",
    primaryColor: "indigo",
    weeklyTarget: 4000,
    monthlyTarget: 16000,
    infoClass: "Program Keahlian Desain Komunikasi Visual - Angkatan 2025/2026",
    notificationEnabled: true
  });
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // UI Navigation / View States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [realtimeTime, setRealtimeTime] = useState("");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LUNAS' | 'BELUM LUNAS'>('ALL');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'paid-asc' | 'paid-desc'>('name-asc');

  // Loading States
  const [dbLoading, setDbLoading] = useState(true);

  // Admin Modal / Form States
  const [studentModal, setStudentModal] = useState<{ open: boolean; editId: string | null; name: string }>({ open: false, editId: null, name: "" });
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; editId: string | null; studentId: string; amount: string; weekIndex: number; date: string }>({ open: false, editId: null, studentId: "", amount: "", weekIndex: 1, date: "2026-07-20" });
  const [expenseModal, setExpenseModal] = useState<{ open: boolean; editId: string | null; amount: string; category: string; reason: string; date: string }>({ open: false, editId: null, amount: "", category: "ATK", reason: "", date: "2026-07-20" });


  // --- GOOGLE REALTIME WIB CLOCK ---
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // WIB clock (UTC+7)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formattedTime = now.toLocaleTimeString('id-ID', options);
      
      const dayOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      const formattedDate = now.toLocaleDateString('id-ID', dayOptions);
      
      setRealtimeTime(`${formattedDate} • ${formattedTime} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- AUTH LISTENER & ADMIN VALIDATION ---
  useEffect(() => {
    setIsAuthLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Strict Validation for syallprince@gmail.com and irsyalfaiz26@gmail.com
        const allowedAdmins = ['syallprince@gmail.com', 'irsyalfaiz26@gmail.com'];
        if (user.email && allowedAdmins.includes(user.email)) {
          setCurrentUser(user);
          setIsAdmin(true);
          setAuthError(null);
        } else {
          // Log out immediately if not the correct admin
          setAuthError(`Akses Ditolak. Email ${user.email} tidak memiliki akses admin.`);
          await signOut(auth);
          currentUser && setCurrentUser(null);
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- REAL-TIME FIRESTORE DATA LISTENERS ---
  useEffect(() => {
    setDbLoading(true);
    
    // Safety fallback timeout to prevent infinite spinner if Firestore slows down or blocks
    const safetyTimeout = setTimeout(() => {
      setDbLoading(false);
    }, 3000);
    
    // 1. Students Listener
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const studentList: Student[] = [];
      snapshot.forEach((doc) => {
        studentList.push({ id: doc.id, ...doc.data() } as Student);
      });
      // Sort alphabetically
      studentList.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(studentList);
    }, (error) => {
      console.error("Firestore Students error:", error);
    });

    // 2. Settings Listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as GlobalSettings);
      }
    }, (error) => {
      console.error("Firestore Settings error:", error);
    });

    // 3. Payments Listener
    const unsubPayments = onSnapshot(collection(db, 'payments'), (snapshot) => {
      const paymentsList: Payment[] = [];
      snapshot.forEach((doc) => {
        paymentsList.push({ id: doc.id, ...doc.data() } as Payment);
      });
      setPayments(paymentsList);
    }, (error) => {
      console.error("Firestore Payments error:", error);
    });

    // 4. Expenses Listener
    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      const expensesList: Expense[] = [];
      snapshot.forEach((doc) => {
        expensesList.push({ id: doc.id, ...doc.data() } as Expense);
      });
      setExpenses(expensesList);
    }, (error) => {
      console.error("Firestore Expenses error:", error);
    });

    // 5. Notifications Listener
    const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const notifList: NotificationLog[] = [];
      snapshot.forEach((doc) => {
        notifList.push({ id: doc.id, ...doc.data() } as NotificationLog);
      });
      notifList.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(notifList);
    }, (error) => {
      console.error("Firestore Notifications error:", error);
    });

    // 6. Activity Logs Listener
    const unsubLogs = onSnapshot(collection(db, 'activity_logs'), (snapshot) => {
      const logList: ActivityLog[] = [];
      snapshot.forEach((doc) => {
        logList.push({ id: doc.id, ...doc.data() } as ActivityLog);
      });
      logList.sort((a, b) => b.timestamp - a.timestamp);
      setActivityLogs(logList);
      setDbLoading(false);
      clearTimeout(safetyTimeout);
    }, (error) => {
      console.error("Firestore Activity Logs error:", error);
      setDbLoading(false);
      clearTimeout(safetyTimeout);
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubStudents();
      unsubSettings();
      unsubPayments();
      unsubExpenses();
      unsubNotifications();
      unsubLogs();
    };
  }, []);

  // --- AUTOMATIC DATABASE SEEDING ---
  // --- DATABASE HELPERS ---
  const logActivity = async (action: string, details: string) => {
    try {
      await addDoc(collection(db, 'activity_logs'), {
        action,
        details,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const sendNotification = async (title: string, body: string, type: string) => {
    if (!settings.notificationEnabled) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        title,
        body,
        type,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error(e);
    }
  };

  // --- GOOGLE SIGN IN ACTION ---
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setAuthError(err?.message || "Gagal masuk menggunakan Google.");
    }
  };

  // --- SIGNOUT ACTION ---
  const handleLogout = async () => {
    await signOut(auth);
  };

  // --- FINANCIAL CALCULATION MATH ---
  const activePayments = payments;
  const activeExpenses = expenses;

  const totalIncome = activePayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Student metrics calculations
  const studentMetrics = students.map(student => {
    const studentPayments = activePayments.filter(p => p.studentId === student.id);
    const paid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    const isLunas = paid >= settings.monthlyTarget;
    const remaining = Math.max(0, settings.monthlyTarget - paid);
    
    // Last payment date
    let lastPayDate = "-";
    if (studentPayments.length > 0) {
      const sorted = [...studentPayments].sort((a, b) => b.timestamp - a.timestamp);
      lastPayDate = sorted[0].date;
    }

    return {
      ...student,
      paid,
      isLunas,
      remaining,
      lastPayDate
    };
  });

  const countLunas = studentMetrics.filter(s => s.isLunas).length;
  const countBelumLunas = studentMetrics.filter(s => !s.isLunas).length;

  // --- CHARTS DATAFORMATTERS ---
  // Income Chart Data (Daily / Weekly breakdown)
  const getIncomeChartData = () => {
    const weeklyData = [
      { name: 'Minggu 1', Pemasukan: 0 },
      { name: 'Minggu 2', Pemasukan: 0 },
      { name: 'Minggu 3', Pemasukan: 0 },
      { name: 'Minggu 4', Pemasukan: 0 },
    ];
    activePayments.forEach(p => {
      if (p.weekIndex >= 1 && p.weekIndex <= 4) {
        weeklyData[p.weekIndex - 1].Pemasukan += p.amount;
      } else {
        // Fallback default distribution based on day
        const day = new Date(p.date).getDate();
        if (day <= 7) weeklyData[0].Pemasukan += p.amount;
        else if (day <= 14) weeklyData[1].Pemasukan += p.amount;
        else if (day <= 21) weeklyData[2].Pemasukan += p.amount;
        else weeklyData[3].Pemasukan += p.amount;
      }
    });
    return weeklyData;
  };

  // Expenses Category breakdown
  const getExpensesChartData = () => {
    const categories = ["ATK", "Kegiatan", "Donasi", "Kebersihan", "Konsumsi", "Lainnya"];
    return categories.map(cat => {
      const amount = activeExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
      return { name: cat, value: amount };
    }).filter(c => c.value > 0);
  };

  // Balance trend
  const getBalanceTrendData = () => {
    // Generate dates sorted
    const paymentsByDate = activePayments.reduce((acc: any, p) => {
      acc[p.date] = (acc[p.date] || 0) + p.amount;
      return acc;
    }, {});

    const expensesByDate = activeExpenses.reduce((acc: any, e) => {
      acc[e.date] = (acc[e.date] || 0) + e.amount;
      return acc;
    }, {});

    const allDates = Array.from(new Set([...Object.keys(paymentsByDate), ...Object.keys(expensesByDate)])).sort();
    
    let cumulative = 0;
    return allDates.map(date => {
      const inc = paymentsByDate[date] || 0;
      const exp = expensesByDate[date] || 0;
      cumulative += (inc - exp);
      return {
        date: date.substring(8, 10) + "/" + date.substring(5, 7), // dd/mm format
        Saldo: cumulative
      };
    });
  };

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1e3a8a'];

  // --- CRUD FUNCTIONS FOR ADMIN ---
  // Student
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentModal.name.trim()) return;
    try {
      if (studentModal.editId) {
        await setDoc(doc(db, 'students', studentModal.editId), { name: studentModal.name, active: true });
        await logActivity("Update Siswa", `Mengubah nama siswa menjadi ${studentModal.name}`);
      } else {
        await addDoc(collection(db, 'students'), { name: studentModal.name, active: true });
        await logActivity("Tambah Siswa", `Menambahkan siswa baru bernama ${studentModal.name}`);
      }
      setStudentModal({ open: false, editId: null, name: "" });
    } catch (e) {
      alert("Error menyimpan siswa: " + e);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus siswa ${name}?`)) return;
    try {
      await deleteDoc(doc(db, 'students', id));
      await logActivity("Hapus Siswa", `Menghapus siswa bernama ${name}`);
    } catch (e) {
      alert("Error menghapus siswa: " + e);
    }
  };

  // Payment
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { editId, studentId, amount, weekIndex, date } = paymentModal;
    if (!studentId || !amount) return;
    const numAmount = parseFloat(amount);
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    try {
      if (editId) {
        await setDoc(doc(db, 'payments', editId), {
          studentId,
          studentName: student.name,
          amount: numAmount,
          weekIndex,
          date,
          monthPeriod: "Semua Periode",
          timestamp: Date.now()
        });
        await logActivity("Update Pembayaran", `Mengubah pembayaran ${student.name} sebesar Rp ${numAmount.toLocaleString('id-ID')}`);
      } else {
        await addDoc(collection(db, 'payments'), {
          studentId,
          studentName: student.name,
          amount: numAmount,
          weekIndex,
          date,
          monthPeriod: "Semua Periode",
          timestamp: Date.now()
        });
        await logActivity("Tambah Pembayaran", `Menerima pembayaran dari ${student.name} sebesar Rp ${numAmount.toLocaleString('id-ID')} (Minggu ${weekIndex})`);
        await sendNotification(
          "Pembayaran Kas Baru",
          `${student.name} telah menyetor Rp ${numAmount.toLocaleString('id-ID')} untuk kas Minggu ${weekIndex}.`,
          "PEMBAYARAN"
        );
      }
      setPaymentModal({ open: false, editId: null, studentId: "", amount: "", weekIndex: 1, date: "2026-07-20" });
    } catch (e) {
      alert("Error menyimpan pembayaran: " + e);
    }
  };

  const handleDeletePayment = async (id: string, studentName: string, amount: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data pembayaran ini?")) return;
    try {
      await deleteDoc(doc(db, 'payments', id));
      await logActivity("Hapus Pembayaran", `Menghapus pembayaran ${studentName} sebesar Rp ${amount.toLocaleString('id-ID')}`);
    } catch (e) {
      alert("Error menghapus pembayaran: " + e);
    }
  };

  // Expense
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const { editId, amount, category, reason, date } = expenseModal;
    if (!amount || !reason) return;
    const numAmount = parseFloat(amount);

    try {
      if (editId) {
        await setDoc(doc(db, 'expenses', editId), {
          amount: numAmount,
          category,
          reason,
          date,
          monthPeriod: "Semua Periode",
          timestamp: Date.now()
        });
        await logActivity("Update Pengeluaran", `Mengubah pengeluaran ${reason} menjadi Rp ${numAmount.toLocaleString('id-ID')}`);
      } else {
        await addDoc(collection(db, 'expenses'), {
          amount: numAmount,
          category,
          reason,
          date,
          monthPeriod: "Semua Periode",
          timestamp: Date.now()
        });
        await logActivity("Tambah Pengeluaran", `Mengeluarkan Rp ${numAmount.toLocaleString('id-ID')} untuk ${reason}`);
        await sendNotification(
          "Pengeluaran Kas Baru",
          `Pengeluaran kas kelas sebesar Rp ${numAmount.toLocaleString('id-ID')} digunakan untuk [${category}] ${reason}.`,
          "PENGELUARAN"
        );

        // Check low balance condition
        const theoreticalBalance = netBalance - numAmount;
        if (theoreticalBalance < 30000) {
          await sendNotification(
            "Saldo Kas Menipis!",
            `Perhatian, sisa saldo kas kelas Anda saat ini menipis: Rp ${theoreticalBalance.toLocaleString('id-ID')}. Mohon himbau siswa untuk segera lunas.`,
            "SALDO_MENIPIS"
          );
        }
      }
      setExpenseModal({ open: false, editId: null, amount: "", category: "ATK", reason: "", date: "2026-07-20" });
    } catch (e) {
      alert("Error menyimpan pengeluaran: " + e);
    }
  };

  const handleDeleteExpense = async (id: string, reason: string, amount: number) => {
    if (!window.confirm(`Hapus pengeluaran "${reason}"?`)) return;
    try {
      await deleteDoc(doc(db, 'expenses', id));
      await logActivity("Hapus Pengeluaran", `Menghapus pengeluaran "${reason}" sebesar Rp ${amount.toLocaleString('id-ID')}`);
    } catch (e) {
      alert("Error menghapus pengeluaran: " + e);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      await logActivity("Update Pengaturan", "Mengubah pengaturan konfigurasi kas kelas");
      alert("Pengaturan berhasil disimpan!");
    } catch (e) {
      alert("Error menyimpan pengaturan: " + e);
    }
  };

  // --- REPORT GENERATION EXPORTERS ---
  const handlePrintReport = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Generate simple clean CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "No,Nama Siswa,Total Bayar Bulanan,Status Pembayaran,Kurang Bayar,Pembayaran Terakhir\n";
    
    studentMetrics.forEach((s, i) => {
      csvContent += `${i + 1},"${s.name}",${s.paid},${s.isLunas ? 'LUNAS' : 'BELUM LUNAS'},${s.remaining},"${s.lastPayDate}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Kas_Seluruh_Waktu.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- SEARCH, FILTER & SORT LOGIC ---
  const filteredStudents = studentMetrics.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' ||
      (statusFilter === 'LUNAS' && s.isLunas) ||
      (statusFilter === 'BELUM LUNAS' && !s.isLunas);
    return matchesSearch && matchesFilter;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    if (sortBy === 'paid-asc') return a.paid - b.paid;
    if (sortBy === 'paid-desc') return b.paid - a.paid;
    return 0;
  });

  // --- THEME COLOR CLASSES HELPER ---
  const getThemeClasses = () => {
    return {
      bg: 'bg-blue-600',
      hoverBg: 'hover:bg-blue-700',
      text: 'text-blue-600',
      border: 'border-blue-600',
      accentBg: 'bg-blue-50 dark:bg-blue-900/30',
      accentText: 'text-blue-700 dark:text-blue-400',
      focusRing: 'focus:ring-blue-500'
    };
  };

  const theme = getThemeClasses();

  const design = {
    wrapper: isDarkMode ? 'min-h-screen bg-neutral-950 text-neutral-100 font-sans' : 'min-h-screen bg-neutral-50 text-neutral-800 font-sans',
    card: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-5',
    header: 'bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30 transition-colors',
    panelHeader: 'text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center gap-2',
    btnPrimary: `bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm px-4 py-2`,
    badgeLunas: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-md px-2 py-0.5 text-xs font-medium',
    badgeBelum: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md px-2 py-0.5 text-xs font-medium',
    textMuted: 'text-neutral-500 dark:text-neutral-400',
    textHeading: 'text-neutral-800 dark:text-neutral-100 font-bold',
    borderAccent: 'border-neutral-200 dark:border-neutral-800',
    pill: 'rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1 text-sm'
  };

  return (
    <div className={design.wrapper}>
      
      {/* --- TOP BRAND BAR --- */}
      <header className={design.header}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl ${theme.bg} text-white flex items-center justify-center shadow-md font-bold text-lg`}>
              DKV
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight flex items-center gap-1.5">
                Kas {settings.className}
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-normal">
                  v1.0-Android
                </span>
              </h1>
              <p className="text-xs text-neutral-500 font-medium">SMK Negeri 1 • App & Code Center</p>
            </div>
          </div>

          {/* Time & Quick Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span>{realtimeTime || "Loading WIB Clock..."}</span>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 transition-colors"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth Button */}
            {isAuthLoading ? (
              <div className="w-10 h-10 rounded-full border-2 border-neutral-300 border-t-indigo-600 animate-spin"></div>
            ) : currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="hidden lg:block text-right">
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Admin Active</p>
                  <p className="text-[10px] text-green-600 font-medium">{currentUser.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-100 transition-colors flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-semibold">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className={`px-4 py-2 rounded-lg text-white font-semibold text-sm flex items-center space-x-2 transition-all ${theme.bg} ${theme.hoverBg} shadow-sm shadow-indigo-200 dark:shadow-none`}
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- REJECTED AUTH WARNING BAR --- */}
      {authError && (
        <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 px-4 py-3 text-center text-sm font-semibold flex items-center justify-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 animate-bounce" />
          <span>{authError}</span>
          <button onClick={() => setAuthError(null)} className="ml-4 underline text-xs">Tutup</button>
        </div>
      )}

      {/* --- PRIMARY DESKTOP LAYOUT GRID --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* --- MAIN LAYOUT --- */}
        {dbLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className={`w-12 h-12 rounded-full border-4 border-neutral-200 border-t-current ${theme.text} animate-spin mb-4`}></div>
            <p className="text-neutral-500 text-sm font-medium">Menghubungkan ke Google Firebase Firestore...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Simulated Android Device Frame (Left / Center representation) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Class Banner Banner */}
                  <div className="relative rounded-2xl overflow-hidden h-44 sm:h-56 bg-neutral-800 border border-neutral-200 dark:border-neutral-800 group shadow-md transition-all">
                    <img
                      src={settings.bannerUrl || "https://picsum.photos/id/10/800/300"}
                      alt="Class Banner"
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent p-6 flex flex-col justify-end">
                      <div className="flex items-center space-x-4">
                        <img
                          src={settings.logoUrl || "https://picsum.photos/id/180/150/150"}
                          alt="Class Logo"
                          className="w-16 h-16 rounded-full border-2 border-white object-cover bg-white shadow-md shadow-neutral-950/50"
                        />
                        <div>
                          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">Uang Kas XI DKV 1</h2>
                          <p className="text-xs sm:text-sm text-neutral-300 font-medium">{settings.infoClass}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Date/Time Bar */}
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                    <div>
                      <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Waktu Terkini</p>
                      <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                        <Clock className="w-5 h-5 text-blue-500" />
                        {realtimeTime || "Memuat waktu..."}
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse inline-block ml-2" title="Live"></span>
                      </h3>
                    </div>
                  </div>

                  {/* Primary Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    
                    {/* Card Total Kas */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full translate-x-8 -translate-y-8"></div>
                      <Wallet className="w-5 h-5 text-indigo-500 mb-3" />
                      <p className="text-xs text-neutral-400 font-semibold">Total Pemasukan</p>
                      <h4 className="text-lg sm:text-xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">
                        Rp {totalIncome.toLocaleString('id-ID')}
                      </h4>
                      <p className="text-[10px] text-neutral-500 mt-1">Setoran kumulatif bulan ini</p>
                    </div>

                    {/* Card Total Pengeluaran */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full translate-x-8 -translate-y-8"></div>
                      <Receipt className="w-5 h-5 text-red-500 mb-3" />
                      <p className="text-xs text-neutral-400 font-semibold">Total Pengeluaran</p>
                      <h4 className="text-lg sm:text-xl font-bold mt-1 text-red-600 dark:text-red-400">
                        Rp {totalExpense.toLocaleString('id-ID')}
                      </h4>
                      <p className="text-[10px] text-neutral-500 mt-1">Penggunaan kas bulan ini</p>
                    </div>

                    {/* Card Saldo Kas */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl relative overflow-hidden col-span-2 md:col-span-1 group hover:shadow-md transition-all">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full translate-x-8 -translate-y-8"></div>
                      <TrendingUp className="w-5 h-5 text-green-500 mb-3" />
                      <p className="text-xs text-neutral-400 font-semibold">Saldo Kas</p>
                      <h4 className={`text-lg sm:text-xl font-extrabold mt-1 ${netBalance < 30000 ? 'text-orange-500' : 'text-green-600 dark:text-green-400'}`}>
                        Rp {netBalance.toLocaleString('id-ID')}
                      </h4>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        {netBalance < 30000 ? 'Kas Menipis!' : 'Sisa kas siap pakai'}
                      </p>
                    </div>

                    {/* Student Metrics Counts */}
                    <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-2xl text-center border border-neutral-200 dark:border-neutral-800">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Siswa Terdaftar</p>
                      <h5 className="text-xl font-black text-neutral-800 dark:text-neutral-100 mt-0.5">{students.length}</h5>
                      <span className="text-[10px] text-neutral-500 font-medium">Aktif belajar</span>
                    </div>

                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-2xl text-center border border-green-200/50 dark:border-green-900/30">
                      <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase">Lunas Bulan Ini</p>
                      <h5 className="text-xl font-black text-green-700 dark:text-green-400 mt-0.5">{countLunas}</h5>
                      <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Target &gt;= Rp {settings.monthlyTarget.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl text-center border border-red-200/50 dark:border-red-900/30">
                      <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">Belum Lunas</p>
                      <h5 className="text-xl font-black text-red-700 dark:text-red-400 mt-0.5">{countBelumLunas}</h5>
                      <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">Menunggak kas</span>
                    </div>
                  </div>

                  {/* Visual Charts Recharts */}
                  <div className={design.card + " space-y-8"}>
                    <div>
                      <h3 className={design.textHeading + " flex items-center gap-1.5"}>
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Visualisasi Aliran Dana Kas
                      </h3>
                      <p className={design.textMuted + " text-xs mt-1"}>Representasi grafis keuangan kas kelas</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* 1. Area Chart: Income Breakdown */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">Pemasukan per Minggu</h4>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getIncomeChartData()}>
                              <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                              <XAxis dataKey="name" fontSize={11} stroke="#9ca3af" axisLine={false} tickLine={false} />
                              <YAxis fontSize={11} stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
                              <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} cursor={{stroke: '#cbd5e1', strokeWidth: 1}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Area type="monotone" dataKey="Pemasukan" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* 2. Pie Chart: Expenses Categories */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">Distribusi Kategori Pengeluaran</h4>
                        <div className="h-56 flex items-center justify-center">
                          {getExpensesChartData().length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getExpensesChartData()}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={55}
                                  outerRadius={75}
                                  paddingAngle={3}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {getExpensesChartData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 11, fontFamily: 'inherit' }} iconType="circle" />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="text-neutral-400 text-xs italic py-10">Belum ada pengeluaran periode ini.</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 3. Area Chart: Cumulative Balance Trend */}
                    {getBalanceTrendData().length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">Tren Kumulatif Saldo Kas</h4>
                        <div className="h-44">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getBalanceTrendData()}>
                              <defs>
                                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" fontSize={11} stroke="#9CA3AF" />
                              <YAxis fontSize={11} stroke="#9CA3AF" />
                              <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                              <Area type="monotone" dataKey="Saldo" stroke="#10B981" fillOpacity={1} fill="url(#colorSaldo)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Student Directory Directory Panel */}
                  <div className={design.card + " space-y-5"}>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-extrabold text-base text-neutral-800 dark:text-neutral-100">Daftar Setoran Siswa</h3>
                        <p className="text-xs text-neutral-500">Siswa wajib iuran Rp {settings.weeklyTarget.toLocaleString('id-ID')}/minggu atau Rp {settings.monthlyTarget.toLocaleString('id-ID')}/bulan</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isAdmin && (
                          <button
                            onClick={() => setStudentModal({ open: true, editId: null, name: "" })}
                            className={`px-3 py-1.5 rounded-lg text-white font-bold text-xs flex items-center space-x-1 ${theme.bg} ${theme.hoverBg}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Siswa</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Search and Filters UI */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                      <div className="relative sm:col-span-5">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Cari nama siswa..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>

                      <div className="flex items-center space-x-2 sm:col-span-4">
                        <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as any)}
                          className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold py-2 px-3 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        >
                          <option value="ALL">Semua Status</option>
                          <option value="LUNAS">Lunas</option>
                          <option value="BELUM LUNAS">Belum Lunas</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-2 sm:col-span-3">
                        <ArrowUpDown className="w-4 h-4 text-neutral-400 shrink-0" />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold py-2 px-3 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        >
                          <option value="name-asc">Nama A-Z</option>
                          <option value="name-desc">Nama Z-A</option>
                          <option value="paid-desc">Setoran Terbanyak</option>
                          <option value="paid-asc">Setoran Terendah</option>
                        </select>
                      </div>
                    </div>

                    {/* Table / List Representation */}
                    <div className="overflow-x-auto border border-neutral-100 dark:border-neutral-800 rounded-2xl">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-400 text-xs font-bold uppercase border-b border-neutral-200 dark:border-neutral-800">
                          <tr>
                            <th className="py-3 px-4">Siswa</th>
                            <th className="py-3 px-4 text-right">Bayar Bulan Ini</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-right">Kurang Bayar</th>
                            <th className="py-3 px-4">Terakhir Setor</th>
                            {isAdmin && <th className="py-3 px-4 text-center">Aksi</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {sortedStudents.map((s, index) => (
                            <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-neutral-800 dark:text-neutral-100">{s.name}</div>
                                <div className="text-[10px] text-neutral-400">ID: {s.id.substring(0, 8)}</div>
                              </td>
                              <td className="py-3.5 px-4 text-right font-black text-neutral-800 dark:text-neutral-100">
                                Rp {s.paid.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  s.isLunas
                                    ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800/30'
                                    : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-800/30'
                                }`}>
                                  {s.isLunas ? 'Lunas' : 'Belum Lunas'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-semibold text-red-500">
                                {s.remaining > 0 ? `Rp ${s.remaining.toLocaleString('id-ID')}` : '-'}
                              </td>
                              <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                                {s.lastPayDate}
                              </td>
                              {isAdmin && (
                                <td className="py-3.5 px-4 text-center">
                                  <div className="flex items-center justify-center space-x-1.5">
                                    <button
                                      onClick={() => setStudentModal({ open: true, editId: s.id, name: s.name })}
                                      className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 border border-neutral-200 dark:border-neutral-700 transition-colors"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteStudent(s.id, s.name)}
                                      className="p-1 rounded bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30 hover:bg-red-100 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                          {sortedStudents.length === 0 && (
                            <tr>
                              <td colSpan={isAdmin ? 6 : 5} className="py-10 text-center text-xs italic text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/50">
                                Tidak ada data siswa yang cocok dengan filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Expenses Logs Widget */}
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-base text-neutral-800 dark:text-neutral-100">Catatan Pengeluaran</h3>
                        <p className="text-xs text-neutral-500">Histori pembelian atau iuran kegiatan keluar</p>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => setExpenseModal({ open: true, editId: null, amount: "", category: "ATK", reason: "", date: "2026-07-20" })}
                          className={`px-3 py-1.5 rounded-lg text-white font-bold text-xs flex items-center space-x-1 ${theme.bg} ${theme.hoverBg}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Pengeluaran</span>
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-2xl overflow-hidden">
                      {activeExpenses.map((exp) => (
                        <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400">
                                {exp.category}
                              </span>
                              <span className="text-xs text-neutral-400 font-semibold">{exp.date}</span>
                            </div>
                            <p className="font-bold text-sm text-neutral-800 dark:text-neutral-200">{exp.reason}</p>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="font-black text-red-600 dark:text-red-400 text-sm">
                              - Rp {exp.amount.toLocaleString('id-ID')}
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteExpense(exp.id, exp.reason, exp.amount)}
                                className="p-1 rounded bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30 hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {activeExpenses.length === 0 && (
                        <div className="py-10 text-center text-xs italic text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/50">
                          Belum ada pengeluaran yang dicatat untuk periode ini.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Simulated Android Sidebar Panel (Right Widget Section) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Digital Calendar Widget */}
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl transition-colors space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className={`w-5 h-5 ${theme.text}`} />
                        <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">Kalender Kas</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-extrabold">
                        WIB
                      </span>
                    </div>

                    {/* Standard Mock Month Days Calendar Grid */}
                    <div className="space-y-3">
                      <div className="text-center font-black text-xs text-neutral-500 uppercase tracking-wider">
                        Juli 2026
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-neutral-400 uppercase">
                        <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
                      </div>

                      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold">
                        {/* Fill days */}
                        <span className="text-neutral-300 dark:text-neutral-700">28</span>
                        <span className="text-neutral-300 dark:text-neutral-700">29</span>
                        <span className="text-neutral-300 dark:text-neutral-700">30</span>
                        <span>1</span>
                        <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600" title="Beli sapu">2<span className="absolute bottom-0 w-1 h-1 rounded-full bg-red-500"></span></span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                        <span>6</span>
                        <span>7</span>
                        <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600" title="Spidol">8<span className="absolute bottom-0 w-1 h-1 rounded-full bg-red-500"></span></span>
                        <span>9</span>
                        <span>10</span>
                        <span>11</span>
                        <span>12</span>
                        <span>13</span>
                        <span>14</span>
                        <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600" title="Rapat">15<span className="absolute bottom-0 w-1 h-1 rounded-full bg-red-500"></span></span>
                        <span>16</span>
                        <span>17</span>
                        <span>18</span>
                        <span>19</span>
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center animate-pulse">20</span>
                        <span>21</span>
                        <span>22</span>
                        <span>23</span>
                        <span>24</span>
                        <span>25</span>
                        <span>26</span>
                        <span>27</span>
                        <span>28</span>
                        <span>29</span>
                        <span>30</span>
                        <span>31</span>
                      </div>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-500 space-y-1.5">
                      <p className="font-bold text-neutral-700 dark:text-neutral-300">Informasi Kegiatan Kas Bulan Ini:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Tanggal 02: Pembelian alat sapu & pengki.</li>
                        <li>Tanggal 08: Pembelian spidol kelas baru.</li>
                        <li>Tanggal 15: Konsumsi rapat evaluasi kelas.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Push Notifications Sim Log */}
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl transition-colors space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <Bell className={`w-5 h-5 ${theme.text} animate-swing`} />
                        <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">Pemberitahuan Terkini</h4>
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400">FCM Live</span>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 flex items-start space-x-2.5">
                          <Bell className="w-4 h-4 shrink-0 text-blue-500" />
                          <div className="space-y-0.5">
                            <h5 className="font-black text-xs text-neutral-800 dark:text-neutral-200 leading-tight">{notif.title}</h5>
                            <p className="text-[10px] text-neutral-500 leading-snug">{notif.body}</p>
                            <p className="text-[9px] text-neutral-400 font-semibold">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="py-8 text-center text-xs text-neutral-400 italic">
                          Belum ada notifikasi yang dipicu.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Guide Widget */}
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-5 rounded-2xl space-y-3">
                    <h4 className="font-bold text-xs text-indigo-800 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-4 h-4 shrink-0" />
                      Ingin Menguji Panel Admin?
                    </h4>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                      Sistem ini memiliki autentikasi ketat. Anda bisa masuk menggunakan Google Sign In. Hanya akun email admin terdaftar (<strong className="underline">syallprince@gmail.com</strong> atau <strong className="underline">irsyalfaiz26@gmail.com</strong>) yang akan diizinkan mengakses panel tulis database, mengedit kas, atau merubah konfigurasi sistem.
                    </p>
                  </div>

                </div>
              </div>
        )}

      </div>

      {/* --- MODAL FORM DIALOGS --- */}
      {/* 1. STUDENT MODAL */}
      {studentModal.open && (
        <div className="fixed inset-0 bg-neutral-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-extrabold text-base text-neutral-800 dark:text-neutral-100">
              {studentModal.editId ? "Ubah Siswa" : "Tambah Siswa Baru"}
            </h3>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap..."
                  value={studentModal.name}
                  onChange={(e) => setStudentModal({ ...studentModal, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStudentModal({ open: false, editId: null, name: "" })}
                  className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-extrabold text-white rounded-lg ${theme.bg} ${theme.hoverBg}`}
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. PAYMENT MODAL */}
      {paymentModal.open && (
        <div className="fixed inset-0 bg-neutral-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-extrabold text-base text-neutral-800 dark:text-neutral-100">
              {paymentModal.editId ? "Edit Pembayaran Kas" : "Setor Pembayaran Baru"}
            </h3>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Pilih Siswa</label>
                <select
                  value={paymentModal.studentId}
                  onChange={(e) => setPaymentModal({ ...paymentModal, studentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm"
                  required
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Minggu Ke (1-4)</label>
                  <select
                    value={paymentModal.weekIndex}
                    onChange={(e) => setPaymentModal({ ...paymentModal, weekIndex: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm"
                  >
                    <option value={1}>Minggu 1</option>
                    <option value={2}>Minggu 2</option>
                    <option value={3}>Minggu 3</option>
                    <option value={4}>Minggu 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Nominal Setoran (IDR)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 4000"
                    value={paymentModal.amount}
                    onChange={(e) => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Tanggal Transaksi</label>
                <input
                  type="date"
                  value={paymentModal.date}
                  onChange={(e) => setPaymentModal({ ...paymentModal, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModal({ open: false, editId: null, studentId: "", amount: "", weekIndex: 1, date: "2026-07-20" })}
                  className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-extrabold text-white rounded-lg ${theme.bg} ${theme.hoverBg}`}
                >
                  Setor Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EXPENSE MODAL */}
      {expenseModal.open && (
        <div className="fixed inset-0 bg-neutral-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-extrabold text-base text-neutral-800 dark:text-neutral-100">
              {expenseModal.editId ? "Ubah Pengeluaran" : "Tambah Pengeluaran Kas Baru"}
            </h3>

            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Kategori</label>
                  <select
                    value={expenseModal.category}
                    onChange={(e) => setExpenseModal({ ...expenseModal, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm"
                  >
                    <option value="ATK">ATK</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Donasi">Donasi</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Konsumsi">Konsumsi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Nominal (IDR)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 15000"
                    value={expenseModal.amount}
                    onChange={(e) => setExpenseModal({ ...expenseModal, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Alasan Penggunaan</label>
                <input
                  type="text"
                  placeholder="Contoh: Beli spidol kelas & isi ulang tinta"
                  value={expenseModal.reason}
                  onChange={(e) => setExpenseModal({ ...expenseModal, reason: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Tanggal Pengeluaran</label>
                <input
                  type="date"
                  value={expenseModal.date}
                  onChange={(e) => setExpenseModal({ ...expenseModal, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExpenseModal({ open: false, editId: null, amount: "", category: "ATK", reason: "", date: "2026-07-20" })}
                  className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-extrabold text-white rounded-lg ${theme.bg} ${theme.hoverBg}`}
                >
                  Catat Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FOOTER CONTENT --- */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-8 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            Aplikasi Uang Kas {settings.className} SMKN 1
          </p>
          <p className="text-xs text-neutral-400 font-medium">
            Dikembangkan secara profesional menggunakan Kotlin, Android Studio & Google Firebase.
          </p>
          <p className="text-[10px] text-neutral-400">
            © 2026 Kelas XI DKV 1. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
