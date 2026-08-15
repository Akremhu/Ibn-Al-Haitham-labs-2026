import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import NewResultForm from "./components/NewResultForm";
import PatientRecords from "./components/PatientRecords";
import TestDatabase from "./components/TestDatabase";
import TemplateEditor from "./components/TemplateEditor";
import PrintableReport from "./components/PrintableReport";

import { DEFAULT_TESTS, DEFAULT_TEMPLATES } from "./data";
import { PatientRecord, LabTest, LabTemplate, AppStats } from "./types";

export default function App() {
  // Navigation & authentication state
  const [viewMode, setViewMode] = useState<"landing" | "login" | "staff-portal" | "print-preview">("landing");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Database / State items
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [testsBank, setTestsBank] = useState<LabTest[]>([]);
  const [templates, setTemplates] = useState<LabTemplate[]>([]);

  // Focus states
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<PatientRecord | null>(null);
  const [recordsForPrint, setRecordsForPrint] = useState<PatientRecord[]>([]);
  const [recordToEdit, setRecordToEdit] = useState<PatientRecord | null>(null);

  // App Stats summary
  const [stats, setStats] = useState<AppStats>({
    todayTestsCount: 0,
    totalRecordsCount: 0,
    activeTemplatesCount: 0,
    activeTestsCount: 0
  });

  // 1. Initial State Loading & Defaults Seeding
  useEffect(() => {
    // Check local storage for existing records
    try {
      const savedRecordsStr = localStorage.getItem("haitham_lab_records");
      if (savedRecordsStr) {
        setRecords(JSON.parse(savedRecordsStr));
      } else {
        setRecords([]);
      }
    } catch (e) {
      console.error("Error reading saved records", e);
      setRecords([]);
    }

    // Check local storage for test database bank
    try {
      const savedTestsStr = localStorage.getItem("haitham_lab_tests_bank");
      if (savedTestsStr) {
        setTestsBank(JSON.parse(savedTestsStr));
      } else {
        localStorage.setItem("haitham_lab_tests_bank", JSON.stringify(DEFAULT_TESTS));
        setTestsBank(DEFAULT_TESTS);
      }
    } catch (e) {
      console.error("Error reading saved tests bank", e);
      setTestsBank(DEFAULT_TESTS);
    }

    // Check local storage for templates
    try {
      const savedTemplatesStr = localStorage.getItem("haitham_lab_templates");
      if (savedTemplatesStr) {
        setTemplates(JSON.parse(savedTemplatesStr));
      } else {
        localStorage.setItem("haitham_lab_templates", JSON.stringify(DEFAULT_TEMPLATES));
        setTemplates(DEFAULT_TEMPLATES);
      }
    } catch (e) {
      console.error("Error reading saved templates", e);
      setTemplates(DEFAULT_TEMPLATES);
    }

    // Check existing login session
    const sessionActive = sessionStorage.getItem("haitham_lab_session") === "active";
    if (sessionActive) {
      setIsLoggedIn(true);
      setViewMode("staff-portal");
    }
  }, []);

  // 2. Local Storage Sync & Stats calculation
  useEffect(() => {
    // Re-calculate statistics whenever any database changes
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = records.filter(r => r.date === todayStr).length;

    setStats({
      todayTestsCount: todayCount,
      totalRecordsCount: records.length,
      activeTemplatesCount: templates.length,
      activeTestsCount: testsBank.length
    });
  }, [records, testsBank, templates]);

  // Handle saving records to local storage helper
  const syncRecordsToStorage = (updatedRecords: PatientRecord[]) => {
    setRecords(updatedRecords);
    localStorage.setItem("haitham_lab_records", JSON.stringify(updatedRecords));
  };

  const syncTestsToStorage = (updatedTests: LabTest[]) => {
    setTestsBank(updatedTests);
    localStorage.setItem("haitham_lab_tests_bank", JSON.stringify(updatedTests));
  };

  const syncTemplatesToStorage = (updatedTemplates: LabTemplate[]) => {
    setTemplates(updatedTemplates);
    localStorage.setItem("haitham_lab_templates", JSON.stringify(updatedTemplates));
  };

  // 3. System Actions
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem("haitham_lab_session", "active");
    setViewMode("staff-portal");
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("haitham_lab_session");
    setViewMode("landing");
  };

  // Record actions
  const handleSaveRecord = (newRecord: PatientRecord) => {
    const exists = records.some(r => r.id === newRecord.id);
    let updated: PatientRecord[];
    
    if (exists) {
      // Modify existing
      updated = records.map(r => r.id === newRecord.id ? newRecord : r);
    } else {
      // Insert new
      updated = [newRecord, ...records];
    }
    
    syncRecordsToStorage(updated);
    setRecordToEdit(null);
    setSelectedRecordForPrint(newRecord);
    setViewMode("print-preview");
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    syncRecordsToStorage(updated);
  };

  const handleTriggerEditRecord = (record: PatientRecord) => {
    setRecordToEdit(record);
    setActiveTab("new-result");
  };

  const handleTriggerPrintRecord = (record: PatientRecord) => {
    setSelectedRecordForPrint(record);
    setRecordsForPrint([record]);
    setViewMode("print-preview");
  };

  const handleTriggerBatchPrintRecords = (selectedRecords: PatientRecord[]) => {
    setSelectedRecordForPrint(null);
    setRecordsForPrint(selectedRecords);
    setViewMode("print-preview");
  };

  // Test Bank actions
  const handleAddTest = (newTest: LabTest) => {
    const updated = [...testsBank, newTest];
    syncTestsToStorage(updated);
  };

  const handleEditTest = (updatedTest: LabTest) => {
    const updated = testsBank.map(t => t.id === updatedTest.id ? updatedTest : t);
    syncTestsToStorage(updated);
  };

  const handleDeleteTest = (id: string) => {
    const updated = testsBank.filter(t => t.id !== id);
    syncTestsToStorage(updated);
  };

  // Templates actions
  const handleAddTemplate = (newTemplate: LabTemplate) => {
    const updated = [...templates, newTemplate];
    syncTemplatesToStorage(updated);
  };

  const handleEditTemplate = (updatedTemplate: LabTemplate) => {
    const updated = templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t);
    syncTemplatesToStorage(updated);
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    syncTemplatesToStorage(updated);
  };

  // Global reset defaults
  const handleResetToDefaults = () => {
    if (window.confirm("تحذير: هل أنت متأكد من رغبتك في استعادة ضبط المصنع؟ سيؤدي ذلك لمسح كافة الفحوصات المضافة وتعديلات القوالب واسترجاع القوائم الافتراضية الأصلية للنظام.")) {
      localStorage.setItem("haitham_lab_tests_bank", JSON.stringify(DEFAULT_TESTS));
      localStorage.setItem("haitham_lab_templates", JSON.stringify(DEFAULT_TEMPLATES));
      setTestsBank(DEFAULT_TESTS);
      setTemplates(DEFAULT_TEMPLATES);
      alert("تمت استعادة التهيئة الأصلية لجدول الفحوصات والقوالب بنجاح.");
    }
  };

  // Navigating back from printing preview
  const handleBackFromPrint = () => {
    setViewMode("staff-portal");
    setSelectedRecordForPrint(null);
    setRecordsForPrint([]);
    // Return to the records tab as fallback
    if (activeTab === "dashboard") {
      setActiveTab("records");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col" dir="rtl">
      
      {/* 1. Public Landing Page View */}
      {viewMode === "landing" && (
        <LandingPage onEnterSystem={() => setViewMode("login")} />
      )}

      {/* 2. Login Page View */}
      {viewMode === "login" && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onBackToLanding={() => setViewMode("landing")} 
        />
      )}

      {/* 3. Printable Report Full-Screen View */}
      {viewMode === "print-preview" && (selectedRecordForPrint || recordsForPrint.length > 0) && (
        <div className="print-preview-parent p-4 sm:p-8 max-w-5xl mx-auto w-full">
          <PrintableReport 
            record={selectedRecordForPrint || undefined} 
            records={recordsForPrint.length > 0 ? recordsForPrint : undefined}
            templates={templates}
            onBack={handleBackFromPrint} 
          />
        </div>
      )}

      {/* 4. Staff Portal Dashboard Workspace */}
      {viewMode === "staff-portal" && isLoggedIn && (
        <div className="flex h-screen overflow-hidden relative">
          
          {/* Mobile sidebar overlay */}
          {isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-slate-950/60 z-40 md:hidden no-print transition-opacity duration-300"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Sidebar Left Navigation Panel */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(tab) => {
              setActiveTab(tab);
              // Clean any editing states when switching tabs
              if (tab !== "new-result") {
                setRecordToEdit(null);
              }
            }} 
            onLogout={handleLogout}
            statsCount={{
              todayTestsCount: stats.todayTestsCount,
              totalRecordsCount: stats.totalRecordsCount
            }}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
            isHidden={isSidebarHidden}
          />

          {/* Main workspace container */}
          <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
            {/* Top Workspace Navigation Bar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between no-print shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setIsMobileSidebarOpen(!isMobileSidebarOpen);
                    } else {
                      setIsSidebarHidden(!isSidebarHidden);
                    }
                  }}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 focus:outline-none cursor-pointer"
                  title="التحكم بالقائمة الجانبية"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex flex-col">
                  <h1 className="text-sm md:text-base font-black text-slate-900 leading-tight">
                    {activeTab === "dashboard" && "لوحة التحكم الرئيسية"}
                    {activeTab === "new-result" && (recordToEdit ? "تعديل نتيجة طبية" : "تسجيل نتيجة جديدة")}
                    {activeTab === "records" && "السجلات الطبية والنتائج"}
                    {activeTab === "test-database" && "قاعدة بيانات الفحوصات الطبية"}
                    {activeTab === "template-editor" && "إدارة وتعديل القوالب"}
                  </h1>
                  <p className="text-[10px] text-slate-400 font-bold">نظام مركز ابن الهيثم الطبي</p>
                </div>
              </div>

              {/* Quick status & current date info */}
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                <span className="hidden sm:inline bg-slate-100 px-3 py-1.5 rounded-lg">
                  اليوم: {new Date().toLocaleDateString("ar-YE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping"></span>
                  مسجل اليوم: {stats.todayTestsCount}
                </span>
              </div>
            </header>

            {/* Scrollable Workspace Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Tab selector content rendering */}
                {activeTab === "dashboard" && (
                  <Dashboard 
                    stats={stats} 
                    recentRecords={records.slice(0, 5)} 
                    onQuickAction={(tab) => {
                      setActiveTab(tab);
                      setRecordToEdit(null);
                    }}
                    onPrintRecord={handleTriggerPrintRecord}
                    onEditRecord={handleTriggerEditRecord}
                  />
                )}

                {activeTab === "new-result" && (
                  <NewResultForm 
                    testsBank={testsBank} 
                    templates={templates} 
                    onSaveRecord={handleSaveRecord}
                    onCancel={() => {
                      setActiveTab("dashboard");
                      setRecordToEdit(null);
                    }}
                    initialRecordToEdit={recordToEdit}
                  />
                )}

                {activeTab === "records" && (
                  <PatientRecords 
                    records={records} 
                    onPrintRecord={handleTriggerPrintRecord}
                    onBatchPrint={handleTriggerBatchPrintRecords}
                    onEditRecord={handleTriggerEditRecord}
                    onDeleteRecord={handleDeleteRecord}
                    onQuickAction={(tab) => {
                      setActiveTab(tab);
                      setRecordToEdit(null);
                    }}
                  />
                )}

                {activeTab === "test-database" && (
                  <TestDatabase 
                    testsBank={testsBank} 
                    onAddTest={handleAddTest}
                    onEditTest={handleEditTest}
                    onDeleteTest={handleDeleteTest}
                    onResetToDefaults={handleResetToDefaults}
                  />
                )}

                {activeTab === "template-editor" && (
                  <TemplateEditor 
                    templates={templates} 
                    testsBank={testsBank} 
                    onAddTemplate={handleAddTemplate}
                    onEditTemplate={handleEditTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                  />
                )}

              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
