import React from "react";
import { 
  FolderHeart, 
  FilePlus, 
  Database, 
  FileText, 
  TrendingUp, 
  Activity, 
  Clock, 
  UserCheck,
  CalendarDays,
  Printer,
  ChevronLeft
} from "lucide-react";
import { PatientRecord, AppStats } from "../types";

interface DashboardProps {
  stats: AppStats;
  recentRecords: PatientRecord[];
  onQuickAction: (tab: string) => void;
  onPrintRecord: (record: PatientRecord) => void;
  onEditRecord: (record: PatientRecord) => void;
}

export default function Dashboard({ 
  stats, 
  recentRecords, 
  onQuickAction, 
  onPrintRecord,
  onEditRecord 
}: DashboardProps) {
  
  const statCards = [
    {
      title: "إجمالي السجلات الطبية",
      value: stats.totalRecordsCount,
      icon: FolderHeart,
      desc: "جميع نتائج المرضى المحفوظة",
      color: "text-sky-600 bg-sky-50 border-sky-100",
      actionLabel: "تصفح السجلات"
    },
    {
      title: "فحوصات اليوم",
      value: stats.todayTestsCount,
      icon: Activity,
      desc: "النتائج المسجلة خلال الـ 24 ساعة الماضية",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      actionLabel: "إضافة نتيجة"
    },
    {
      title: "قوالب نشطة",
      value: stats.activeTemplatesCount,
      icon: FileText,
      desc: "قوالب الفحوصات الجاهزة للاستخدام",
      color: "text-purple-600 bg-purple-50 border-purple-100",
      actionLabel: "إدارة القوالب"
    },
    {
      title: "بنك الفحوصات المتاحة",
      value: stats.activeTestsCount,
      icon: Database,
      desc: "إجمالي التحاليل المبرمجة بالكامل",
      color: "text-amber-600 bg-amber-50 border-amber-100",
      actionLabel: "بنك الفحوصات"
    }
  ];

  return (
    <div id="dashboard-tab" className="space-y-8">
      {/* Welcome header */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 text-right">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">أهلاً بك في نظام مختبر ابن الهيثم <span className="text-sky-600 underline underline-offset-4 decoration-sky-600">2026</span></h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            يمكنك إنجاز مهامك المخبرية بسرعة ودقة فائقة. أضف نتائج جديدة، واطبع تقارير المرضى، أو أدر قوالب الفحوصات الطبية بضغطة زر.
          </p>
        </div>
        
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => onQuickAction("new-result")}
            className="px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-sky-600/10 hover:shadow-lg hover:shadow-sky-600/20 text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
          >
            <FilePlus className="h-4.5 w-4.5" />
            <span>تسجيل نتيجة جديدة</span>
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <div 
              key={idx} 
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-slate-500">{card.title}</span>
                  <div className={`p-2.5 rounded-xl border ${card.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black font-mono text-slate-900">{card.value}</h3>
                  <p className="text-2xs text-slate-400 font-medium leading-relaxed">{card.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Launch Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-sky-600" />
              <h3 className="text-base font-black text-slate-900">أحدث السجلات الطبية المحفوظة</h3>
            </div>
            <button 
              onClick={() => onQuickAction("records")} 
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
            >
              <span>عرض كل السجلات</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {recentRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FolderHeart className="h-12 w-12 text-slate-300 mx-auto" />
              <p className="text-xs font-bold">لا توجد سجلات محفوظة حتى الآن</p>
              <p className="text-2xs text-slate-400">انقر فوق "تسجيل نتيجة جديدة" في الأعلى للبدء</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <th className="p-3">اسم المريض</th>
                    <th className="p-3">رقم المعمل / التاريخ</th>
                    <th className="p-3">نوع التقرير / القالب</th>
                    <th className="p-3">الطبيب المعالج</th>
                    <th className="p-3 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {recentRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900">{record.patientName}</div>
                        <div className="text-2xs text-slate-400 mt-0.5">
                          {record.gender === "M" ? "ذكر" : "أنثى"} • {record.age} سنة
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-slate-900 font-bold">#{record.labNo}</div>
                        <div className="text-2xs font-mono text-slate-400 mt-0.5">{record.date}</div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-sky-50 text-sky-700 text-2xs font-bold border border-sky-100">
                          {record.templateName || "فحوصات مخصصة"}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">
                        {record.doctorName || "بدون طبيب معالج"}
                      </td>
                      <td className="p-3 text-left">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onEditRecord(record)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 rounded-lg transition-colors border border-slate-100 hover:border-sky-100 cursor-pointer"
                            title="تعديل السجل"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onPrintRecord(record)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 rounded-lg transition-colors border border-slate-100 hover:border-sky-100 cursor-pointer"
                            title="معاينة وطباعة التقرير"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box / Side Tips */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between border border-slate-800 relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent"></div>
          
          <div className="space-y-4 relative z-10">
            <div className="inline-flex p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h4 className="text-base font-black">إحصاءات ونشاطات اليوم</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              يوفر النظام تحليلاً وافياً ومباشراً للنشاطات المخبرية. جميع البيانات يتم حفظها تلقائياً بشكل آمن على مساحة التخزين المحلية لمتصفحك، مما يتيح لك الوصول الفوري لتقارير المرضى السابقة وتعديلها وطباعتها حتى في حال انقطاع خدمة الإنترنت.
            </p>
          </div>

          <div className="pt-8 relative z-10 border-t border-slate-800/80 mt-8">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">أقسام المختبر النشطة</h5>
            <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>أمراض الدم</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>الكيمياء الحيوية</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                <span>الهرمونات والغدد</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                <span>الأمصال والبول</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
