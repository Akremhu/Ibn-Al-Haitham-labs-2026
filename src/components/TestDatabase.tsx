import React, { useState, useEffect } from "react";
import { 
  Database, 
  Search, 
  Trash2, 
  Plus, 
  Edit, 
  X, 
  Save, 
  RotateCcw, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { LabTest } from "../types";

interface TestDatabaseProps {
  testsBank: LabTest[];
  onAddTest: (test: LabTest) => void;
  onEditTest: (test: LabTest) => void;
  onDeleteTest: (id: string) => void;
  onResetToDefaults: () => void;
}

export default function TestDatabase({ 
  testsBank, 
  onAddTest, 
  onEditTest, 
  onDeleteTest,
  onResetToDefaults
}: TestDatabaseProps) {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredTests, setFilteredTests] = useState<LabTest[]>([]);

  // Modals / Editors state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);

  // Form states
  const [testId, setTestId] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [unit, setUnit] = useState("");
  const [refRangeM, setRefRangeM] = useState("");
  const [refRangeF, setRefRangeF] = useState("");
  const [category, setCategory] = useState("general");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const categories = [
    { id: "hematology", name: "أمراض وصورة الدم" },
    { id: "biochemistry", name: "الكيمياء الحيوية" },
    { id: "endocrinology", name: "الهرمونات والغدد" },
    { id: "serology", name: "المناعة والأمصال" },
    { id: "urinalysis", name: "تحليل البول" },
    { id: "general", name: "فحوصات عامة" }
  ];

  useEffect(() => {
    let result = testsBank;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(test => 
        test.nameEn.toLowerCase().includes(q) || 
        (test.nameAr && test.nameAr.includes(q)) ||
        test.id.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "") {
      result = result.filter(test => test.category === selectedCategory);
    }

    setFilteredTests(result);
  }, [searchQuery, selectedCategory, testsBank]);

  const openAddModal = () => {
    setEditingTest(null);
    setTestId("");
    setNameEn("");
    setNameAr("");
    setUnit("");
    setRefRangeM("");
    setRefRangeF("");
    setCategory("general");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (test: LabTest) => {
    setEditingTest(test);
    setTestId(test.id);
    setNameEn(test.nameEn);
    setNameAr(test.nameAr || "");
    setUnit(test.unit);
    setRefRangeM(test.refRangeM);
    setRefRangeF(test.refRangeF);
    setCategory(test.category || "general");
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nameEn.trim()) {
      setError("الرجاء إدخال اسم الفحص بالإنجليزي.");
      return;
    }

    const testData: LabTest = {
      id: editingTest ? editingTest.id : (testId.trim() || nameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")),
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim() || undefined,
      unit: unit.trim() || "-",
      refRangeM: refRangeM.trim() || "-",
      refRangeF: refRangeF.trim() || "-",
      category
    };

    if (editingTest) {
      onEditTest(testData);
      setSuccessMsg("تم تعديل بيانات الفحص في بنك الفحوصات بنجاح.");
    } else {
      // Check if ID already exists
      if (testsBank.some(t => t.id === testData.id)) {
        setError("رمز أو اسم هذا الفحص موجود بالفعل في بنك الفحوصات.");
        return;
      }
      onAddTest(testData);
      setSuccessMsg("تم إضافة الفحص الجديد بنجاح لبنك الفحوصات.");
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل تريد بالتأكيد حذف هذا الفحص نهائياً من قاعدة البيانات؟")) {
      onDeleteTest(id);
      setSuccessMsg("تم حذف الفحص نهائياً.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div id="test-database-tab" className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-right">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">بنك الفحوصات الطبية المتاحة</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            عرض وتعديل وإضافة الفحوصات المخبرية، والوحدات، والمعدلات الطبيعية لكل من الذكور والإناث بدقة متناهية
          </p>
        </div>
        
        <div className="flex gap-2.5">
          <button
            onClick={onResetToDefaults}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="استعادة كافة الفحوصات المرجعية والقوالب الأصلية للنظام"
          >
            <RotateCcw className="h-4 w-4" />
            <span>إعادة ضبط المصنع</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-sky-600/10 hover:shadow-lg hover:shadow-sky-600/20 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>إضافة فحص جديد</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-sky-50 border border-sky-150 text-sky-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3">
          <CheckCircle className="h-5 w-5 shrink-0 text-sky-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center shadow-sm">
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            id="test-bank-search-field"
            type="text"
            placeholder="ابحث باسم الفحص بالإنجليزي أو العربي للبدء بتعديله..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-xs sm:text-sm font-bold transition-all text-right"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            id="test-bank-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-xs sm:text-sm font-bold transition-all text-right cursor-pointer"
          >
            <option value="">جميع الأقسام والتصنيفات</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Database */}
      {filteredTests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center text-slate-400 space-y-3">
          <Database className="h-16 w-16 text-slate-200 mx-auto" />
          <p className="text-base font-extrabold text-slate-800">لم يتم العثور على أي فحص طبي</p>
          <p className="text-xs text-slate-400">جرب اسماً آخر أو أضف فحصاً جديداً لبنك الفحوصات</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <th className="p-4">رمز الفحص (ID)</th>
                  <th className="p-4">اسم الفحص (إنجليزي/عربي)</th>
                  <th className="p-4 text-center">الوحدة (Unit)</th>
                  <th className="p-4 text-center">معدل الذكور (Male)</th>
                  <th className="p-4 text-center">معدل الإناث (Female)</th>
                  <th className="p-4 text-center">التصنيف</th>
                  <th className="p-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/40 transition-all">
                    <td className="p-4 font-mono text-slate-500 text-3xs">{test.id}</td>
                    <td className="p-4">
                      <div className="text-slate-900 font-extrabold text-sm">{test.nameEn}</div>
                      {test.nameAr && <div className="text-[10px] text-slate-400 font-bold mt-1">{test.nameAr}</div>}
                    </td>
                    <td className="p-4 text-center font-mono text-slate-500">{test.unit}</td>
                    <td className="p-4 text-center font-mono text-slate-900 bg-blue-50/30">{test.refRangeM}</td>
                    <td className="p-4 text-center font-mono text-slate-900 bg-pink-50/30">{test.refRangeF}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-3xs">
                        {categories.find(c => c.id === test.category)?.name || "عام"}
                      </span>
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => openEditModal(test)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-100 rounded-lg transition-colors cursor-pointer"
                          title="تعديل هذا الفحص"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="حذف نهائي"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Test Modal */}
      {isModalOpen && (
        <div id="test-form-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden text-right">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-black">
                {editingTest ? "تعديل بيانات فحص طبي" : "إضافة فحص طبي جديد لبنك الفحوصات"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID - only for new tests */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600">رمز المعرّف الفريد للتحليل (ID)</label>
                  <input
                    id="modal-id-field"
                    type="text"
                    required
                    disabled={editingTest !== null}
                    placeholder="مثال: wbc أو hemoglobin"
                    value={testId}
                    onChange={(e) => setTestId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, ""))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none rounded-lg text-xs font-mono font-bold transition-all text-right disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                {/* Name English */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">اسم الفحص بالإنجليزي</label>
                  <input
                    id="modal-name-en-field"
                    type="text"
                    required
                    placeholder="مثال: WBC"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none rounded-lg text-xs font-bold transition-all text-right"
                  />
                </div>

                {/* Name Arabic */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">اسم الفحص بالعربي (اختياري)</label>
                  <input
                    id="modal-name-ar-field"
                    type="text"
                    placeholder="مثال: خلايا الدم البيضاء"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none rounded-lg text-xs font-bold transition-all text-right"
                  />
                </div>

                {/* Unit */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">الوحدة القياسية (Unit)</label>
                  <input
                    id="modal-unit-field"
                    type="text"
                    placeholder="مثال: g/dL أو Titer"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none rounded-lg text-xs font-mono transition-all text-right"
                  />
                </div>

                {/* Category selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">القسم / التصنيف الرئيسي</label>
                  <select
                    id="modal-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none rounded-lg text-xs font-bold transition-all text-right cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ref range Male */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">المعدل الطبيعي (للذكور)</label>
                  <input
                    id="modal-ref-m-field"
                    type="text"
                    placeholder="مثال: 13.5 - 17.5"
                    value={refRangeM}
                    onChange={(e) => setRefRangeM(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none rounded-lg text-xs font-mono transition-all text-right"
                  />
                </div>

                {/* Ref range Female */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">المعدل الطبيعي (للإناث)</label>
                  <input
                    id="modal-ref-f-field"
                    type="text"
                    placeholder="مثال: 12.0 - 15.5"
                    value={refRangeF}
                    onChange={(e) => setRefRangeF(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none rounded-lg text-xs font-mono transition-all text-right"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all text-xs cursor-pointer"
                >
                  تراجع وإلغاء
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-lg transition-all text-xs cursor-pointer shadow-md shadow-sky-600/10"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Save className="h-4 w-4" />
                    <span>حفظ التعديلات</span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
