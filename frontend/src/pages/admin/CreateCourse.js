import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const CreateCourse = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    categoryId: null,
    difficulty: 'beginner'
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchCourse();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/admin/course-categories`);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.apiUrl}/api/admin/courses/${id}`);
      const course = response.data.data;
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        categoryId: course.categoryId || null,
        difficulty: course.difficulty || 'beginner'
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const flattenCategories = (categoryList) => {
    const result = [];
    const processCategory = (cat, level = 0, parentName = '') => {
      const displayName = parentName ? `${parentName} > ${cat.name}` : cat.name;
      result.push({ ...cat, displayName, level });
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach(child => processCategory(child, level + 1, displayName));
      }
    };
    categoryList.forEach(cat => processCategory(cat));
    return result;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'categoryId' ? (value ? parseInt(value) : null) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEditMode) {
        await axios.put(`${config.apiUrl}/api/admin/courses/${id}`, formData);
      } else {
        await axios.post(`${config.apiUrl}/api/admin/courses`, formData);
      }
      navigate('/admin/courses');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} course`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  return (
    <div className="create-course">
      <h1>{isEditMode ? 'Edit Course' : 'Create New Course'}</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Category (Legacy)</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Course Category</label>
          <select
            name="categoryId"
            value={formData.categoryId || ''}
            onChange={handleChange}
          >
            <option value="">-- Select a category (optional) --</option>
            {flattenCategories(categories).map(cat => (
              <option key={cat.id} value={cat.id} disabled={!cat.isActive}>
                {cat.displayName} {!cat.isActive ? '(Inactive)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Difficulty</label>
          <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          {isEditMode ? 'Update Course' : 'Create Course'}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;
