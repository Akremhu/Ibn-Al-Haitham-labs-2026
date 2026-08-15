import React,{useEffect,useState} from "react";
import {Menu} from "lucide-react";
import LandingPage from "./components/LandingPage"; import Login from "./components/Login"; import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard"; import NewResultForm from "./components/NewResultForm"; import PatientRecords from "./components/PatientRecords";
import TestDatabase from "./components/TestDatabase"; import TemplateEditor from "./components/TemplateEditor"; import PrintableReport from "./components/PrintableReport";
import {DEFAULT_TESTS,DEFAULT_TEMPLATES} from "./data"; import {PatientRecord,LabTest,LabTemplate,AppStats} from "./types"; import {api,clearToken,getToken} from "./api";

export default function App(){
 const [viewMode,setViewMode]=useState<"landing"|"login"|"staff-portal"|"print-preview">("landing"); const [activeTab,setActiveTab]=useState("dashboard"); const [isLoggedIn,setIsLoggedIn]=useState(false);
 const [isSidebarCollapsed,setIsSidebarCollapsed]=useState(false),[isSidebarHidden,setIsSidebarHidden]=useState(false),[isMobileSidebarOpen,setIsMobileSidebarOpen]=useState(false);
 const [records,setRecords]=useState<PatientRecord[]>([]),[testsBank,setTestsBank]=useState<LabTest[]>([]),[templates,setTemplates]=useState<LabTemplate[]>([]);
 const [selectedRecordForPrint,setSelectedRecordForPrint]=useState<PatientRecord|null>(null),[recordsForPrint,setRecordsForPrint]=useState<PatientRecord[]>([]),[recordToEdit,setRecordToEdit]=useState<PatientRecord|null>(null);
 const [stats,setStats]=useState<AppStats>({todayTestsCount:0,totalRecordsCount:0,activeTemplatesCount:0,activeTestsCount:0});
 const loadCentral=async()=>{try{const [r,t,p]=await Promise.all([api.records(),api.tests(),api.templates()]);setRecords(r);setTestsBank(t.length?t:DEFAULT_TESTS);setTemplates(p.length?p:DEFAULT_TEMPLATES);}catch(e){console.error(e);if(!getToken())return;alert("تعذر الاتصال بالخادم المركزي. تحقق من الاتصال بالإنترنت.");}};
 useEffect(()=>{if(getToken()){setIsLoggedIn(true);setViewMode("staff-portal");loadCentral();}},[]);
 useEffect(()=>{const today=new Date().toISOString().slice(0,10);setStats({todayTestsCount:records.filter(r=>String(r.date).slice(0,10)===today).length,totalRecordsCount:records.length,activeTemplatesCount:templates.length,activeTestsCount:testsBank.length});},[records,testsBank,templates]);
 const handleLoginSuccess=()=>{setIsLoggedIn(true);setViewMode("staff-portal");setActiveTab("dashboard");loadCentral();};
 const handleLogout=()=>{clearToken();setIsLoggedIn(false);setViewMode("landing");setRecords([]);};
 const handleSaveRecord=async(r:PatientRecord)=>{try{const exists=records.some(x=>x.id===r.id);const saved=exists?await api.updateRecord(r.id,r):await api.createRecord(r);setRecords(prev=>exists?prev.map(x=>x.id===r.id?{...r,...saved}:x):[{...r,...saved},...prev]);setRecordToEdit(null);setSelectedRecordForPrint({...r,...saved});setRecordsForPrint([{...r,...saved}]);setViewMode("print-preview");}catch(e:any){alert(e.message||"تعذر حفظ السجل");}};
 const handleDeleteRecord=async(id:string)=>{if(!confirm("سيتم إلغاء السجل وليس حذفه نهائيًا. هل تريد المتابعة؟"))return;const reason=prompt("سبب الإلغاء:");if(!reason)return;try{await api.voidRecord(id,reason);setRecords(x=>x.filter(r=>r.id!==id));}catch(e:any){alert(e.message);}};
 const handleTriggerEditRecord=(r:PatientRecord)=>{setRecordToEdit(r);setActiveTab("new-result");}; const handleTriggerPrintRecord=(r:PatientRecord)=>{setSelectedRecordForPrint(r);setRecordsForPrint([r]);setViewMode("print-preview");};
 const handleTriggerBatchPrintRecords=(rs:PatientRecord[])=>{setSelectedRecordForPrint(null);setRecordsForPrint(rs);setViewMode("print-preview");};
 const handleAddTest=async(t:LabTest)=>{try{await api.addTest(t);setTestsBank(x=>[...x,t]);}catch(e:any){alert(e.message);}};
 const handleEditTest=(t:LabTest)=>setTestsBank(x=>x.map(a=>a.id===t.id?t:a));
 const handleDeleteTest=(id:string)=>setTestsBank(x=>x.filter(t=>t.id!==id));
 const handleAddTemplate=(t:LabTemplate)=>setTemplates(x=>[...x,t]); const handleEditTemplate=(t:LabTemplate)=>setTemplates(x=>x.map(a=>a.id===t.id?t:a)); const handleDeleteTemplate=(id:string)=>setTemplates(x=>x.filter(t=>t.id!==id));
 const handleResetToDefaults=()=>{if(confirm("استعادة القوائم الافتراضية محليًا؟ لا تحذف بيانات المرضى من الخادم.")){setTestsBank(DEFAULT_TESTS);setTemplates(DEFAULT_TEMPLATES);}};
 const backPrint=()=>{setViewMode("staff-portal");setSelectedRecordForPrint(null);setRecordsForPrint([]);if(activeTab==="dashboard")setActiveTab("records");};
 return <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col" dir="rtl">
 {viewMode==="landing"&&<LandingPage onEnterSystem={()=>setViewMode("login")}/>} {viewMode==="login"&&<Login onLoginSuccess={handleLoginSuccess} onBackToLanding={()=>setViewMode("landing")}/>} 
 {viewMode==="print-preview"&&(selectedRecordForPrint||recordsForPrint.length>0)&&<div className="print-preview-parent p-4 sm:p-8 max-w-5xl mx-auto w-full"><PrintableReport record={selectedRecordForPrint||undefined} records={recordsForPrint.length?recordsForPrint:undefined} templates={templates} onBack={backPrint}/></div>}
 {viewMode==="staff-portal"&&isLoggedIn&&<div className="flex h-screen overflow-hidden relative">{isMobileSidebarOpen&&<div className="fixed inset-0 bg-slate-950/60 z-40 md:hidden" onClick={()=>setIsMobileSidebarOpen(false)}/>}<Sidebar activeTab={activeTab} setActiveTab={t=>{setActiveTab(t);if(t!=="new-result")setRecordToEdit(null)}} onLogout={handleLogout} statsCount={{todayTestsCount:stats.todayTestsCount,totalRecordsCount:stats.totalRecordsCount}} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} isHidden={isSidebarHidden}/>
 <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50"><header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0"><div className="flex items-center gap-3"><button onClick={()=>window.innerWidth<768?setIsMobileSidebarOpen(!isMobileSidebarOpen):setIsSidebarHidden(!isSidebarHidden)} className="p-2 hover:bg-slate-100 rounded-xl"><Menu className="h-5 w-5"/></button><div><h1 className="text-sm md:text-base font-black text-slate-900">{activeTab==="dashboard"?"لوحة التحكم الرئيسية":activeTab==="new-result"?(recordToEdit?"تعديل نتيجة طبية":"تسجيل نتيجة جديدة"):activeTab==="records"?"السجلات الطبية والنتائج":activeTab==="test-database"?"قاعدة بيانات الفحوصات الطبية":"إدارة القوالب"}</h1><p className="text-[10px] text-slate-400 font-bold">النظام المركزي — البيانات محفوظة على الخادم</p></div></div><span className="bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg text-xs font-bold">مسجل اليوم: {stats.todayTestsCount}</span></header>
 <div className="flex-1 overflow-y-auto p-6 md:p-8"><div className="max-w-7xl mx-auto space-y-8">
 {activeTab==="dashboard"&&<Dashboard stats={stats} recentRecords={records.slice(0,5)} onQuickAction={t=>{setActiveTab(t);setRecordToEdit(null)}} onPrintRecord={handleTriggerPrintRecord} onEditRecord={handleTriggerEditRecord}/>} 
 {activeTab==="new-result"&&<NewResultForm testsBank={testsBank} templates={templates} onSaveRecord={handleSaveRecord} onCancel={()=>{setActiveTab("dashboard");setRecordToEdit(null)}} initialRecordToEdit={recordToEdit}/>} 
 {activeTab==="records"&&<PatientRecords records={records} onPrintRecord={handleTriggerPrintRecord} onBatchPrint={handleTriggerBatchPrintRecords} onEditRecord={handleTriggerEditRecord} onDeleteRecord={handleDeleteRecord} onQuickAction={t=>{setActiveTab(t);setRecordToEdit(null)}}/>}
 {activeTab==="test-database"&&<TestDatabase testsBank={testsBank} onAddTest={handleAddTest} onEditTest={handleEditTest} onDeleteTest={handleDeleteTest} onResetToDefaults={handleResetToDefaults}/>} 
 {activeTab==="template-editor"&&<TemplateEditor templates={templates} testsBank={testsBank} onAddTemplate={handleAddTemplate} onEditTemplate={handleEditTemplate} onDeleteTemplate={handleDeleteTemplate}/>} 
 </div></div></main></div>}
 </div>;
}
