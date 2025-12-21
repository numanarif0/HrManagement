import { useState, useEffect } from 'react';
import { Employee, Review, ReviewIU } from '../types';
import { reviewService } from '../services/reviewService';
import { employeeService } from '../services/employeeService';
import './Reviews.css';

interface ReviewsProps {
  employee: Employee | null;
}

function Reviews({ employee }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState<ReviewIU>({
    reviewerName: employee?.firstname + ' ' + employee?.lastname || '',
    comments: '',
    rating: 5,
    employeeId: undefined,
    reviewerId: employee?.id,
  });

  // Sayfa yüklendiğinde çalışanları getir
  useEffect(() => {
    loadEmployees();
  }, []);

  // Seçili çalışan değiştiğinde değerlendirmeleri yükle
  useEffect(() => {
    if (selectedEmployeeId) {
      loadReviews(selectedEmployeeId);
    } else {
      setReviews([]);
    }
  }, [selectedEmployeeId]);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch {
      console.error('Çalışanlar yüklenemedi');
    }
  };

  const loadReviews = async (employeeId: number) => {
    setLoading(true);
    try {
      const data = await reviewService.getByEmployeeId(employeeId);
      setReviews(data);
    } catch {
      console.error('Değerlendirmeler yüklenemedi');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rating' || name === 'employeeId' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId) {
      setMessage('Lütfen değerlendirilecek çalışanı seçin.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      if (editingId) {
        await reviewService.update(editingId, formData);
        setMessage('Değerlendirme güncellendi!');
      } else {
        await reviewService.add(formData);
        setMessage('Değerlendirme eklendi!');
      }

      // Listeyi yeniden yükle
      if (selectedEmployeeId) {
        await loadReviews(selectedEmployeeId);
      }
      resetForm();
    } catch {
      setMessage('İşlem başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review: Review) => {
    setFormData({
      id: review.id,
      reviewerName: review.reviewerName,
      comments: review.comments,
      rating: review.rating,
      employeeId: review.employeeId,
      reviewerId: employee?.id,
    });
    setEditingId(review.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu değerlendirmeyi silmek istediğinizden emin misiniz?')) return;

    setLoading(true);
    try {
      await reviewService.delete(id);
      setReviews(reviews.filter((r) => r.id !== id));
      setMessage('Değerlendirme silindi!');
    } catch {
      setMessage('Silme işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      reviewerName: employee?.firstname + ' ' + employee?.lastname || '',
      comments: '',
      rating: 5,
      employeeId: selectedEmployeeId,
      reviewerId: employee?.id,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleNewReview = () => {
    setFormData({
      reviewerName: employee?.firstname + ' ' + employee?.lastname || '',
      comments: '',
      rating: 5,
      employeeId: selectedEmployeeId,
      reviewerId: employee?.id,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getEmployeeName = (empId: number | undefined) => {
    if (!empId) return 'Bilinmiyor';
    const emp = employees.find(e => e.id === empId);
    return emp ? `${emp.firstname} ${emp.lastname}` : 'Bilinmiyor';
  };

  return (
    <div className="reviews">
      <div className="page-header">
        <h1>Performans Değerlendirmeleri</h1>
        <p>Çalışan değerlendirmelerini yönetin</p>
      </div>

      {/* Çalışan Seçimi */}
      <div className="card">
        <h2>👤 Çalışan Seçin</h2>
        <div className="form-group">
          <label htmlFor="selectedEmployee">Değerlendirmelerini görmek istediğiniz çalışanı seçin:</label>
          <select
            id="selectedEmployee"
            value={selectedEmployeeId || ''}
            onChange={(e) => setSelectedEmployeeId(e.target.value ? Number(e.target.value) : undefined)}
            className="employee-select"
          >
            <option value="">-- Çalışan Seçin --</option>
            {employees
              .filter((emp) => Number(emp.id) !== Number(employee?.id))
              .map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstname} {emp.lastname} - {emp.department} ({emp.position})
                </option>
              ))}
          </select>
        </div>
      </div>

      {selectedEmployeeId && (
        <>
          <div className="reviews-header">
            <button
              onClick={() => showForm ? resetForm() : handleNewReview()}
              className="btn-primary"
            >
              {showForm ? '✕ Formu Kapat' : '+ Yeni Değerlendirme Ekle'}
            </button>
          </div>

          {message && (
            <div className={`message ${message.includes('başarısız') || message.includes('Lütfen') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          {showForm && (
            <div className="card review-form-card">
              <h2>{editingId ? '✏️ Değerlendirme Düzenle' : '➕ Yeni Değerlendirme'}</h2>
              <p className="form-subtitle">
                Değerlendirilen: <strong>{getEmployeeName(formData.employeeId)}</strong>
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="targetEmployee">Değerlendirilecek Çalışan</label>
                  <select
                    id="targetEmployee"
                    name="employeeId"
                    value={formData.employeeId || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Çalışan Seçin --</option>
                    {employees
                      .filter((emp) => Number(emp.id) !== Number(employee?.id))
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstname} {emp.lastname} - {emp.department}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="reviewerName">Değerlendiren</label>
                  <input
                    type="text"
                    id="reviewerName"
                    name="reviewerName"
                    value={formData.reviewerName}
                    onChange={handleChange}
                    placeholder="Değerlendiren kişinin adı"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rating">Puan</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, rating: star })}
                      >
                        ★
                      </button>
                    ))}
                    <span className="rating-text">{formData.rating}/5</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="comments">Yorumlar</label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    placeholder="Değerlendirme yorumlarınızı yazın..."
                    rows={4}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-success" disabled={loading}>
                    {loading ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Kaydet'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-danger">
                    İptal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="card">
            <h2>📋 {getEmployeeName(selectedEmployeeId)} - Değerlendirme Listesi</h2>

            {reviews.length > 0 && (
              <div className="average-rating-box">
                <span className="average-label">Ortalama Puan:</span>
                <span className="average-stars">
                  {renderStars(Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))}
                </span>
                <span className="average-value">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} / 5
                </span>
                <span className="review-count">({reviews.length} değerlendirme)</span>
              </div>
            )}

            {loading ? (
              <div className="loading-state">Yükleniyor...</div>
            ) : reviews.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <p>Bu çalışan için henüz değerlendirme bulunmuyor.</p>
                <p className="empty-hint">Yeni bir değerlendirme eklemek için yukarıdaki butonu kullanın.</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <span className="reviewer-avatar">👤</span>
                        <div>
                          <h4>{review.reviewerName}</h4>
                          <span className="review-date">
                            {review.reviewDate
                              ? new Date(review.reviewDate).toLocaleDateString('tr-TR')
                              : 'Tarih yok'}
                          </span>
                        </div>
                      </div>
                      <div className="review-rating">
                        <span className="stars">{renderStars(review.rating)}</span>
                      </div>
                    </div>
                    <p className="review-comments">{review.comments}</p>
                    <div className="review-actions">
                      <button onClick={() => handleEdit(review)} className="btn-warning btn-sm">
                        ✏️ Düzenle
                      </button>
                      <button
                        onClick={() => review.id && handleDelete(review.id)}
                        className="btn-danger btn-sm"
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!selectedEmployeeId && (
        <div className="card">
          <div className="empty-state">
            <span className="empty-icon">👆</span>
            <p>Lütfen yukarıdan bir çalışan seçin.</p>
            <p className="empty-hint">Değerlendirmeleri görmek ve yeni değerlendirme eklemek için önce bir çalışan seçmelisiniz.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reviews;
