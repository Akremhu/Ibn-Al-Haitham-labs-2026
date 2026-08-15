import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Trash2, 
  Plus, 
  Edit, 
  X, 
  Save, 
  PlusCircle, 
  GripVertical,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { LabTemplate, LabTest } from "../types";

interface TemplateEditorProps {
  templates: LabTemplate[];
  testsBank: LabTest[];
  onAddTemplate: (template: LabTemplate) => void;
  onEditTemplate: (template: LabTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export default function TemplateEditor({ 
  templates, 
  testsBank, 
  onAddTemplate, 
  onEditTemplate, 
  onDeleteTemplate 
}: TemplateEditorProps) {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState<LabTemplate[]>([]);

  // Editor modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LabTemplate | null>(null);

  // Form fields
  const [templateId, setTemplateId] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [category, setCategory] = useState("general");
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([]);

  // Tests Search (within modal)
  const [testSearch, setTestSearch] = useState("");
  const [testSearchResults, setTestSearchResults] = useState<LabTest[]>([]);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTemplates(templates);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredTemplates(
        templates.filter(t => 
          t.nameEn.toLowerCase().includes(q) || 
          (t.nameAr && t.nameAr.includes(q))
        )
      );
    }
  }, [searchQuery, templates]);

  // Handle test search within modal
  useEffect(() => {
    if (!testSearch.trim()) {
      setTestSearchResults([]);
      return;
    }

    const q = testSearch.toLowerCase();
    const matches = testsBank.filter(test => {
      const alreadySelected = selectedTests.some(t => t.id === test.id);
      return (
        (test.nameEn.toLowerCase().includes(q) || 
        (test.nameAr && test.nameAr.includes(q))) && 
        !alreadySelected
      );
    });

    setTestSearchResults(matches.slice(0, 5));
  }, [testSearch, selectedTests, testsBank]);

  const openAddModal = () => {
    setEditingTemplate(null);
    setTemplateId("");
    setNameEn("");
    setNameAr("");
    setCategory("general");
    setSelectedTests([]);
    setTestSearch("");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (template: LabTemplate) => {
    setEditingTemplate(template);
    setTemplateId(template.id);
    setNameEn(template.nameEn);
    setNameAr(template.nameAr || "");
    setCategory(template.category);
    setSelectedTests(template.items);
    setTestSearch("");
    setError("");
    setIsModalOpen(true);
  };

  const handleAddTestToTemplate = (test: LabTest) => {
    setSelectedTests([...selectedTests, test]);
    setTestSearch("");
  };

  const handleRemoveTestFromTemplate = (testId: string) => {
    setSelectedTests(selectedTests.filter(t => t.id !== testId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nameEn.trim()) {
      setError("الرجاء إدخال اسم القالب بالإنجليزي.");
      return;
    }

    if (selectedTests.length === 0) {
      setError("الرجاء إضافة فحص واحد على الأقل لهذا القالب.");
      return;
    }

    const templateData: LabTemplate = {
      id: editingTemplate ? editingTemplate.id : (templateId.trim() || nameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")),
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim() || undefined,
      category,
      items: selectedTests
    };

    if (editingTemplate) {
      onEditTemplate(templateData);
      setSuccessMsg("تم تعديل هيكل القالب المخصص بنجاح.");
    } else {
      if (templates.some(t => t.id === templateData.id)) {
        setError("هذا الرمز أو معرّف القالب موجود بالفعل في النظام.");
        return;
      }
      onAddTemplate(templateData);
      setSuccessMsg("تم إنشاء القالب الطبي المخصص الجديد بنجاح.");
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل تريد بالتأكيد حذف هذا القالب نهائياً؟ لن يتم مسح الفحوصات الفردية من بنك الفحوصات.")) {
      onDeleteTemplate(id);
      setSuccessMsg("تم حذف القالب المخصص بنجاح.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div id="template-editor-tab" className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-right">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">محرر قوالب التقارير الطبية</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            تخصيص وترتيب الفحوصات المخبرية في مجموعات جاهزة مسبقاً لتسريع عملية إدخال نتائج المرضى
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-sky-600/10 hover:shadow-lg hover:shadow-sky-600/20 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>إضافة قالب طبي جديد</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-sky-50 border border-sky-150 text-sky-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3">
          <CheckCircle className="h-5 w-5 shrink-0 text-sky-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            id="template-search-field"
            type="text"
            placeholder="البحث عن قالب فحص جاهز..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white rounded-xl focus:outline-none text-xs sm:text-sm font-bold transition-all text-right"
          />
        </div>
      </div>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center text-slate-400 space-y-3 shadow-sm">
          <FileText className="h-16 w-16 text-slate-200 mx-auto" />
          <p className="text-base font-extrabold text-slate-800">لا توجد قوالب طبية تطابق بحثك</p>
          <p className="text-xs text-slate-400">جرب البحث بكلمات أخرى أو قم بإنشاء قالبك الطبي المخصص الأول</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map(template => (
            <div 
              key={template.id} 
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all text-right"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <span className="text-3xs font-mono text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">
                    ID: {template.id}
                  </span>
                  <span className="inline-flex px-2.5 py-1 bg-sky-50 text-sky-700 rounded-md text-3xs font-bold border border-sky-100/50">
                    {template.category === "hematology" ? "أمراض الدم" : 
                     template.category === "biochemistry" ? "الكيمياء الحيوية" :
                     template.category === "endocrinology" ? "الغدد والهرمونات" : "فحوصات عامة"}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900">{template.nameAr || template.nameEn}</h3>
                  <p className="text-2xs text-slate-400 font-mono font-bold">{template.nameEn}</p>
                </div>

                {/* Sub items tags list */}
                <div className="pt-2">
                  <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider mb-2">الفحوصات المدرجة ({template.items.length}):</p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                    {template.items.map(test => (
                      <span key={test.id} className="text-3xs font-bold bg-slate-50 border border-slate-150 rounded px-2 py-0.5 text-slate-600 font-mono">
                        {test.nameEn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="pt-5 border-t border-slate-50 mt-5 flex justify-end gap-2.5">
                <button
                  onClick={() => openEditModal(template)}
                  className="px-4 py-2 text-3xs bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-150 hover:border-sky-150 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>تعديل هيكل القالب</span>
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="px-4 py-2 text-3xs bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-150 hover:border-rose-150 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>حذف القالب</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Template Modal */}
      {isModalOpen && (
        <div id="template-form-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-100 shadow-2xl overflow-hidden text-right">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-black">
                {editingTemplate ? "تعديل محتويات قالب طبي" : "إنشاء قالب طبي مخصص جديد"}
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
                {/* ID - only for new */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600">رمز أو معرّف القالب الفريد (ID)</label>
                  <input
                    id="modal-template-id-field"
                    type="text"
                    required
                    disabled={editingTemplate !== null}
                    placeholder="مثال: cbc_panel أو thyroid_screen"
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, ""))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none rounded-lg text-xs font-mono font-bold transition-all text-right disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                {/* Name English */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">اسم القالب بالإنجليزي</label>
                  <input
                    id="modal-template-en-field"
                    type="text"
                    required
                    placeholder="مثال: Complete Blood Count"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none rounded-lg text-xs font-bold transition-all text-right"
                  />
                </div>

                {/* Name Arabic */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">اسم القالب بالعربي (اختياري)</label>
                  <input
                    id="modal-template-ar-field"
                    type="text"
                    placeholder="مثال: صورة الدم الكاملة"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none rounded-lg text-xs font-bold transition-all text-right"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600">التصنيف الطبي للقالب</label>
                  <select
                    id="modal-template-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none rounded-lg text-xs font-bold transition-all text-right cursor-pointer"
                  >
                    <option value="hematology">أمراض وصورة الدم (Hematology)</option>
                    <option value="biochemistry">الكيمياء الحيوية (Biochemistry)</option>
                    <option value="endocrinology">الهرمونات والغدد (Endocrinology)</option>
                    <option value="serology">الأمصال والمناعة (Serology)</option>
                    <option value="urinalysis">تحليل البول والبراز (Urine/Stool)</option>
                    <option value="general">فحوصات عامة (General Panels)</option>
                  </select>
                </div>
              </div>

              {/* Added Tests List */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-900">الفحوصات المدرجة في هذا القالب ({selectedTests.length})</label>
                
                {selectedTests.length === 0 ? (
                  <p className="text-3xs text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-lg">
                    القالب فارغ حالياً. يرجى البحث وإدراج الفحوصات الطبية أدناه.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50">
                    {selectedTests.map(test => (
                      <span 
                        key={test.id} 
                        className="inline-flex items-center gap-1.5 text-3xs font-bold bg-white border border-slate-200 rounded px-2 py-1 text-slate-700"
                      >
                        <span className="font-mono">{test.nameEn}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTestFromTemplate(test.id)}
                          className="text-slate-400 hover:text-red-600 cursor-pointer font-bold font-mono"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Search and add to template */}
              <div className="space-y-1.5 relative border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-600">البحث لإضافة فحوصات أخرى للقالب</label>
                <div className="relative">
                  <input
                    id="modal-test-search"
                    type="text"
                    placeholder="ابحث باسم التحليل لإدراجه في القالب..."
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none rounded-lg text-xs font-bold transition-all text-right"
                  />
                </div>

                {testSearchResults.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-150 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 font-bold text-2xs text-slate-700">
                    {testSearchResults.map(test => (
                      <button
                        key={test.id}
                        type="button"
                        onClick={() => handleAddTestToTemplate(test)}
                        className="w-full p-2.5 text-right hover:bg-sky-50/50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="font-mono">{test.nameEn}</span>
                        <PlusCircle className="h-4 w-4 text-sky-600" />
                      </button>
                    ))}
                  </div>
                )}
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
                    <span>حفظ القالب المخصص</span>
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
