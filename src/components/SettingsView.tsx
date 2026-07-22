import React from 'react';
import { Sliders, Bell, Globe, Image, Shield, AlertTriangle } from 'lucide-react';

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

interface SettingsViewProps {
  settings: GlobalSettings;
  setSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>;
  handleSaveSettings: (e: React.FormEvent) => Promise<void>;
  theme: {
    bg: string;
    hoverBg: string;
    text: string;
    border: string;
    accentBg: string;
  };
}

export default function SettingsView({ settings, setSettings, handleSaveSettings, theme }: SettingsViewProps) {
  return (
    <div className="space-y-6">
      
      {/* Title Header Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl flex items-center space-x-3.5 transition-colors">
        <div className={`p-3 rounded-xl ${theme.accentBg} ${theme.text}`}>
          <Sliders className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-extrabold text-lg text-neutral-800 dark:text-neutral-100">Pengaturan Sistem Kas Kelas</h2>
          <p className="text-xs text-neutral-500">Konfigurasi nominal target, banner, logo, dan fungsionalitas notifikasi Firebase.</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Core Configuration Panel */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl space-y-6 transition-colors">
            <h3 className="font-extrabold text-base text-neutral-800 dark:text-neutral-100 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              Detail Kelas & Keuangan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Nama Identitas Kelas</label>
                <input
                  type="text"
                  value={settings.className}
                  onChange={(e) => setSettings({ ...settings, className: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-neutral-800 dark:text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Target Mingguan (IDR)</label>
                <input
                  type="number"
                  value={settings.weeklyTarget}
                  onChange={(e) => setSettings({ ...settings, weeklyTarget: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-neutral-800 dark:text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Target Bulanan (IDR)</label>
                <input
                  type="number"
                  value={settings.monthlyTarget}
                  onChange={(e) => setSettings({ ...settings, monthlyTarget: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-neutral-800 dark:text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Warna Aksen Utama</label>
                <select
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-neutral-700 dark:text-neutral-300"
                >
                  <option value="indigo">Indigo Blue</option>
                  <option value="emerald">Emerald Green</option>
                  <option value="rose">Rose Red</option>
                  <option value="amber">Amber Orange</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Deskripsi / Informasi Kelas</label>
              <textarea
                value={settings.infoClass}
                onChange={(e) => setSettings({ ...settings, infoClass: e.target.value })}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-neutral-800 dark:text-neutral-100"
                required
              />
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl space-y-6 transition-colors">
            <h3 className="font-extrabold text-base text-neutral-800 dark:text-neutral-100 pb-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
              <Image className="w-5 h-5 text-indigo-500" /> Tampilan Logo & Banner
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">URL Logo Kelas</label>
                <input
                  type="url"
                  value={settings.logoUrl}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-neutral-800 dark:text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">URL Banner Kelas</label>
                <input
                  type="url"
                  value={settings.bannerUrl}
                  onChange={(e) => setSettings({ ...settings, bannerUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-neutral-800 dark:text-neutral-100"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Action & Integrations Panel */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl space-y-4 transition-colors">
            <h4 className="font-extrabold text-sm text-neutral-800 dark:text-neutral-100">Simpan Konfigurasi</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Konfigurasi ini akan disimpan secara real-time ke Firebase Firestore. Perubahan akan langsung terlihat di semua simulator siswa.
            </p>
            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-white font-extrabold text-sm shadow-md transition-all ${theme.bg} ${theme.hoverBg}`}
            >
              Simpan Perubahan
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl space-y-4 transition-colors">
            <h4 className="font-extrabold text-sm text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-orange-500" /> Notifikasi Firebase (FCM)
            </h4>
            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Aktifkan FCM</span>
                <p className="text-[10px] text-neutral-400">Picu notifikasi saat transaksi dicatat</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationEnabled}
                  onChange={(e) => setSettings({ ...settings, notificationEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-5 rounded-2xl space-y-3">
            <h4 className="font-bold text-xs text-indigo-800 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" /> Keamanan Database
            </h4>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
              Hanya akun admin terdaftar yang diizinkan untuk menulis ke koleksi Firestore <code className="bg-indigo-100 dark:bg-indigo-950 px-1 py-0.5 rounded font-bold">settings</code>.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
