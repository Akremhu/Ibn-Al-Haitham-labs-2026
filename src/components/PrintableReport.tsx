import React from "react";
import { PatientRecord, LabTemplate } from "../types";
import { DEFAULT_TEMPLATES } from "../data";
import { Activity, Printer, Download } from "lucide-react";

interface PrintableReportProps {
  record?: PatientRecord;
  records?: PatientRecord[];
  templates?: LabTemplate[];
  onBack: () => void;
  onDownloadPdf?: () => void;
}

// Helper to expand a single PatientRecord with multiple templates into separate single-template records (one per page)
function expandRecordToTemplatePages(rec: PatientRecord, allTemplates: LabTemplate[]): PatientRecord[] {
  if (!rec.results || rec.results.length === 0) return [rec];

  let rawIds: string[] = [];
  if (rec.templateId) {
    rawIds = rec.templateId.split(",").map(s => s.trim()).filter(Boolean);
  }

  // Case 1: Multiple template IDs saved in templateId
  if (rawIds.length > 1) {
    const pages: PatientRecord[] = [];
    const usedTestIndexes = new Set<number>();

    for (const tId of rawIds) {
      const tpl = allTemplates.find(t => t.id === tId);
      if (!tpl) continue;

      const tplItemIds = new Set(tpl.items.map(i => i.id));
      const tplItemNames = new Set(tpl.items.map(i => i.id.toLowerCase()));
      const tplItemEnNames = new Set(tpl.items.map(i => i.nameEn.toLowerCase()));

      const matchingResults: typeof rec.results = [];
      rec.results.forEach((res, idx) => {
        if (
          tplItemIds.has(res.testId) || 
          tplItemNames.has(res.testId.toLowerCase()) || 
          tplItemEnNames.has(res.nameEn.toLowerCase())
        ) {
          matchingResults.push(res);
          usedTestIndexes.add(idx);
        }
      });

      if (matchingResults.length > 0) {
        pages.push({
          ...rec,
          id: `${rec.id}-${tId}`,
          templateId: tpl.id,
          templateName: tpl.nameAr || tpl.nameEn,
          results: matchingResults
        });
      }
    }

    const leftoverResults = rec.results.filter((_, idx) => !usedTestIndexes.has(idx));
    if (leftoverResults.length > 0) {
      pages.push({
        ...rec,
        id: `${rec.id}-other`,
        templateId: "other",
        templateName: "فحوصات إضافية / OTHER TESTS",
        results: leftoverResults
      });
    }

    if (pages.length > 0) return pages;
  }

  // Case 2: templateName contains " + "
  if (rec.templateName && rec.templateName.includes(" + ")) {
    const parts = rec.templateName.split(" + ").map(s => s.trim());
    const matchedTemplates: LabTemplate[] = [];

    for (const part of parts) {
      const found = allTemplates.find(t => 
        (t.nameAr && t.nameAr.trim() === part) || 
        (t.nameEn && t.nameEn.trim() === part) ||
        (t.nameAr && part.includes(t.nameAr)) ||
        (t.nameEn && part.includes(t.nameEn))
      );
      if (found && !matchedTemplates.some(m => m.id === found.id)) {
        matchedTemplates.push(found);
      }
    }

    if (matchedTemplates.length > 1) {
      const pages: PatientRecord[] = [];
      const usedTestIndexes = new Set<number>();

      for (const tpl of matchedTemplates) {
        const tplItemIds = new Set(tpl.items.map(i => i.id));
        const tplItemNames = new Set(tpl.items.map(i => i.nameEn.toLowerCase()));

        const matchingResults: typeof rec.results = [];
        rec.results.forEach((res, idx) => {
          if (tplItemIds.has(res.testId) || tplItemNames.has(res.nameEn.toLowerCase())) {
            matchingResults.push(res);
            usedTestIndexes.add(idx);
          }
        });

        if (matchingResults.length > 0) {
          pages.push({
            ...rec,
            id: `${rec.id}-${tpl.id}`,
            templateId: tpl.id,
            templateName: tpl.nameAr || tpl.nameEn,
            results: matchingResults
          });
        }
      }

      const leftoverResults = rec.results.filter((_, idx) => !usedTestIndexes.has(idx));
      if (leftoverResults.length > 0) {
        pages.push({
          ...rec,
          id: `${rec.id}-other`,
          templateId: "other",
          templateName: "فحوصات إضافية / OTHER TESTS",
          results: leftoverResults
        });
      }

      if (pages.length > 0) return pages;
    }
  }

  // Case 3: Check if tests match 2 or more distinct templates in allTemplates
  const matchedTpls: { tpl: LabTemplate; indexes: number[] }[] = [];
  allTemplates.forEach(tpl => {
    const tplItemIds = new Set(tpl.items.map(i => i.id));
    const tplItemNames = new Set(tpl.items.map(i => i.nameEn.toLowerCase()));

    const indexes: number[] = [];
    rec.results.forEach((res, idx) => {
      if (tplItemIds.has(res.testId) || tplItemNames.has(res.nameEn.toLowerCase())) {
        indexes.push(idx);
      }
    });

    if (indexes.length > 0) {
      matchedTpls.push({ tpl, indexes });
    }
  });

  if (matchedTpls.length > 1) {
    const pages: PatientRecord[] = [];
    const usedTestIndexes = new Set<number>();

    for (const { tpl, indexes } of matchedTpls) {
      const unassignedIndexes = indexes.filter(i => !usedTestIndexes.has(i));
      if (unassignedIndexes.length > 0) {
        unassignedIndexes.forEach(i => usedTestIndexes.add(i));
        const matchingResults = unassignedIndexes.map(i => rec.results[i]);
        pages.push({
          ...rec,
          id: `${rec.id}-${tpl.id}`,
          templateId: tpl.id,
          templateName: tpl.nameAr || tpl.nameEn,
          results: matchingResults
        });
      }
    }

    const leftoverResults = rec.results.filter((_, idx) => !usedTestIndexes.has(idx));
    if (leftoverResults.length > 0) {
      pages.push({
        ...rec,
        id: `${rec.id}-other`,
        templateId: "other",
        templateName: "فحوصات إضافية / OTHER TESTS",
        results: leftoverResults
      });
    }

    if (pages.length > 1) return pages;
  }

  // Default: Return single-page record
  return [rec];
}

export default function PrintableReport({ record, records, templates: propsTemplates, onBack, onDownloadPdf }: PrintableReportProps) {
  // Load templates list
  const activeTemplates = React.useMemo(() => {
    if (propsTemplates && propsTemplates.length > 0) return propsTemplates;
    try {
      const saved = localStorage.getItem("haitham_lab_templates");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_TEMPLATES;
  }, [propsTemplates]);

  // Expand records so each record with multiple templates becomes separate single-template report pages
  const expandedRecordsList = React.useMemo(() => {
    const rawList = records && records.length > 0 ? records : (record ? [record] : []);
    const expanded: PatientRecord[] = [];
    rawList.forEach(rec => {
      const pages = expandRecordToTemplatePages(rec, activeTemplates);
      expanded.push(...pages);
    });
    return expanded;
  }, [record, records, activeTemplates]);

  const handlePrint = () => {
    window.print();
  };

  const formatEnglishDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        const options: Intl.DateTimeFormatOptions = { 
          year: 'numeric', 
          month: 'short', 
          day: '2-digit' 
        };
        return dateObj.toLocaleDateString('en-US', options); // e.g. "Jul 10, 2026"
      }
    } catch (e) {
      // fallback
    }
    return dateStr; // fallback if parsing fails
  };

  const downloadPDF = () => {
    if (onDownloadPdf) {
      onDownloadPdf();
      return;
    }

    // Use html2pdf if loaded via CDN
    const html2pdf = (window as any).html2pdf;
    if (html2pdf) {
      const element = document.getElementById("pdf-unscaled-export-container");
      if (element) {
        const filename = expandedRecordsList.length === 1 
          ? `Haitham_Lab_${expandedRecordsList[0].patientName.replace(/\s+/g, "_")}_${expandedRecordsList[0].labNo}.pdf`
          : `Haitham_Lab_Batch_${new Date().toISOString().slice(0, 10)}.pdf`;

        const opt = {
          margin:       0, // 0 margin to ensure perfect 1:1 matching on A4
          filename:     filename,
          image:        { type: "jpeg", quality: 0.98 },
          html2canvas:  { 
            scale: 2.5, // slightly higher scale for ultra-crisp results
            useCORS: true, 
            letterRendering: true,
            windowWidth: 1024, // High resolution sandbox width
            scrollX: 0,
            scrollY: 0
          },
          jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak:    { mode: ['css', 'legacy'] }
        };
        html2pdf().set(opt).from(element).save();
        return;
      }
    }
    
    // Fallback: use window.print() which lets the user print or save as PDF
    window.print();
  };

  const renderReportPage = (rec: PatientRecord, index: number, isPrintOnly: boolean = false) => {
    return (
      <div 
        id={!isPrintOnly && expandedRecordsList.length === 1 ? "report-content-to-print" : undefined} 
        className={`${isPrintOnly ? "report-page-to-print html2pdf__page-break" : "report-page-on-screen-preview w-[210mm] min-h-[297mm] bg-white text-slate-900 px-14 py-12 shadow-xl relative flex flex-col justify-between overflow-hidden text-right"}`}
        style={{ 
          fontFamily: "'Inter', 'Tajawal', sans-serif", 
          WebkitPrintColorAdjust: "exact", 
          printColorAdjust: "exact",
          pageBreakAfter: isPrintOnly ? "always" : "auto",
          breakAfter: isPrintOnly ? "page" : "auto"
        }}
        dir="rtl"
      >
        {/* Subtle Background Watermark of the Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.045] select-none z-0">
          <svg className="w-[140mm] h-[140mm]" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={`watermarkOrangeYellowGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f37021" />
                <stop offset="100%" stopColor="#f9b233" />
              </linearGradient>
              <path id={`watermarkLogoTextPath-${index}`} d="M 65 16 A 44 44 0 0 1 105 76" fill="none" />
            </defs>
            <circle cx="60" cy="60" r="43" stroke="#111111" strokeWidth="0.8" fill="none" />
            <path d="M 68 18 A 43 43 0 1 0 68 102 A 36 39 0 0 1 68 18" fill="#e31e24" />
            <path d="M 70 28 A 34 34 0 0 1 70 92" stroke={`url(#watermarkOrangeYellowGrad-${index})`} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <rect x="42" y="42" width="10" height="36" fill="#1ca845" rx="1.5" />
            <rect x="61" y="42" width="10" height="36" fill="#3c59be" rx="1.5" />
            <ellipse cx="51" cy="60" rx="11" ry="6.5" fill="#88c440" transform="rotate(-30 51 60)" />
            <ellipse cx="59" cy="56" rx="11" ry="6.5" fill="#ffffff" transform="rotate(-30 59 56)" />
            <circle cx="86" cy="42" r="2.5" fill="#f37021" />
            <text fill="#1b2d83" fontSize="8.5" fontWeight="900" fontFamily="'Tajawal', 'Cairo', sans-serif">
              <textPath href={`#watermarkLogoTextPath-${index}`} startOffset="2%">
                مركز ابن الهيثم الطبي
              </textPath>
            </text>
          </svg>
        </div>

        <div className="z-10 relative space-y-6">
          {/* Header / Letterhead - Arabic on Right, English on Left */}
          <div className="letterhead pb-4 flex items-center justify-between animate-fade-in" dir="ltr">
            {/* Left Side: English Medical Center Info in Red */}
            <div className="text-left space-y-0.5 w-1/3">
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight uppercase font-sans" style={{ color: "#c21c1c" }}>
                Ibn Al-Haitham Medical Center
              </h1>
              <p className="text-xs font-bold font-sans uppercase tracking-wider" style={{ color: "#c21c1c" }}>
                Laboratory Dept
              </p>
            </div>

            {/* Center: Actual stylized circular lab logo */}
            <div className="text-center w-1/3 flex justify-center">
              <div className="w-20 h-20 bg-white rounded-full border border-slate-100 shadow-xs flex items-center justify-center p-1.5 relative">
                <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id={`headerOrangeYellowGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f37021" />
                      <stop offset="100%" stopColor="#f9b233" />
                    </linearGradient>
                    <path id={`headerLogoTextPath-${index}`} d="M 65 16 A 44 44 0 0 1 105 76" fill="none" />
                  </defs>
                  <circle cx="60" cy="60" r="43" stroke="#111111" strokeWidth="0.8" fill="none" />
                  <path d="M 68 18 A 43 43 0 1 0 68 102 A 36 39 0 0 1 68 18" fill="#e31e24" />
                  <path d="M 70 28 A 34 34 0 0 1 70 92" stroke={`url(#headerOrangeYellowGrad-${index})`} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <rect x="42" y="42" width="10" height="36" fill="#1ca845" rx="1.5" />
                  <rect x="61" y="42" width="10" height="36" fill="#3c59be" rx="1.5" />
                  <ellipse cx="51" cy="60" rx="11" ry="6.5" fill="#88c440" transform="rotate(-30 51 60)" />
                  <ellipse cx="59" cy="56" rx="11" ry="6.5" fill="#ffffff" transform="rotate(-30 59 56)" />
                  <circle cx="86" cy="42" r="2.5" fill="#f37021" />
                  <text fill="#1b2d83" fontSize="8.5" fontWeight="900" fontFamily="'Tajawal', 'Cairo', sans-serif">
                    <textPath href={`#headerLogoTextPath-${index}`} startOffset="2%">
                      مركز ابن الهيثم الطبي
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>

            {/* Right Side: Arabic Medical Center Info in Red */}
            <div className="text-right space-y-0.5 w-1/3" dir="rtl">
              <h1 className="text-lg sm:text-xl font-black leading-tight tracking-wide font-sans" style={{ color: "#c21c1c" }}>
                مركز ابن الهيثم الطبي
              </h1>
              <p className="text-xs sm:text-sm font-black font-sans" style={{ color: "#c21c1c" }}>
                قسم المختبر
              </p>
            </div>
          </div>

          {/* Patient Info Card - Blue tint with left accent line and clean 3-column metadata */}
          <div className="patient-info-card bg-[#f0f9ff]/40 border border-sky-100 rounded-2xl p-5 mb-6 relative overflow-hidden text-slate-800 text-xs font-bold shadow-2xs">
            {/* Solid left blue bar */}
            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-sky-500 rounded-l-2xl"></div>
            
            <div className="grid grid-cols-3 gap-y-4 gap-x-8 text-xs font-bold font-sans" dir="ltr">
              {/* Column 1 */}
              <div className="flex items-center gap-1.5 text-left">
                <span className="text-slate-400 text-[10px] tracking-wider uppercase shrink-0 font-extrabold">NAME:</span>
                <span className="text-sm text-slate-950 font-black tracking-wide">{rec.patientName}</span>
              </div>
              {/* Column 2 */}
              <div className="flex items-center gap-1.5 text-left">
                <span className="text-slate-400 text-[10px] tracking-wider uppercase shrink-0 font-extrabold">AGE:</span>
                <span className="text-sm text-slate-950 font-black">{rec.age} Years</span>
              </div>
              {/* Column 3 */}
              <div className="flex items-center gap-1.5 text-left">
                <span className="text-slate-400 text-[10px] tracking-wider uppercase shrink-0 font-extrabold">GENDER:</span>
                <span className="text-sm text-slate-950 font-black">{rec.gender === "M" ? "Male" : "Female"}</span>
              </div>

              {/* Row 2 - Column 1 */}
              <div className="flex items-center gap-1.5 text-left">
                <span className="text-slate-400 text-[10px] tracking-wider uppercase shrink-0 font-extrabold">REF. DOCTOR:</span>
                <span className="text-sm text-slate-950 font-black">{rec.doctorName || "-"}</span>
              </div>
              {/* Row 2 - Column 2 */}
              <div className="flex items-center gap-1.5 text-left">
                <span className="text-slate-400 text-[10px] tracking-wider uppercase shrink-0 font-extrabold">LAB NO:</span>
                <span className="text-sm text-sky-600 font-bold font-mono">{rec.labNo}</span>
              </div>
              {/* Row 2 - Column 3 */}
              <div className="flex items-center gap-1.5 text-left">
                <span className="text-slate-400 text-[10px] tracking-wider uppercase shrink-0 font-extrabold">DATE:</span>
                <span className="text-sm text-sky-600 font-bold font-mono">{formatEnglishDate(rec.date)}</span>
              </div>
            </div>
          </div>

          {/* Results Title Banner Pill */}
          <div className="flex justify-center my-6">
            <div className="bg-[#e0f2fe] text-[#0369a1] px-8 py-2 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-2xs">
              {(rec.templateName || "OTHER TESTS").toUpperCase()}
            </div>
          </div>

          {/* Results Table - exactly 4 columns */}
          <div className="overflow-x-auto">
            <table className="results-table w-full text-left text-xs mb-8" dir="ltr">
              <thead>
                <tr className="bg-[#e0f2fe]/80 text-[#0369a1] font-black uppercase text-[10px] tracking-wider border-b border-sky-100">
                  <th className="p-3.5 text-left rounded-l-xl pl-5">TEST NAME</th>
                  <th className="p-3.5 text-center">RESULT</th>
                  <th className="p-3.5 text-center">UNIT</th>
                  <th className="p-3.5 text-center rounded-r-xl pr-5">NORMAL RANGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                {rec.results.map((res, index) => {
                  // Style result and attach tag inside RESULT cell
                  let resultDisplay: React.ReactNode = <span className="text-slate-950 font-black">{res.value || "-"}</span>;
                  
                  if (res.flag === "high") {
                    resultDisplay = (
                      <span className="text-red-600 font-black font-mono">
                        {res.value} <span className="text-[10px] font-extrabold ml-1">(H)</span>
                      </span>
                    );
                  } else if (res.flag === "low") {
                    resultDisplay = (
                      <span className="text-red-600 font-black font-mono">
                        {res.value} <span className="text-[10px] font-extrabold ml-1">(L)</span>
                      </span>
                    );
                  } else if (res.flag === "abnormal") {
                    resultDisplay = (
                      <span className="text-red-600 font-black font-mono">
                        {res.value} <span className="text-[10px] font-extrabold ml-1">(Abn)</span>
                      </span>
                    );
                  }

                  return (
                    <tr key={index} className="hover:bg-slate-50/40 transition-colors odd:bg-white even:bg-slate-50/10">
                      <td className="p-3.5 text-left pl-5">
                        <div className="text-slate-900 font-black tracking-wide font-sans">{res.nameEn}</div>
                      </td>
                      <td className="p-3.5 text-center font-black">
                        {resultDisplay}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-500 font-mono text-2xs">
                        {res.unit || "-"}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-500 font-mono text-2xs pr-5">
                        {res.refRange || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Comments / Notes in 100% English */}
          {rec.notes && rec.notes.trim() !== "" && (
            <div className="comments-card bg-slate-50/50 border border-slate-200 rounded-xl p-4 mt-4 text-xs text-left animate-fade-in" dir="ltr">
              <h4 className="font-extrabold text-sky-700 mb-1 uppercase tracking-wider">LABORATORY COMMENTS / REMARKS:</h4>
              <p className="text-slate-600 leading-relaxed font-semibold whitespace-pre-line">{rec.notes}</p>
            </div>
          )}
        </div>

        {/* Footer of the Report Sheet with centered red contact details in Arabic */}
        <div className="footer-card border-t border-slate-100 pt-5 mt-auto z-10 relative">
          <p className="text-center text-xs font-black tracking-wide pb-1 font-sans" style={{ color: "#c21c1c" }}>
            خمر - ملف مزينة - خط صعدة - ت/ 776812525 _ 711761661 _ 777786099
          </p>
        </div>
      </div>
    );
  };

  if (expandedRecordsList.length === 0) {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center text-slate-500 font-bold">
        لا يوجد سجلات طبية محددة للطباعة.
      </div>
    );
  }

  return (
    <div id="printable-report-wrapper" className="space-y-6">
      {/* Report Action Bar (Hidden when printing) */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-sans"
        >
          <span>← العودة للخلف / Back</span>
        </button>

        <div className="text-center font-extrabold text-slate-800 text-xs sm:text-sm">
          {expandedRecordsList.length > 1 ? (
            <span className="text-sky-700">معاينة الطباعة: {expandedRecordsList.length} صفحة / Print Preview: {expandedRecordsList.length} Pages</span>
          ) : (
            <span>معاينة طباعة التقرير / Report Print Preview</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadPDF}
            className="px-4 py-2 text-sm bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-sans"
          >
            <Download className="h-4.5 w-4.5" />
            <span>{expandedRecordsList.length > 1 ? "تحميل الكل PDF" : "تحميل PDF / Download"}</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-sm bg-sky-600 text-white hover:bg-sky-700 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/10 font-sans"
          >
            <Printer className="h-4.5 w-4.5" />
            <span>{expandedRecordsList.length > 1 ? "طباعة كافة الصفحات" : "طباعة التقرير / Print A4"}</span>
          </button>
        </div>
      </div>

      {/* A4 Report Contents scrollable list for Preview on Screen */}
      <div className="flex flex-col gap-8 bg-slate-200/40 border border-slate-200/60 py-8 px-4 sm:px-8 rounded-2xl items-center no-print max-h-[82vh] overflow-y-auto w-full">
        {expandedRecordsList.map((rec, idx) => (
          <div key={rec.id} className="report-preview-container relative shadow-xl border border-slate-300/40 rounded-lg bg-white shrink-0">
            <div className="report-preview-scale relative shrink-0">
              <div className="absolute top-4 right-4 bg-sky-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-md z-20 font-mono no-print">
                PAGE {idx + 1} / {expandedRecordsList.length}
              </div>
              {renderReportPage(rec, idx)}
            </div>
          </div>
        ))}
      </div>

      {/* Unscaled target for html2pdf - contained inside height-0 overflow-hidden parent to prevent mobile-viewport compression and allow flawless painting */}
      <div className="no-print" style={{ height: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div id="pdf-unscaled-export-container">
          {expandedRecordsList.map((rec, idx) => (
            <React.Fragment key={`pdf-${rec.id}`}>
              {renderReportPage(rec, idx, true)}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Print-Only Target - This renders only inside standard print flow */}
      <div id="print-only-target" className="hidden print:block">
        {expandedRecordsList.map((rec, idx) => (
          <React.Fragment key={rec.id}>
            {renderReportPage(rec, idx, true)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

