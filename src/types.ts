export interface LabTest {
  id: string;
  nameEn: string;
  nameAr?: string;
  unit: string;
  refRangeM: string;
  refRangeF: string;
  category?: string;
}

export interface LabTemplate {
  id: string;
  nameEn: string;
  nameAr?: string;
  category: string;
  items: LabTest[];
}

export interface TestValue {
  testId: string;
  nameEn: string;
  nameAr?: string;
  value: string;
  unit: string;
  refRange: string;
  flag: 'normal' | 'high' | 'low' | 'abnormal' | '';
}

export interface PatientRecord {
  id: string;
  patientName: string;
  age: string;
  gender: 'M' | 'F';
  date: string;
  orderNo: string;
  labNo: string;
  doctorName: string;
  templateId?: string;
  templateName?: string;
  results: TestValue[];
  notes?: string;
  createdAt: string;
}

export interface AppStats {
  todayTestsCount: number;
  totalRecordsCount: number;
  activeTemplatesCount: number;
  activeTestsCount: number;
}
