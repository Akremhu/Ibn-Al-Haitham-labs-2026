import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Clock, 
  MapPin, 
  Shield, 
  Users, 
  ClipboardList, 
  HeartPulse, 
  Calendar, 
  PhoneCall, 
  KeyRound,
  Stethoscope,
  Scissors,
  Baby,
  Pill,
  Heart
} from "lucide-react";

interface LandingPageProps {
  onEnterSystem: () => void;
}

export default function LandingPage({ onEnterSystem }: LandingPageProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("ar-YE", { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const clinics = [
    {
      id: "pediatrics",
      title: "عيادة الأطفال",
      desc: "رعاية صحية متكاملة لحديثي الولادة والأطفال بمعايير عالمية",
      icon: Baby,
      color: "from-sky-500 to-indigo-500"
    },
    {
      id: "internal",
      title: "الباطنية والقلب",
      desc: "تشخيص وعلاج الأمراض الباطنية المزمنة والحادة بأحدث الأجهزة",
      icon: Heart,
      color: "from-rose-500 to-red-500"
    },
    {
      id: "surgery",
      title: "الجراحة العامة",
      desc: "عمليات جراحية صغرى وكبرى تحت إشراف نخبة من الاستشاريين",
      icon: Scissors,
      color: "from-amber-500 to-orange-500"
    },
    {
      id: "obgyn",
      title: "النساء والولادة",
      desc: "متابعة الحمل، الولادة الآمنة، وعلاج الأمراض النسائية والتجميلية",
      icon: Stethoscope,
      color: "from-pink-500 to-purple-500"
    },
    {
      id: "lab",
      title: "المختبرات الطبية",
      desc: "أدق التحاليل المخبرية المبرمجة آلياً لضمان نتائج سريعة وموثوقة",
      icon: Activity,
      color: "from-sky-500 to-cyan-500"
    },
    {
      id: "pharmacy",
      title: "الصيدلية",
      desc: "توفر كافة الأدوية والمستلزمات الطبية على مدار الساعة",
      icon: Pill,
      color: "from-cyan-500 to-blue-500"
    }
  ];

  return (
    <div id="landing-page" className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Bar */}
      <header id="top-bar" className="bg-white border-b border-slate-100 shadow-xs sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-100 shadow-xs">
              <Activity className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">مركز ابن الهيثم الطبي</h1>
              <p className="text-xs text-sky-600 font-bold tracking-widest">قسم المختبرات والتشخيص</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="h-4.5 w-4.5 text-sky-500" />
              <span className="text-xs font-mono">{time}</span>
              <span className="text-xs font-medium">| 24 ساعة يومياً</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="h-4.5 w-4.5 text-sky-500" />
              <span className="text-xs font-medium">خط صعدة - توضع</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="enter-system-btn"
              onClick={onEnterSystem}
              className="px-5 py-2.5 bg-sky-600 text-white rounded-xl font-bold shadow-md shadow-sky-600/10 hover:bg-sky-700 transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              <KeyRound className="h-4 w-4" />
              <span>بوابة الموظفين</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero-section" className="relative py-16 sm:py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-600/10 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 font-bold text-xs sm:text-sm">
              <Shield className="h-4 w-4" />
              <span>الرعاية الطبية الموثوقة والتشخيص الدقيق</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white">
              صحتك وعائلتك في <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-sky-400 to-cyan-300">أيدٍ أمينة وخبرة عالية</span>
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              نجمع بين أفضل الأطباء الاستشاريين وأحدث التقنيات الطبية المخبرية لنقدم لك رعاية طبية شاملة، عيادات تخصصية متكاملة، ومختبرات فائقة الدقة لضمان تشخيصك الصحيح وسعادتك اليومية.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={onEnterSystem}
                className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
              >
                <Activity className="h-5 w-5" />
                <span>نتائج المختبر وبوابة الموظفين</span>
              </button>
              <a 
                href="#clinics-section"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span>التعرف على العيادات</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-gradient-to-br from-sky-500/20 to-cyan-500/20 rounded-full p-2 animate-pulse">
              <div className="w-full h-full bg-slate-900/80 rounded-full border border-sky-500/30 flex flex-col items-center justify-center text-center p-6 space-y-3 shadow-2xl">
                <HeartPulse className="h-16 w-16 text-sky-400" />
                <h3 className="text-xl font-bold">مختبر ابن الهيثم</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  دقة، سرعة، وموثوقية في تقارير الفحوصات المخبرية بفضل أحدث أجهزة التحليل المبرمجة آلياً.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Stats Row */}
      <section id="stats-section" className="bg-white border-b border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center space-y-1 border-r border-slate-100 last:border-0">
            <h4 className="text-3xl sm:text-4xl font-extrabold text-sky-600 font-mono">15+</h4>
            <p className="text-xs sm:text-sm font-bold text-slate-500">سنوات الخبرة الطبية</p>
          </div>
          <div className="text-center space-y-1 border-r border-slate-100 last:border-0">
            <h4 className="text-3xl sm:text-4xl font-extrabold text-sky-600 font-mono">20K+</h4>
            <p className="text-xs sm:text-sm font-bold text-slate-500">مريض سعيد ومستفيد</p>
          </div>
          <div className="text-center space-y-1 border-r border-slate-100 last:border-0">
            <h4 className="text-3xl sm:text-4xl font-extrabold text-sky-600 font-mono">45+</h4>
            <p className="text-xs sm:text-sm font-bold text-slate-500">كادر طبي وإداري استشاري</p>
          </div>
          <div className="text-center space-y-1">
            <h4 className="text-3xl sm:text-4xl font-extrabold text-sky-600 font-mono">100+</h4>
            <p className="text-xs sm:text-sm font-bold text-slate-500">فحص مخبري يومي مبرمج</p>
          </div>
        </div>
      </section>

      {/* Clinics / Services Section */}
      <section id="clinics-section" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">عياداتنا وخدماتنا الطبية</h3>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
              تم تجهيز أقسامنا وعياداتنا التخصصية بأحدث المستلزمات الطبية المتطورة لضمان تقديم رعاية ممتازة وتشخيص متميز لك ولعائلتك.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map((clinic) => {
              const IconComponent = clinic.icon;
              return (
                <div 
                  key={clinic.id} 
                  className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all group flex flex-col text-right justify-between"
                >
                  <div className="space-y-4">
                    <div className={`p-3 bg-gradient-to-br ${clinic.color} text-white rounded-xl w-fit shadow-md shadow-slate-100`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{clinic.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{clinic.desc}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-50 mt-6 flex items-center justify-between text-xs font-bold text-sky-600 hover:text-sky-700">
                    <span>عرض المزيد من التفاصيل</span>
                    <span>←</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Location & Working Hours */}
      <section id="location-section" className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">ساعات العمل وموقعنا</h3>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              يسعدنا استقبالكم وتقديم الخدمات الطبية والصحية والعناية المركزة في أي وقت لراحة صحتكم.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">ساعات استقبال الطوارئ والمختبر</h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">نستقبلكم على مدار 24 ساعة طيلة أيام الأسبوع</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">موقع المركز</h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">اليمن - صعدة - خط صعدة الرئيسي (توضع / Al-Tawda')</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">أرقام التواصل</h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-mono">طوارئ وعناية: +967 77X-XXX-XXX</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100 space-y-4 shadow-xs text-center">
            <Calendar className="h-12 w-12 text-sky-600 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900">طوارئ ومختبر متكامل</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              نحن نعمل على توفير طاقم استشاري مناوب وأحدث التجهيزات والتحاليل الطبية المخبرية المبرمجة لضمان استجابة سريعة لجميع الحالات الحرجة.
            </p>
            <div className="pt-2">
              <button 
                onClick={onEnterSystem}
                className="px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold transition-all text-sm cursor-pointer"
              >
                بوابة الموظفين الإدارية
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-slate-900 text-slate-400 py-12 mt-auto text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white">
              <Activity className="h-6 w-6 text-sky-400" />
              <span className="text-lg font-black tracking-tight">مركز ابن الهيثم الطبي</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed mx-auto md:mx-0">
              تقديم الرعاية الطبية الشاملة الموثوقة برعاية طاقم طبي مناوب وأحدث التجهيزات والتقنيات المخبرية.
            </p>
          </div>

          <div className="space-y-4 text-center">
            <h4 className="text-white font-bold">روابط سريعة</h4>
            <div className="flex flex-col gap-2 text-xs">
              <a href="#hero-section" className="hover:text-sky-400 transition-colors">الرئيسية</a>
              <a href="#clinics-section" className="hover:text-sky-400 transition-colors">عياداتنا الطبية</a>
              <a href="#location-section" className="hover:text-sky-400 transition-colors">ساعات العمل وموقعنا</a>
            </div>
          </div>

          <div className="space-y-4 text-center md:text-left font-mono text-xs">
            <h4 className="text-white font-bold font-sans">تواصل معنا</h4>
            <p>الهاتف: 77XXXXXXX</p>
            <p>البريد: info@haitham-center.com</p>
            <p className="font-sans">اليمن - صعدة</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} مختبرات ابن الهيثم الطبية. جميع الحقوق محفوظة.</p>
          <p className="font-mono">نظام الإدارة الموحد v2026.3.0</p>
        </div>
      </footer>
    </div>
  );
}
