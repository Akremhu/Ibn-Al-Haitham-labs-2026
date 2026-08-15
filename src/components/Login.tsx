import React, { useState } from "react";
import { Activity, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { api } from "../api";

interface LoginProps { onLoginSuccess: () => void; onBackToLanding: () => void; }

export default function Login({ onLoginSuccess, onBackToLanding }: LoginProps) {
  const [username,setUsername]=useState(""); const [password,setPassword]=useState("");
  const [error,setError]=useState(""); const [isLoading,setIsLoading]=useState(false);
  const handleSubmit=async(e:React.FormEvent)=>{e.preventDefault();setError("");if(!username.trim()||!password)return setError("الرجاء إدخال اسم المستخدم وكلمة المرور.");setIsLoading(true);try{const r=await api.login(username.trim(),password);sessionStorage.setItem("haitham_lab_token",r.token);sessionStorage.setItem("haitham_lab_session","active");onLoginSuccess();}catch(err:any){setError(err.message||"بيانات الدخول غير صحيحة");}finally{setIsLoading(false);}};
  return <div id="login-container" className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
    <div className="absolute top-4 right-4 sm:top-8 sm:right-8"><button onClick={onBackToLanding} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-slate-300"><ArrowRight className="h-4 w-4"/>العودة للرئيسية</button></div>
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4"><div className="inline-flex p-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-400"><Activity className="h-10 w-10"/></div><h2 className="text-2xl sm:text-3xl font-black text-white">نظام مختبر ابن الهيثم</h2><p className="text-xs sm:text-sm text-slate-400">بوابة الموظفين والوصول الآمن للنظام المركزي</p></div>
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"><div className="bg-slate-900/60 backdrop-blur-md py-8 px-4 shadow-2xl border border-white/10 rounded-2xl sm:px-10"><form className="space-y-6" onSubmit={handleSubmit}>
      {error&&<div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex gap-3"><AlertCircle className="h-5 w-5"/><span>{error}</span></div>}
      <div><label className="block text-sm font-bold text-slate-300">اسم المستخدم</label><div className="relative mt-1.5"><User className="absolute right-3 top-3 h-5 w-5 text-slate-500"/><input id="username-input" type="text" autoComplete="username" required value={username} onChange={e=>setUsername(e.target.value)} className="block w-full pr-10 pl-3 py-3 bg-slate-950/40 border border-white/10 rounded-xl text-white text-right"/></div></div>
      <div><label className="block text-sm font-bold text-slate-300">كلمة المرور</label><div className="relative mt-1.5"><Lock className="absolute right-3 top-3 h-5 w-5 text-slate-500"/><input id="password-input" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="block w-full pr-10 pl-3 py-3 bg-slate-950/40 border border-white/10 rounded-xl text-white text-right"/></div></div>
      <button id="login-submit-btn" type="submit" disabled={isLoading} className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl disabled:opacity-50">{isLoading?"جاري التحقق...":"دخول النظام"}</button>
    </form><div className="mt-6 border-t border-white/5 pt-5 text-center text-xs text-slate-500">يتم التحقق من الحساب عبر الخادم المركزي. لا توجد بيانات دخول افتراضية.</div></div></div>
  </div>;
}
