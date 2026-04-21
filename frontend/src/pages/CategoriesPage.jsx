import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container main-content">
      <div className="page-header">
        <h1 className="page-title">📂 Kategori</h1>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <h3 className="empty-state-title">Belum ada kategori</h3>
          <p className="empty-state-desc">Admin belum membuat kategori apapun.</p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link to={`/forum?category_id=${cat.id}`} key={cat.id} style={{ textDecoration: 'none' }}>
              <div className="card category-card">
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-desc">{cat.description || 'Tidak ada deskripsi'}</p>
                <span className="category-count">{cat.threads_count || 0} threads</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
