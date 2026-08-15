import React, { useState, useEffect } from "react";
import { 
  User, 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  Activity, 
  UserCheck, 
  Sparkles,
  ClipboardCheck,
  PlusCircle,
  FileSpreadsheet,
  Calendar,
  CheckSquare,
  Square,
  Layers,
  Check
} from "lucide-react";
import { LabTest, LabTemplate, PatientRecord, TestValue } from "../types";

interface NewResultFormProps {
  testsBank: LabTest[];
  templates: LabTemplate[];
  onSaveRecord: (record: PatientRecord) => void;
  onCancel: () => void;
  initialRecordToEdit?: PatientRecord | null;
}

export default function NewResultForm({ 
  testsBank, 
  templates, 
  onSaveRecord, 
  onCancel,
  initialRecordToEdit 
}: NewResultFormProps) {
  
  // Patient basic info state
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [orderNo, setOrderNo] = useState("");
  const [labNo, setLabNo] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [showDoctorsDropdown, setShowDoctorsDropdown] = useState(false);

  // Entered values for tests
  const [testValues, setTestValues] = useState<TestValue[]>([]);

  // Individual test search & select
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LabTest[]>([]);

  // Load record details if editing
  useEffect(() => {
    if (initialRecordToEdit) {
      setPatientName(initialRecordToEdit.patientName);
      setAge(initialRecordToEdit.age);
      setGender(initialRecordToEdit.gender);
      setOrderNo(initialRecordToEdit.orderNo || "");
      setLabNo(initialRecordToEdit.labNo);
      setDoctorName(initialRecordToEdit.doctorName);
      setNotes(initialRecordToEdit.notes || "");
      
      if (initialRecordToEdit.templateId) {
        const ids = initialRecordToEdit.templateId.split(',').map(s => s.trim()).filter(Boolean);
        setSelectedTemplateIds(ids);
      } else if (initialRecordToEdit.templateName) {
        const matched = templates.filter(t => 
          initialRecordToEdit.templateName?.includes(t.nameEn) || 
          (t.nameAr && initialRecordToEdit.templateName?.includes(t.nameAr))
        ).map(t => t.id);
        setSelectedTemplateIds(matched);
      } else {
        setSelectedTemplateIds([]);
      }

      setTestValues(initialRecordToEdit.results);
      setDate(initialRecordToEdit.date || new Date().toISOString().split('T')[0]);
    } else {
      // Auto-generate random Lab No and Order No for ease of entry
      const randomLab = Math.floor(1000 + Math.random() * 9000).toString();
      const randomOrder = Math.floor(100 + Math.random() * 900).toString();
      setLabNo(randomLab);
      setOrderNo(randomOrder);
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedTemplateIds([]);
    }
  }, [initialRecordToEdit]);

  // Handle multi-template toggling (select or deselect a template)
  const handleToggleTemplate = (templateId: string) => {
    if (!templateId) return;

    const isSelected = selectedTemplateIds.includes(templateId);
    const targetTemplate = templates.find(t => t.id === templateId);
    if (!targetTemplate) return;

    if (isSelected) {
      // DESELECTING TEMPLATE
      const nextTemplateIds = selectedTemplateIds.filter(id => id !== templateId);
      setSelectedTemplateIds(nextTemplateIds);

      // Find all test IDs belonging to remaining selected templates
      const remainingTemplates = templates.filter(t => nextTemplateIds.includes(t.id));
      const remainingTestIds = new Set<string>();
      remainingTemplates.forEach(t => {
        t.items.forEach(item => remainingTestIds.add(item.id));
      });

      const targetTemplateTestIds = new Set(targetTemplate.items.map(item => item.id));

      // Remove tests from targetTemplate UNLESS they are in remaining templates or have user-entered values
      const updatedTestValues = testValues.filter(tv => {
        const isInTarget = targetTemplateTestIds.has(tv.testId);
        if (!isInTarget) return true;
        if (remainingTestIds.has(tv.testId)) return true;
        if (tv.value && tv.value.trim() !== "") return true;
        return false;
      });

      setTestValues(updatedTestValues);
    } else {
      // SELECTING TEMPLATE
      const nextTemplateIds = [...selectedTemplateIds, templateId];
      setSelectedTemplateIds(nextTemplateIds);

      const existingTestIds = new Set(testValues.map(tv => tv.testId));
      const newItems: TestValue[] = [];

      targetTemplate.items.forEach(test => {
        if (!existingTestIds.has(test.id)) {
          const standardRefRange = gender === "M" ? test.refRangeM : test.refRangeF;
          newItems.push({
            testId: test.id,
            nameEn: test.nameEn,
            nameAr: test.nameAr,
            value: "",
            unit: test.unit,
            refRange: standardRefRange,
            flag: ""
          });
        }
      });

      setTestValues([...testValues, ...newItems]);
    }
  };

  // Helper to select all available templates at once
  const handleSelectAllTemplates = () => {
    const allIds = templates.map(t => t.id);
    setSelectedTemplateIds(allIds);

    const existingTestIds = new Set(testValues.map(tv => tv.testId));
    const newItems: TestValue[] = [];

    templates.forEach(template => {
      template.items.forEach(test => {
        if (!existingTestIds.has(test.id)) {
          existingTestIds.add(test.id);
          const standardRefRange = gender === "M" ? test.refRangeM : test.refRangeF;
          newItems.push({
            testId: test.id,
            nameEn: test.nameEn,
            nameAr: test.nameAr,
            value: "",
            unit: test.unit,
            refRange: standardRefRange,
            flag: ""
          });
        }
      });
    });

    setTestValues([...testValues, ...newItems]);
  };

  // Helper to clear all selected templates
  const handleClearAllTemplates = () => {
    setSelectedTemplateIds([]);
    const filledValues = testValues.filter(tv => tv.value && tv.value.trim() !== "");
    setTestValues(filledValues);
  };

  // Triggered when patient gender is toggled (re-calculate reference ranges in active tests)
  useEffect(() => {
    if (testValues.length === 0) return;

    const updated = testValues.map(tv => {
      // Look up original test in bank to get correct range for gender
      const originTest = testsBank.find(t => t.id === tv.testId);
      if (!originTest) return tv;

      const targetRange = gender === "M" ? originTest.refRangeM : originTest.refRangeF;
      const flagged = calculateFlag(tv.value, targetRange);
      return {
        ...tv,
        refRange: targetRange,
        flag: flagged
      };
    });
    setTestValues(updated);
  }, [gender]);

  // Function to dynamically calculate High/Low/Normal flags
  const calculateFlag = (valStr: string, refStr: string): 'normal' | 'high' | 'low' | 'abnormal' | '' => {
    if (!valStr.trim() || !refStr.trim()) return "";

    const val = parseFloat(valStr);
    
    // Check numeric values comparison (e.g. "70 - 100")
    if (!isNaN(val)) {
      const matchRange = refStr.match(/^([\d.]+)\s*-\s*([\d.]+)$/);
      if (matchRange) {
        const lower = parseFloat(matchRange[1]);
        const upper = parseFloat(matchRange[2]);
        if (val < lower) return "low";
        if (val > upper) return "high";
        return "normal";
      }

      // Check "< X" formats (e.g. "< 200" or "< 5")
      const matchLess = refStr.match(/^<\s*([\d.]+)$/);
      if (matchLess) {
        const limit = parseFloat(matchLess[1]);
        if (val >= limit) return "high";
        return "normal";
      }

      // Check "> X" formats (e.g. "> 40")
      const matchMore = refStr.match(/^>\s*([\d.]+)$/);
      if (matchMore) {
        const limit = parseFloat(matchMore[1]);
        if (val <= limit) return "low";
        return "normal";
      }
    }

    // Text-based abnormal matches (case insensitive check)
    const normText = refStr.trim().toLowerCase();
    const enteredText = valStr.trim().toLowerCase();

    if (normText === "negative" && enteredText === "positive") {
      return "abnormal";
    }
    if (normText === "nil" && enteredText !== "nil" && enteredText !== "negative" && enteredText !== "0" && enteredText !== "-") {
      return "abnormal";
    }
    
    return "normal";
  };

  // Update a single test result value
  const handleValueChange = (testId: string, value: string) => {
    const updated = testValues.map(tv => {
      if (tv.testId === testId) {
        const suggestedFlag = calculateFlag(value, tv.refRange);
        return {
          ...tv,
          value,
          flag: suggestedFlag
        };
      }
      return tv;
    });
    setTestValues(updated);
  };

  // Manually toggle or change flag
  const handleFlagChange = (testId: string, flag: 'normal' | 'high' | 'low' | 'abnormal' | '') => {
    const updated = testValues.map(tv => {
      if (tv.testId === testId) {
        return { ...tv, flag };
      }
      return tv;
    });
    setTestValues(updated);
  };

  // Search individual tests to add to report
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = testsBank.filter(test => {
      const q = searchQuery.toLowerCase();
      const inEn = test.nameEn.toLowerCase().includes(q);
      const inAr = test.nameAr ? test.nameAr.includes(q) : false;
      const inCat = test.category ? test.category.toLowerCase().includes(q) : false;
      
      // Filter out tests that are already in our testValues list
      const alreadyAdded = testValues.some(tv => tv.testId === test.id);
      
      return (inEn || inAr || inCat) && !alreadyAdded;
    });

    setSearchResults(filtered.slice(0, 10));
  }, [searchQuery, testValues]);

  // Add individual test to current report values
  const handleAddIndividualTest = (test: LabTest) => {
    const standardRefRange = gender === "M" ? test.refRangeM : test.refRangeF;
    const newTestValue: TestValue = {
      testId: test.id,
      nameEn: test.nameEn,
      nameAr: test.nameAr,
      value: "",
      unit: test.unit,
      refRange: standardRefRange,
      flag: ""
    };

    setTestValues([...testValues, newTestValue]);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Remove test from report
  const handleRemoveTest = (testId: string) => {
    setTestValues(testValues.filter(tv => tv.testId !== testId));
  };

  // Save the record
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) return;

    const computedTemplateId = selectedTemplateIds.join(",");

    const selectedNames = selectedTemplateIds
      .map(id => {
        const tpl = templates.find(t => t.id === id);
        return tpl ? (tpl.nameAr || tpl.nameEn) : "";
      })
      .filter(Boolean);

    const computedTemplateName = selectedNames.length > 0
      ? selectedNames.join(" + ")
      : "فحوصات مخصصة";

    const record: PatientRecord = {
      id: initialRecordToEdit ? initialRecordToEdit.id : Math.random().toString(36).substr(2, 9),
      patientName: patientName.trim(),
      age: age || "0",
      gender,
      date: date || new Date().toISOString().split('T')[0],
      orderNo: orderNo.trim() || "-",
      labNo: labNo.trim() || Math.floor(1000 + Math.random() * 9000).toString(),
      doctorName: doctorName.trim() || "Self-Referral",
      templateId: computedTemplateId || undefined,
      templateName: computedTemplateName,
      results: testValues,
      notes: notes.trim(),
      createdAt: initialRecordToEdit ? initialRecordToEdit.createdAt : new Date().toISOString()
    };

    onSaveRecord(record);
  };

  return (
    <div id="new-result-form-wrapper" className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {initialRecordToEdit ? "تعديل تقرير طبي محفوظ" : "تسجيل نتيجة فحص طبي جديدة"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {initialRecordToEdit 
              ? "تقوم الآن بتحديث البيانات الطبية وقيم التحاليل للمريض" 
              : "أدخل معلومات المريض الأساسية، ثم حدد القالب أو اختر الفحوصات لتسجيل النتائج"
            }
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
        >
          إلغاء وتراجع
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Step 1: Patient Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <User className="h-5 w-5 text-sky-600" />
            <h3 className="text-base font-black text-slate-900">البيانات الأساسية للمريض</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Patient Name */}
            <div className="space-y-1.5 font-sans">
              <label className="block text-xs font-bold text-slate-600">اسم المريض الكامل</label>
              <div className="relative">
                <input
                  id="patient-name-field"
                  type="text"
                  required
                  placeholder="أدخل اسم المريض الكامل"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-sm transition-all text-right font-extrabold"
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">العمر (بالسنوات)</label>
              <input
                id="patient-age-field"
                type="number"
                required
                min="0"
                max="120"
                placeholder="العمر"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-sm transition-all text-right font-bold"
              />
            </div>

            {/* Gender Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">الجنس / النوع</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender("M")}
                  className={`py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                    gender === "M"
                      ? "bg-sky-600 text-white border-transparent shadow-xs"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  ذكر (Male)
                </button>
                <button
                  type="button"
                  onClick={() => setGender("F")}
                  className={`py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                    gender === "F"
                      ? "bg-sky-600 text-white border-transparent shadow-xs"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  أنثى (Female)
                </button>
              </div>
            </div>

            {/* Lab No */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">رقم المعمل / المختبر</label>
              <input
                id="patient-labno-field"
                type="text"
                required
                placeholder="رقم المعمل"
                value={labNo}
                onChange={(e) => setLabNo(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-sm font-mono font-bold transition-all text-right"
              />
            </div>

            {/* Order No */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">رقم الطلب / الفاتورة</label>
              <input
                id="patient-orderno-field"
                type="text"
                placeholder="رقم الطلب (اختياري)"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-sm font-mono font-bold transition-all text-right"
              />
            </div>

            {/* Report Date */}
            <div className="space-y-1.5 font-sans">
              <label className="block text-xs font-bold text-slate-600 flex items-center gap-1.5 justify-end">
                <span>تاريخ التقرير / Report Date</span>
                <Calendar className="h-4 w-4 text-sky-600" />
              </label>
              <input
                id="patient-date-field"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-sm transition-all text-right font-bold"
              />
            </div>

            {/* Doctor Name */}
            <div className="space-y-1.5 relative">
              <label className="block text-xs font-bold text-slate-600 flex justify-between items-center">
                <span>الطبيب المعالج / Referral Doctor</span>
              </label>
              <div className="relative">
                <input
                  id="patient-doctor-field"
                  type="text"
                  placeholder="اسم الطبيب المعالج..."
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-sm transition-all text-right font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowDoctorsDropdown(!showDoctorsDropdown)}
                  className="absolute left-0 top-0 bottom-0 px-3 bg-sky-50 hover:bg-sky-100 border-r border-slate-200 text-sky-600 rounded-l-xl transition-colors flex items-center justify-center cursor-pointer"
                  title="اختر طبيباً من القائمة"
                >
                  <UserCheck className="h-4 w-4" />
                </button>
              </div>

              {/* Doctors List Dropdown */}
              {showDoctorsDropdown && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-150 font-bold text-xs text-slate-700">
                  {[
                    "Dr. Ali Al-Hashimi",
                    "Dr. Fatima Saleh",
                    "Dr. Mohammed Hussein",
                    "Dr. Najeeb Saeed",
                    "Self-Referral"
                  ].map((doc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDoctorName(doc);
                        setShowDoctorsDropdown(false);
                      }}
                      className="w-full p-2.5 text-left hover:bg-sky-50/50 flex items-center justify-between cursor-pointer group transition-colors animate-fade-in"
                    >
                      <span className="text-slate-900 group-hover:text-sky-700 font-sans font-bold">{doc}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {doc === "Self-Referral" ? "مريض ذاتي" : "استشاري"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Choose Template and Add Tests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-sky-600" />
              <h3 className="text-base font-black text-slate-900">اختيار قوالب الفحوصات (اختيار متعدد)</h3>
            </div>
            
            <div className="flex items-center gap-2">
              {templates.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSelectAllTemplates}
                    className="text-3xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    تحديد جميع القوالب
                  </button>
                  {selectedTemplateIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllTemplates}
                      className="text-3xs font-bold bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      إلغاء تحديد القوالب
                    </button>
                  )}
                </div>
              )}

              {testValues.length > 0 && (
                <span className="text-xs bg-sky-50 border border-sky-100 text-sky-700 px-2.5 py-1 rounded-md font-bold">
                  تم تحديد {selectedTemplateIds.length} قوالب ({testValues.length} فحصاً)
                </span>
              )}
            </div>
          </div>

          {/* Multi-Template Choice Grid */}
          {templates.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600">
                اختر القوالب الطبية المطلوبة للتقرير (يمكنك تحديد أكثر من قالب معاً):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {templates.map(template => {
                  const isSelected = selectedTemplateIds.includes(template.id);
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleToggleTemplate(template.id)}
                      className={`p-3 rounded-xl border text-right transition-all flex items-start gap-3 cursor-pointer group ${
                        isSelected
                          ? "bg-sky-50/80 border-sky-500 ring-1 ring-sky-500 text-sky-950 shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-sky-600" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="font-extrabold text-xs leading-snug truncate">
                          {template.nameAr || template.nameEn}
                        </div>
                        {template.nameAr && (
                          <div className="text-[10px] text-slate-400 font-sans font-medium truncate">
                            {template.nameEn}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? "bg-sky-200/60 text-sky-800" : "bg-slate-200/60 text-slate-600"
                          }`}>
                            {template.items.length} فحوصات
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-2 border-t border-slate-100">
            {/* Template Dropdown Quick Selector */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="block text-xs font-bold text-slate-600">قائمة القوالب الطبية</label>
              <select
                id="template-select"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleToggleTemplate(e.target.value);
                  }
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-sm font-bold transition-all text-right cursor-pointer"
              >
                <option value="">-- اضغط لتحديد / لإلغاء قالب --</option>
                {templates.map(template => {
                  const isSelected = selectedTemplateIds.includes(template.id);
                  return (
                    <option key={template.id} value={template.id}>
                      {isSelected ? "✓ " : ""}{template.nameAr || template.nameEn} ({template.items.length} فحص)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Test Search Input */}
            <div className="space-y-1.5 md:col-span-2 relative">
              <label className="block text-xs font-bold text-slate-600">البحث في بنك الفحوصات وإضافة فحص فردي</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <input
                  id="test-search-field"
                  type="text"
                  placeholder="ابحث باسم الفحص الإنجليزي أو العربي لإضافته فورياً..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-sm transition-all text-right font-bold"
                />
              </div>

              {/* Search results dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-150 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 font-bold text-xs text-slate-700">
                  {searchResults.map(test => (
                    <button
                      key={test.id}
                      type="button"
                      onClick={() => handleAddIndividualTest(test)}
                      className="w-full p-3 text-right hover:bg-sky-50/50 flex items-center justify-between cursor-pointer group transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="text-slate-900 group-hover:text-sky-700">{test.nameEn}</div>
                        {test.nameAr && <div className="text-[10px] text-slate-400">{test.nameAr}</div>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                          {test.category || "عام"}
                        </span>
                        <PlusCircle className="h-4.5 w-4.5 text-sky-600" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Test Results Inputs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-sky-600" />
              <h3 className="text-base font-black text-slate-900">إدخال نتائج التحاليل الطبية</h3>
            </div>
            
            <div className="flex items-center gap-1 text-2xs text-slate-400 font-bold">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              <span>يقوم النظام باحتساب مؤشر القيمة (عالي/منخفض) تلقائياً</span>
            </div>
          </div>

          {testValues.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-xl">
              <ClipboardCheck className="h-12 w-12 text-slate-300 mx-auto" />
              <p className="text-xs font-bold">لم يتم إضافة أي فحوصات للتقرير بعد</p>
              <p className="text-2xs text-slate-400">اختر قالباً جاهزاً أو ابحث في بنك الفحوصات في الأعلى للبدء بالتحرير</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table header */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 text-right">
                <div className="col-span-4">اسم الفحص / Test Name</div>
                <div className="col-span-3 text-center">النتيجة / Result</div>
                <div className="col-span-2 text-center">المعدل الطبيعي</div>
                <div className="col-span-1 text-center">الوحدة</div>
                <div className="col-span-1 text-center">المؤشر</div>
                <div className="col-span-1 text-center">إجراء</div>
              </div>

              {/* Table items */}
              <div className="space-y-3.5">
                {testValues.map((tv, idx) => {
                  const hasFlag = tv.flag && tv.flag !== "normal" && tv.flag !== "";
                  return (
                    <div 
                      key={tv.testId} 
                      className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 items-center text-right"
                    >
                      {/* Name */}
                      <div className="col-span-1 lg:col-span-4 space-y-0.5">
                        <span className="lg:hidden block text-2xs text-slate-400 font-bold mb-1">اسم الفحص</span>
                        <div className="text-slate-900 font-extrabold text-sm">{tv.nameEn}</div>
                        {tv.nameAr && <div className="text-2xs text-slate-400 font-bold">{tv.nameAr}</div>}
                      </div>

                      {/* Result input */}
                      <div className="col-span-1 lg:col-span-3 text-center">
                        <span className="lg:hidden block text-2xs text-slate-400 font-bold mb-1">النتيجة</span>
                        <input
                          id={`result-val-field-${tv.testId}`}
                          type="text"
                          required
                          placeholder="أدخل القيمة"
                          value={tv.value}
                          onChange={(e) => handleValueChange(tv.testId, e.target.value)}
                          className={`w-full max-w-xs mx-auto px-3.5 py-2.5 bg-white border rounded-lg focus:ring-2 focus:outline-none text-center font-black font-mono transition-all ${
                            hasFlag
                              ? "border-red-200 text-red-700 bg-red-50 focus:ring-red-500 focus:border-red-500"
                              : "border-slate-200 text-slate-900 focus:ring-sky-500 focus:border-sky-500"
                          }`}
                        />
                      </div>

                      {/* Reference range */}
                      <div className="col-span-1 lg:col-span-2 text-center">
                        <span className="lg:hidden block text-2xs text-slate-400 font-bold mb-1">المعدل الطبيعي</span>
                        <span className="font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded text-2xs font-bold">
                          {tv.refRange}
                        </span>
                      </div>

                      {/* Unit */}
                      <div className="col-span-1 lg:col-span-1 text-center">
                        <span className="lg:hidden block text-2xs text-slate-400 font-bold mb-1">الوحدة</span>
                        <span className="font-mono text-slate-500 text-2xs">{tv.unit}</span>
                      </div>

                      {/* Flag dropdown */}
                      <div className="col-span-1 lg:col-span-1 text-center">
                        <span className="lg:hidden block text-2xs text-slate-400 font-bold mb-1">المؤشر</span>
                        <select
                          id={`flag-suggest-field-${tv.testId}`}
                          value={tv.flag}
                          onChange={(e) => handleFlagChange(tv.testId, e.target.value as any)}
                          className={`px-1.5 py-1.5 rounded-md text-3xs font-extrabold text-center border focus:outline-none cursor-pointer ${
                            tv.flag === "high" ? "bg-red-50 text-red-700 border-red-200" :
                            tv.flag === "low" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            tv.flag === "abnormal" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-white text-slate-400 border-slate-200"
                          }`}
                        >
                          <option value="">طبيعي</option>
                          <option value="high">عالي H</option>
                          <option value="low">منخفض L</option>
                          <option value="abnormal">مضطرب</option>
                        </select>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 lg:col-span-1 text-center lg:text-left">
                        <button
                          type="button"
                          onClick={() => handleRemoveTest(tv.testId)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                          title="حذف الفحص من هذا التقرير"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Report comments & Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">ملاحظات وتعليقات التقرير (اختياري)</h3>
          </div>
          <textarea
            id="report-notes-field"
            rows={3}
            placeholder="أدخل أية ملاحظات إضافية، تعليقات، أو توصيات سيتم طباعتها وتصديرها أسفل التقرير الطبي مباشرة..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-xs sm:text-sm transition-all text-right font-semibold leading-relaxed"
          />
        </div>

        {/* Form Submit Action Row */}
        <div className="flex justify-end gap-3.5 no-print">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-extrabold text-sm transition-all cursor-pointer"
          >
            إلغاء التراجع
          </button>
          
          <button
            id="save-report-submit-btn"
            type="submit"
            disabled={testValues.length === 0}
            className="px-8 py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl font-extrabold text-sm transition-all shadow-md shadow-sky-600/10 hover:shadow-lg hover:shadow-sky-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Save className="h-4.5 w-4.5" />
            <span>حفظ ومعاينة التقرير الطبي</span>
          </button>
        </div>
      </form>
    </div>
  );
}
