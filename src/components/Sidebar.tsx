import React from "react";
import { 
  Activity, 
  LayoutDashboard, 
  FilePlus, 
  FolderHeart, 
  Database, 
  FileText, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  statsCount: {
    todayTestsCount: number;
    totalRecordsCount: number;
  };
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isHidden?: boolean;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  statsCount,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  isHidden = false
}: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "لوحة التحكم",
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: "new-result",
      label: "تسجيل نتيجة جديدة",
      icon: FilePlus,
      badge: null
    },
    {
      id: "records",
      label: "السجلات الطبية",
      icon: FolderHeart,
      badge: statsCount.totalRecordsCount > 0 ? statsCount.totalRecordsCount : null
    },
    {
      id: "test-database",
      label: "بنك الفحوصات",
      icon: Database,
      badge: null
    },
    {
      id: "template-editor",
      label: "إدارة القوالب",
      icon: FileText,
      badge: null
    }
  ];

  return (
    <aside 
      id="staff-sidebar" 
      className={`bg-slate-900 border-l border-slate-800 text-slate-300 flex flex-col shrink-0 no-print transition-all duration-300 ease-in-out h-full
        ${isMobileOpen ? "fixed inset-y-0 right-0 z-50 flex w-64 shadow-2xl" : (isHidden ? "w-0 md:hidden overflow-hidden border-none" : (isCollapsed ? "w-20" : "w-64"))}
        ${isMobileOpen ? "flex" : (isHidden ? "hidden" : "hidden md:flex")}
      `}
    >
      {/* Sidebar Header */}
      <div className={`p-4 border-b border-slate-800 flex items-center justify-between gap-2 ${isCollapsed ? "flex-col py-6" : ""}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center shrink-0">
            <div className="w-4 h-4 border-2 border-white rounded-full"></div>
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in whitespace-nowrap">
              <h2 className="text-sm font-black text-white leading-tight">مركز ابن الهيثم</h2>
              <p className="text-[10px] text-sky-400 font-bold tracking-wider">نظام إدارة المختبرات</p>
            </div>
          )}
        </div>

        {/* Close button for Mobile */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Collapse toggle button for Desktop */}
        {!isMobileOpen && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {isCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobileOpen) {
                  setIsMobileOpen(false);
                }
              }}
              className={`w-full flex items-center rounded-xl font-bold text-sm transition-all cursor-pointer group relative ${
                isCollapsed ? "justify-center p-3" : "justify-between px-4 py-3"
              } ${
                isActive
                  ? "bg-slate-800 text-white border border-slate-700/40 shadow-xs"
                  : "hover:bg-slate-800/60 hover:text-white text-slate-400"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`h-5 w-5 shrink-0 ${isActive ? "text-sky-400" : "text-slate-500 group-hover:text-sky-400"}`} />
                {!isCollapsed && <span className="animate-fade-in whitespace-nowrap">{item.label}</span>}
              </div>
              
              {item.badge !== null && !isCollapsed && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isActive ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400"
                }`}>
                  {item.badge}
                </span>
              )}

              {item.badge !== null && isCollapsed && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {!isCollapsed ? (
          <>
            <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl text-center">
              <p className="text-[10px] text-slate-500 font-bold">حالة النظام</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-xs text-emerald-400 font-bold">متصل محلياً (نشط)</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl font-extrabold text-xs transition-all border border-rose-500/10 hover:border-transparent cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="relative group cursor-help">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full block animate-pulse"></span>
              <div className="absolute right-6 -top-1 bg-slate-950 text-white text-[10px] p-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 font-bold">
                متصل محلياً (نشط)
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all border border-rose-500/10 hover:border-transparent cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
