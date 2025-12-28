import { useState, useEffect } from 'react';
import { Employee } from '../types';
import { employeeService } from '../services/employeeService';
import './Employees.css';

interface EmployeesProps {
  employee: Employee | null;
}

function Employees({ employee }: EmployeesProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Employee>({
    firstname: '',
    lastname: '',
    position: '',
    department: '',
    email: '',
    phoneNumber: '',
    password: '',
    tcNo: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Çalışanlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // HR/Admin kontrolu - Layout.tsx ile tutarli
  const isHR = employee?.department === 'İnsan Kaynakları' ||
               employee?.role === 'HR' ||
               employee?.role === 'ADMIN';

  if (!isHR) {
    return (
      <div className="employees-page">
        <div className="access-denied">
          <span className="denied-icon">X</span>
          <h2>Erişim Engellendi</h2>
          <p>Bu sayfaya yalnızca İnsan Kaynakları veya Admin yetkisine sahip çalışanlar erişebilir.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setFormData({
      firstname: '',
      lastname: '',
      position: '',
      department: '',
      email: '',
      phoneNumber: '',
      password: '',
      tcNo: '',
    });
    setShowModal(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      ...emp,
      password: '', // Şifre alanını boş bırak
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu çalışanı silmek istediğinizden emin misiniz?')) {
      try {
        await employeeService.delete(id);
        loadEmployees();
      } catch (error) {
        console.error('Çalışan silinirken hata:', error);
        alert('Çalışan silinirken bir hata oluştu.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee && editingEmployee.id) {
        // Güncelleme
        await employeeService.update(editingEmployee.id, formData);
      } else {
        // Yeni kayıt
        await employeeService.register(formData);
      }
      setShowModal(false);
      loadEmployees();
    } catch (error) {
      console.error('Çalışan kaydedilirken hata:', error);
      alert('Çalışan kaydedilirken bir hata oluştu.');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstname} ${emp.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departments = [
    'İnsan Kaynakları',
    'Bilgi Teknolojileri',
    'Finans',
    'Pazarlama',
    'Satış',
    'Operasyon',
    'Müşteri Hizmetleri',
    'Ar-Ge',
  ];

  if (loading) {
    return (
      <div className="employees-page">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div className="header-left">
          <h1>👥 Çalışan Yönetimi</h1>
          <p>Toplam {employees.length} çalışan</p>
        </div>
        <div className="header-right">
          <input
            type="text"
            placeholder="Çalışan ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={handleAddNew} className="add-btn">
            ➕ Yeni Çalışan Ekle
          </button>
        </div>
      </div>

      <div className="employees-table-container">
        <table className="employees-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ad Soyad</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Departman</th>
              <th>Pozisyon</th>
              <th>TC No</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td className="name-cell">
                  <div className="name-avatar">
                    {emp.firstname?.charAt(0)}{emp.lastname?.charAt(0)}
                  </div>
                  <span>{emp.firstname} {emp.lastname}</span>
                </td>
                <td>{emp.email}</td>
                <td>{emp.phoneNumber}</td>
                <td>
                  <span className="department-badge">{emp.department}</span>
                </td>
                <td>{emp.position}</td>
                <td>{emp.tcNo}</td>
                <td className="actions-cell">
                  <button 
                    onClick={() => handleEdit(emp)} 
                    className="edit-btn"
                    title="Düzenle"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => emp.id && handleDelete(emp.id)} 
                    className="delete-btn"
                    title="Sil"
                    disabled={emp.id === employee?.id}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEmployees.length === 0 && (
          <div className="no-data">
            Arama kriterlerine uygun çalışan bulunamadı.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEmployee ? '✏️ Çalışan Düzenle' : '➕ Yeni Çalışan Ekle'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="employee-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Ad</label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    required
                    placeholder="Ad giriniz"
                  />
                </div>
                <div className="form-group">
                  <label>Soyad</label>
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    required
                    placeholder="Soyad giriniz"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="ornek@sirket.com"
                  />
                </div>
                <div className="form-group">
                  <label>Telefon</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="05XX XXX XX XX"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Departman</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Departman seçiniz</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Pozisyon</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    placeholder="Pozisyon giriniz"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>TC Kimlik No</label>
                  <input
                    type="text"
                    name="tcNo"
                    value={formData.tcNo}
                    onChange={handleInputChange}
                    required
                    placeholder="11 haneli TC No"
                    maxLength={11}
                  />
                </div>
                <div className="form-group">
                  <label>{editingEmployee ? 'Yeni Şifre (boş bırakılabilir)' : 'Şifre'}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingEmployee}
                    placeholder={editingEmployee ? 'Değiştirmek için yeni şifre girin' : 'Şifre giriniz'}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  İptal
                </button>
                <button type="submit" className="submit-btn">
                  {editingEmployee ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;
