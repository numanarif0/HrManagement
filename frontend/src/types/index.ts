// Employee Types
export interface Employee {
  id?: number;
  firstname: string;
  lastname: string;
  position: string;
  department: string;
  email: string;
  phoneNumber: string;
  password?: string;
  tcNo: string;
  role?: 'EMPLOYEE' | 'HR' | 'ADMIN';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  qrCode?: string;
  createdAt?: string;
  approvedAt?: string;
  approvedBy?: number;
}

// Attendance Types
export interface Attendance {
  id?: number;
  date?: string;
  checkInTime?: string;
  checkOutTime?: string;
  hoursWorked?: number;
  employeeId: number;
  employeeName?: string;
  status?: string;
  newQrCode?: string; // Giriş/çıkış sonrası yeni QR kodu
}

// Payroll Types
export interface PayrollGenerateRequest {
  employeeId: number;
  year: number;
  month: number;
  standardMonthlyHours?: number;
  overtimeMultiplier?: number;
  incomeTaxRate?: number;
  bonus?: number;
  extraDeduction?: number;
  baseSalary?: number;
}

export interface Payroll {
  id: number;
  employee: Employee;
  year: number;
  month: number;
  baseSalary: number;
  totalWorkHours: number;
  overtimeHours: number;
  overtimePay: number;
  bonus: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  createdAt: string;
}

// Reviews Types
export interface Review {
  id?: number;
  reviewDate?: string;
  reviewerName: string;
  comments: string;
  rating: number;
  employeeId?: number;
  reviewerId?: number;
}

export interface ReviewIU {
  id?: number;
  reviewDate?: string;
  reviewerName: string;
  comments: string;
  rating: number;
  employeeId?: number;
  reviewerId?: number;
}
