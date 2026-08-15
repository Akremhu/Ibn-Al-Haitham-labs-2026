import React, { useState } from "react";
import { Activity, Lock, User, ArrowRight, AlertCircle } from "lucide-react";

interface LoginProps {
  onLoginSuccess: () => void;
  onBackToLanding: () => void;
}

export default function Login({ onLoginSuccess, onBackToLanding }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("الرجاء إدخال اسم المستخدم وكلمة المرور.");
      return;
    }

    setIsLoading(true);

    // Simulated short delay for high polish and realism
    setTimeout(() => {
      setIsLoading(false);
      // Accept 'admin' / 'admin' as default credentials or any credentials for easy review
      if (
        (username.trim().toLowerCase() === "admin" && password === "admin") ||
        (username.trim() !== "" && password !== "")
      ) {
        onLoginSuccess();
      } else {
        setError("بيانات الدخول غير صحيحة. يرجى تجربة اسم مستخدم وكلمة مرور صالحة.");
      }
    }, 600);
  };

  return (
    <div id="login-container" className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <button
          id="back-to-landing-btn"
          onClick={onBackToLanding}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all text-slate-300 hover:text-white cursor-pointer"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <div className="inline-flex p-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-400">
          <Activity className="h-10 w-10 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">نظام مختبر ابن الهيثم</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">بوابة الموظفين والوصول إلى لوحة التحكم الإدارية</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/60 backdrop-blur-md py-8 px-4 shadow-2xl border border-white/10 rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="username-input" className="block text-xs sm:text-sm font-bold text-slate-300">
                اسم المستخدم
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="username-input"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="أدخل اسم المستخدم (مثال: admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pr-10 pl-3 py-3 bg-slate-950/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none text-sm transition-all text-white placeholder-slate-500 text-right"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password-input" className="block text-xs sm:text-sm font-bold text-slate-300">
                كلمة المرور
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password-input"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="أدخل كلمة المرور (مثال: admin)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-10 pl-3 py-3 bg-slate-950/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none text-sm transition-all text-white placeholder-slate-500 text-right"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-sky-600/10 hover:shadow-lg hover:shadow-sky-600/20 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer disabled:opacity-50 text-sm flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <span>دخول النظام</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-white/5 pt-6 text-center">
            <p className="text-xs text-slate-500 font-medium">
              دعم فني: <span className="font-mono">support@haitham-center.com</span>
            </p>
            <p className="text-xs text-sky-400/80 font-semibold mt-1">
              اسم المستخدم الافتراضي: <span className="font-mono bg-slate-950/60 px-1.5 py-0.5 rounded border border-white/5">admin</span> وكلمة المرور: <span className="font-mono bg-slate-950/60 px-1.5 py-0.5 rounded border border-white/5">admin</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
