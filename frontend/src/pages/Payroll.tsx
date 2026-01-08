import { useState, useEffect } from 'react';
import { Employee, Payroll as PayrollType, PayrollGenerateRequest, Attendance } from '../types';
import { payrollService } from '../services/payrollService';
import { attendanceService } from '../services/attendanceService';
import { employeeService } from '../services/employeeService';
import './Payroll.css';

interface PayrollProps {
  employee: Employee | null;
}

function Payroll({ employee }: PayrollProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // HR/Admin kontrolu
  const isHR = employee?.department === 'İnsan Kaynakları' || employee?.role === 'HR' || employee?.role === 'ADMIN';

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [payrollData, setPayrollData] = useState<PayrollType | null>(null);
  const [yearlyData, setYearlyData] = useState<PayrollType[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<PayrollType[]>([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // HR/Admin için çalışan listesi
  const [approvedEmployees, setApprovedEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(employee?.id || 0);
  // Bordro sorgulama için seçili çalışan (HR/Admin)
  const [queryEmployeeId, setQueryEmployeeId] = useState<number>(employee?.id || 0);

  const [generateForm, setGenerateForm] = useState<PayrollGenerateRequest>({
    employeeId: employee?.id || 0,
    year: currentYear,
    month: currentMonth,
    standardMonthlyHours: 160,
    overtimeMultiplier: 1.5,
    incomeTaxRate: 0.15,
    bonus: 0,
    extraDeduction: 0,
    baseSalary: 0,
  });

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Employee değiştiğinde queryEmployeeId ve selectedEmployeeId'yi güncelle
  useEffect(() => {
    if (employee?.id) {
      if (queryEmployeeId === 0) {
        setQueryEmployeeId(employee.id);
      }
      if (selectedEmployeeId === 0) {
        setSelectedEmployeeId(employee.id);
      }
    }
  }, [employee?.id]);

  // HR/Admin için onaylı çalışanları getir
  useEffect(() => {
    if (isHR) {
      loadApprovedEmployees();
    }
  }, [isHR]);

  const loadApprovedEmployees = async () => {
    try {
      const employees = await employeeService.getApproved();
      setApprovedEmployees(employees);
    } catch (error) {
      console.error('Çalışan listesi yüklenemedi:', error);
    }
  };

  // Form ay/yıl veya seçili çalışan değiştiğinde çalışma saatlerini getir
  useEffect(() => {
    const targetEmployeeId = isHR ? selectedEmployeeId : employee?.id;
    if (targetEmployeeId) {
      loadMonthlyAttendance(targetEmployeeId);
      loadPayrollHistory(targetEmployeeId);
    }
  }, [generateForm.year, generateForm.month, selectedEmployeeId, employee?.id, isHR]);

  // Sorgulama için seçilen çalışan değiştiğinde verileri temizle
  useEffect(() => {
    if (isHR) {
      setPayrollData(null);
      setYearlyData([]);
    }
  }, [queryEmployeeId]);

  const loadPayrollHistory = async (targetEmployeeId?: number) => {
    const empId = targetEmployeeId || (isHR ? selectedEmployeeId : employee?.id);
    if (!empId) return;
    try {
      console.log('Bordro geçmişi istek employeeId:', empId);
      console.log('Bordro geçmişi yükleniyor...');
      const records = await payrollService.getAllByEmployee(empId);
      console.log('Bordro geçmişi yüklendi:', records);
      setPayrollHistory(records || []);
    } catch (error) {
      console.error('Bordro geçmişi yüklenemedi:', error);
      setPayrollHistory([]);
    }
  };

  const loadMonthlyAttendance = async (targetEmployeeId?: number) => {
    const empId = targetEmployeeId || (isHR ? selectedEmployeeId : employee?.id);
    if (!empId) return;
    try {
      const records = await attendanceService.getMonthlyRecords(
        empId,
        generateForm.year,
        generateForm.month
      );
      setMonthlyAttendance(records);
    } catch (error) {
      console.error('Aylık devam kayıtları yüklenemedi:', error);
    }
  };

  // Aylık toplam çalışma saati
  const totalMonthlyHours = monthlyAttendance.reduce(
    (sum, r) => sum + (Number(r.hoursWorked) || 0), 
    0
  );

  const handleFetchPayroll = async () => {
    const targetEmployeeId = isHR ? queryEmployeeId : employee?.id;
    if (!targetEmployeeId) {
      setError('Lütfen bir çalışan seçin.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await payrollService.getByEmployeeAndPeriod(
        targetEmployeeId,
        selectedYear,
        selectedMonth
      );
      if (data) {
        setPayrollData(data);
        setError('');
      } else {
        setPayrollData(null);
        setError(`${months[selectedMonth - 1]} ${selectedYear} için bordro bulunamadı. Önce bordro oluşturun.`);
      }
    } catch (err: unknown) {
      // 404 hatası bordro bulunamadı anlamına gelir
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          setPayrollData(null);
          setError(`${months[selectedMonth - 1]} ${selectedYear} için bordro bulunamadı. Önce bordro oluşturun.`);
          return;
        }
      }
      setError('Bordro sorgulanırken bir hata oluştu.');
      setPayrollData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchYearlyPayroll = async () => {
    const targetEmployeeId = isHR ? queryEmployeeId : employee?.id;
    console.log('Yıllık bordro sorgusu:', { isHR, queryEmployeeId, employeeId: employee?.id, targetEmployeeId, selectedYear });
    if (!targetEmployeeId) {
      setError('Lütfen bir çalışan seçin.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('API çağrısı:', targetEmployeeId, selectedYear);
      const data = await payrollService.listByEmployeeYear(targetEmployeeId, selectedYear);
      console.log('API yanıtı:', data);
      if (data && data.length > 0) {
        setYearlyData(data);
        setError('');
      } else {
        setYearlyData([]);
        setError(`${selectedYear} yılı için bordro kaydı bulunamadı.`);
      }
    } catch (err) {
      console.error('Yıllık bordro hatası:', err);
      setError('Yıllık bordro verisi sorgulanırken bir hata oluştu.');
      setYearlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    // HR/Admin için seçili çalışan, normal kullanıcı için kendi ID'si
    const targetEmployeeId = isHR ? selectedEmployeeId : employee?.id;

    if (!targetEmployeeId) {
      setError('Lütfen bir çalışan seçin.');
      return;
    }

    if (!generateForm.baseSalary || generateForm.baseSalary <= 0) {
      setError('Lütfen taban maaş giriniz.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Bordro oluşturuluyor:', { ...generateForm, employeeId: targetEmployeeId });
      const data = await payrollService.generate({
        ...generateForm,
        employeeId: targetEmployeeId,
      });
      console.log('Bordro oluşturuldu:', data);
      setPayrollData(data);
      setError('');

      // Seçili çalışanın adını bul
      const selectedEmp = approvedEmployees.find(e => e.id === targetEmployeeId);
      const empName = selectedEmp ? `${selectedEmp.firstname} ${selectedEmp.lastname}` : '';
      setSuccessMessage(`Bordro başarıyla oluşturuldu!${empName ? ` (${empName})` : ''}`);

      loadPayrollHistory(targetEmployeeId); // Listeyi güncelle
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      console.error('Bordro oluşturma hatası:', err);
      let errorMessage = 'Bordro oluşturulamadı.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        errorMessage = axiosErr.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    const numValue = Number(value) || 0;
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(numValue);
  };

  const handleDeletePayroll = async (payrollId: number) => {
    console.log('Silme butonuna tıklandı, payrollId:', payrollId);
    console.log('Silme isteği employeeId:', employee?.id);
    
    if (!window.confirm('Bu bordroyu silmek istediğinizden emin misiniz?')) {
      console.log('Kullanıcı iptal etti');
      return;
    }

    console.log('Silme işlemi başlıyor...');
    setLoading(true);
    setError('');

    try {
      const requesterId = isHR ? selectedEmployeeId : employee?.id;
      if (!requesterId) {
        setError('Kullanıcı bilgisi bulunamadı.');
        setLoading(false);
        return;
      }
      console.log('API çağrısı yapılıyor:', `/payroll/${payrollId}`, 'requesterId:', requesterId);
      await payrollService.delete(payrollId, requesterId);
      console.log('Silme başarılı!');
      setSuccessMessage('Bordro başarıyla silindi!');
      
      // Sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Bordro silme hatası:', err);
      setError('Bordro silinemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payroll">
      <div className="page-header">
        <h1>Maaş Bordrosu</h1>
        <p>Maaş ve bordro bilgilerinizi görüntüleyin</p>
      </div>

      <div className={isHR ? "grid-2" : ""}>
        <div className="card payroll-query-card">
          <h2>Bordro Sorgula</h2>
          
          {isHR && (
            <div className="form-group">
              <label>Çalışan Seç</label>
              <select
                value={queryEmployeeId}
                onChange={(e) => setQueryEmployeeId(Number(e.target.value))}
                className="employee-select"
              >
                <option value={0}>-- Çalışan Seçin --</option>
                {approvedEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstname} {emp.lastname} - {emp.department} ({emp.position})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Yıl</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Ay</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="button-group">
            <button onClick={handleFetchPayroll} className="btn-primary" disabled={loading}>
              Bordro Getir
            </button>
            <button onClick={handleFetchYearlyPayroll} className="btn-warning" disabled={loading}>
              Yıllık Görünüm
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
        </div>

        {isHR && (
        <div className="card">
          <h2>Bordro Olustur (IK)</h2>

          {/* Çalışan Seçimi */}
          <div className="form-group">
            <label>Çalışan Seç *</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              className="employee-select"
            >
              <option value={0}>-- Çalışan Seçin --</option>
              {approvedEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstname} {emp.lastname} - {emp.department} ({emp.position})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Yıl</label>
              <select
                value={generateForm.year}
                onChange={(e) => setGenerateForm({
                  ...generateForm,
                  year: Number(e.target.value)
                })}
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Ay</label>
              <select
                value={generateForm.month}
                onChange={(e) => setGenerateForm({
                  ...generateForm,
                  month: Number(e.target.value)
                })}
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="info-box">
            <span className="info-icon">ℹ️</span>
            <span>
              {selectedEmployeeId > 0 ? (
                <>
                  <strong>{approvedEmployees.find(e => e.id === selectedEmployeeId)?.firstname} {approvedEmployees.find(e => e.id === selectedEmployeeId)?.lastname}</strong> - {months[generateForm.month - 1]} {generateForm.year} için toplam çalışma:
                  <strong> {totalMonthlyHours.toFixed(1)} saat</strong>
                </>
              ) : (
                'Çalışan seçin'
              )}
            </span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Taban Maaş (₺)</label>
              <input
                type="number"
                min="0"
                value={generateForm.baseSalary || ''}
                onChange={(e) => setGenerateForm({
                  ...generateForm,
                  baseSalary: parseFloat(e.target.value) || 0
                })}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Prim (₺)</label>
              <input
                type="number"
                min="0"
                value={generateForm.bonus || ''}
                onChange={(e) => setGenerateForm({
                  ...generateForm,
                  bonus: parseFloat(e.target.value) || 0
                })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Standart Saat</label>
              <input
                type="number"
                min="0"
                value={generateForm.standardMonthlyHours || ''}
                onChange={(e) => setGenerateForm({
                  ...generateForm,
                  standardMonthlyHours: e.target.value === '' ? 0 : Number(e.target.value)
                })}
                placeholder="160"
              />
            </div>
            <div className="form-group">
              <label>Mesai Çarpanı</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={generateForm.overtimeMultiplier || ''}
                onChange={(e) => setGenerateForm({
                  ...generateForm,
                  overtimeMultiplier: e.target.value === '' ? 0 : parseFloat(e.target.value)
                })}
                placeholder="1.5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vergi Oranı (%)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={generateForm.incomeTaxRate ? (generateForm.incomeTaxRate * 100) : ''}
                onChange={(e) => setGenerateForm({
                  ...generateForm,
                  incomeTaxRate: e.target.value === '' ? 0 : parseFloat(e.target.value) / 100
                })}
                placeholder="15"
              />
            </div>
            <div className="form-group">
              <label>Ekstra Kesinti (₺)</label>
              <input
                type="number"
                min="0"
                value={generateForm.extraDeduction || ''}
                onChange={(e) => setGenerateForm({
                  ...generateForm,
                  extraDeduction: parseFloat(e.target.value) || 0
                })}
                placeholder="0.00"
              />
            </div>
          </div>

          <button onClick={handleGeneratePayroll} className="btn-success" disabled={loading}>
            {loading ? 'Isleniyor...' : 'Bordro Olustur'}
          </button>
        </div>
        )}
      </div>

      {payrollData && (
        <div className="card payroll-detail">
          <h2>📄 Bordro Detayı - {payrollData.month ? months[payrollData.month - 1] : ''} {payrollData.year || ''}</h2>

          <div className="payroll-grid">
            <div className="payroll-item">
              <span className="payroll-label">Taban Maaş</span>
              <span className="payroll-value">{formatCurrency(payrollData.baseSalary)}</span>
            </div>
            <div className="payroll-item">
              <span className="payroll-label">Toplam Çalışma</span>
              <span className="payroll-value">{Number(payrollData.totalWorkHours) || 0} saat</span>
            </div>
            <div className="payroll-item">
              <span className="payroll-label">Fazla Mesai</span>
              <span className="payroll-value">{Number(payrollData.overtimeHours) || 0} saat</span>
            </div>
            <div className="payroll-item">
              <span className="payroll-label">Mesai Ücreti</span>
              <span className="payroll-value">{formatCurrency(payrollData.overtimePay)}</span>
            </div>
            <div className="payroll-item">
              <span className="payroll-label">Prim</span>
              <span className="payroll-value positive">{formatCurrency(payrollData.bonus)}</span>
            </div>
            <div className="payroll-item">
              <span className="payroll-label">Brüt Maaş</span>
              <span className="payroll-value">{formatCurrency(payrollData.grossSalary)}</span>
            </div>
            <div className="payroll-item">
              <span className="payroll-label">Kesintiler</span>
              <span className="payroll-value negative">-{formatCurrency(payrollData.deductions)}</span>
            </div>
            <div className="payroll-item net-salary">
              <span className="payroll-label">Net Maaş</span>
              <span className="payroll-value">{formatCurrency(payrollData.netSalary)}</span>
            </div>
          </div>
        </div>
      )}

      {yearlyData.length > 0 && (
        <div className="card">
          <h2>📊 {selectedYear} Yılı Bordro Özeti</h2>
          <table>
            <thead>
              <tr>
                <th>Ay</th>
                <th>Brüt Maaş</th>
                <th>Kesintiler</th>
                <th>Net Maaş</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((payroll) => (
                <tr key={payroll.id}>
                  <td>{months[payroll.month - 1]}</td>
                  <td>{formatCurrency(payroll.grossSalary)}</td>
                  <td className="negative">-{formatCurrency(payroll.deductions)}</td>
                  <td className="positive">{formatCurrency(payroll.netSalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {payrollHistory.length > 0 && (
        <div className="card">
          <h2>📋 Tüm Bordro Geçmişi</h2>
          <table>
            <thead>
              <tr>
                <th>Dönem</th>
                <th>Taban Maaş</th>
                <th>Brüt Maaş</th>
                <th>Kesintiler</th>
                <th>Net Maaş</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {payrollHistory.map((payroll) => (
                <tr key={payroll.id}>
                  <td>{months[payroll.month - 1]} {payroll.year}</td>
                  <td>{formatCurrency(payroll.baseSalary)}</td>
                  <td>{formatCurrency(payroll.grossSalary)}</td>
                  <td className="negative">-{formatCurrency(payroll.deductions)}</td>
                  <td className="positive">{formatCurrency(payroll.netSalary)}</td>
                  <td>
                    {isHR && (
                    <button
                      className="btn-danger btn-small"
                      onClick={() => handleDeletePayroll(payroll.id)}
                      disabled={loading}
                    >
                      Sil
                    </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Payroll;
