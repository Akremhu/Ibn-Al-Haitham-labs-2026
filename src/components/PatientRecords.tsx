import React, { useState, useEffect } from "react";
import { 
  FolderHeart, 
  Search, 
  Trash2, 
  Printer, 
  FileEdit, 
  Calendar, 
  User, 
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft
} from "lucide-react";
import { PatientRecord } from "../types";

interface PatientRecordsProps {
  records: PatientRecord[];
  onPrintRecord: (record: PatientRecord) => void;
  onBatchPrint: (records: PatientRecord[]) => void;
  onEditRecord: (record: PatientRecord) => void;
  onDeleteRecord: (id: string) => void;
  onQuickAction: (tab: string) => void;
}

export default function PatientRecords({ 
  records, 
  onPrintRecord, 
  onBatchPrint,
  onEditRecord, 
  onDeleteRecord,
  onQuickAction
}: PatientRecordsProps) {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState("");
  const [filteredRecords, setFilteredRecords] = useState<PatientRecord[]>([]);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);

  // Extract unique template names in saved records for filtering
  const uniqueTemplates = Array.from(new Set(records.map(r => r.templateName).filter(Boolean)));

  // Clear selections when records or filters change
  useEffect(() => {
    setSelectedRecordIds([]);
  }, [records, searchQuery, selectedTemplateFilter]);

  const handleSelectRow = (id: string) => {
    setSelectedRecordIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecordIds.length === filteredRecords.length) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(filteredRecords.map(r => r.id));
    }
  };

  useEffect(() => {
    let result = records;

    // Filter by search query (patient name or lab number)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.patientName.toLowerCase().includes(q) || 
        r.labNo.includes(q) ||
        (r.doctorName && r.doctorName.toLowerCase().includes(q))
      );
    }

    // Filter by template / category
    if (selectedTemplateFilter !== "") {
      result = result.filter(r => r.templateName === selectedTemplateFilter);
    }

    // Sort by descending date / createdAt
    result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    setFilteredRecords(result);
  }, [searchQuery, selectedTemplateFilter, records]);

  const confirmDelete = (id: string) => {
    setRecordToDelete(id);
  };

  const handleExecuteDelete = () => {
    if (recordToDelete) {
      onDeleteRecord(recordToDelete);
      setRecordToDelete(null);
    }
  };

  return (
    <div id="patient-records-tab" className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-right">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">سجلات المرضى السابقة</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            تصفح، ابحث، واطبع تقارير الفحوصات المخبرية المحفوظة مسبقاً لجميع المرضى بسهولة تامة
          </p>
        </div>
        
        <button
          onClick={() => onQuickAction("new-result")}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-sky-600/10 hover:shadow-lg hover:shadow-sky-600/20 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
        >
          <span>تسجيل فحص جديد</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center shadow-sm">
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            id="records-search-field"
            type="text"
            placeholder="ابحث باسم المريض، رقم المعمل، أو الطبيب المعالج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-xs sm:text-sm font-bold transition-all text-right"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            id="records-filter-select"
            value={selectedTemplateFilter}
            onChange={(e) => setSelectedTemplateFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-xs sm:text-sm font-bold transition-all text-right cursor-pointer"
          >
            <option value="">جميع القوالب والتصنيفات</option>
            {uniqueTemplates.map((name, idx) => (
              <option key={idx} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List / Table */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center text-slate-400 space-y-4">
          <FolderHeart className="h-16 w-16 text-slate-200 mx-auto" />
          <div className="space-y-1">
            <p className="text-base font-extrabold text-slate-800">لم يتم العثور على أي سجلات طبية</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              تأكد من كتابة اسم المريض بشكل صحيح، أو ابدأ بتسجيل نتيجة فحص طبي جديدة للمرضى لتبدأ السجلات بالظهور.
            </p>
          </div>
          {(searchQuery !== "" || selectedTemplateFilter !== "") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTemplateFilter("");
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-all cursor-pointer"
            >
              مسح الفلاتر وإعادة التعيين
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-slate-400">العدد الإجمالي للمطابقات: {filteredRecords.length} مريض</span>
              {selectedRecordIds.length > 0 && (
                <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-[10px] font-extrabold animate-fade-in flex items-center gap-1">
                  <span>تم تحديد {selectedRecordIds.length} سجل</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {selectedRecordIds.length > 0 && (
                <button
                  onClick={() => {
                    const selectedRecords = records.filter(r => selectedRecordIds.includes(r.id));
                    onBatchPrint(selectedRecords);
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-sky-600/10 hover:shadow-lg flex items-center gap-1.5 cursor-pointer text-xs animate-fade-in"
                >
                  <Printer className="h-4 w-4" />
                  <span>طباعة الدفعة المحددة ({selectedRecordIds.length}) / Batch Print</span>
                </button>
              )}
              <span className="text-slate-400 font-normal">ترتيب تلقائي: الأحدث أولاً</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100/55 text-slate-500 font-bold border-b border-slate-100">
                  <th className="p-4 text-center w-12">
                    <input
                      type="checkbox"
                      checked={selectedRecordIds.length === filteredRecords.length && filteredRecords.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">اسم المريض الكامل</th>
                  <th className="p-4 text-center">رقم المعمل / المختبر</th>
                  <th className="p-4 text-center">تاريخ التسجيل</th>
                  <th className="p-4 text-center">عدد التحاليل والنتائج</th>
                  <th className="p-4 text-center">نوع القالب المستخدم</th>
                  <th className="p-4">الطبيب المحيل</th>
                  <th className="p-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {filteredRecords.map((record) => {
                  const isChecked = selectedRecordIds.includes(record.id);
                  return (
                    <tr key={record.id} className={`hover:bg-slate-50/40 transition-all ${isChecked ? "bg-sky-50/25" : ""}`}>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(record.id)}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="text-slate-900 font-black text-sm">{record.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1">
                          {record.gender === "M" ? "ذكر (Male)" : "أنثى (Female)"} • {record.age} سنة
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-mono bg-slate-100 text-slate-900 px-2.5 py-1 rounded-md text-xs font-black">
                          #{record.labNo}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono text-slate-500 font-bold">{record.date}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 text-3xs font-mono">
                          {record.results.length} فحصاً
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-3xs border border-sky-100">
                          {record.templateName || "فحوصات مخصصة"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {record.doctorName || "بدون طبيب"}
                      </td>
                      <td className="p-4 text-left">
                        <div className="flex justify-end gap-2.5">
                          {/* Print */}
                          <button
                            onClick={() => onPrintRecord(record)}
                            className="p-2 text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 rounded-xl transition-all border border-slate-100 hover:border-sky-100 cursor-pointer"
                            title="معاينة وطباعة التقرير"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          
                          {/* Edit */}
                          <button
                            onClick={() => onEditRecord(record)}
                            className="p-2 text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 rounded-xl transition-all border border-slate-100 hover:border-sky-100 cursor-pointer"
                            title="تعديل بيانات السجل"
                          >
                            <FileEdit className="h-4 w-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => confirmDelete(record.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition-all border border-slate-100 hover:border-rose-100 cursor-pointer"
                            title="حذف نهائي"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete !== null && (
        <div id="delete-confirm-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 p-6 space-y-6 shadow-2xl">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">هل تريد بالتأكيد حذف هذا السجل نهائياً؟</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-medium">
                بمجرد تأكيد الإجراء، سيتم مسح بيانات المريض ونتائج فحوصاته بالكامل من مساحة العمل بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRecordToDelete(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-xs cursor-pointer"
              >
                تراجع وإلغاء
              </button>
              <button
                onClick={handleExecuteDelete}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl transition-all text-xs cursor-pointer shadow-md shadow-rose-600/10"
              >
                نعم، احذف السجل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
