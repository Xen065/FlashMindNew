import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import './ManageCoursesPage.css';

const ManageCoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'courses';

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#6366F1',
    parentId: null,
    orderIndex: 0,
    isActive: true
  });

  useEffect(() => {
    if (activeTab === 'courses') {
      fetchCourses();
    } else if (activeTab === 'categories') {
      fetchCategories();
    }
  }, [activeTab]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/courses');
      setCourses(response.data.data?.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/admin/course-categories/tree');
      setCategories(response.data.data || []);

      const flatResponse = await api.get('/api/admin/course-categories');
      setFlatCategories(flatResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/api/admin/course-categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/api/admin/course-categories', formData);
      }
      await fetchCategories();
      closeModals();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#6366F1',
      parentId: category.parentId || null,
      orderIndex: category.orderIndex || 0,
      isActive: category.isActive !== false
    });
    setShowEditModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/admin/course-categories/${categoryId}`);
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: '#6366F1',
      parentId: null,
      orderIndex: 0,
      isActive: true
    });
  };

  const renderCategoryTree = (categoryList, level = 0) => {
    return categoryList.map(category => {
      const isExpanded = expandedCategories.has(category.id);
      const hasChildren = category.children && category.children.length > 0;

      return (
        <div key={category.id} className="category-tree-item" style={{ marginLeft: `${level * 2}rem` }}>
          <div className="category-row">
            <div className="category-info">
              {hasChildren && (
                <button
                  className="expand-button"
                  onClick={() => toggleExpand(category.id)}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <span className="category-course-count">({category.courseCount} courses)</span>
              {!category.isActive && <span className="inactive-badge">Inactive</span>}
            </div>
            <div className="category-actions">
              <button onClick={() => handleEdit(category)} className="btn btn-small btn-secondary">
                Edit
              </button>
              <button onClick={() => handleDelete(category.id)} className="btn btn-small btn-danger">
                Delete
              </button>
            </div>
          </div>
          {isExpanded && hasChildren && renderCategoryTree(category.children, level + 1)}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="manage-courses-page">
      <div className="page-header">
        <h1>Manage Courses</h1>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => handleTabChange('courses')}
        >
          Courses
        </button>
        <button
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => handleTabChange('categories')}
        >
          Categories
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'courses' && (
          <div className="courses-tab">
            <div className="tab-header">
              <Link to="/admin/courses/new" className="btn btn-primary">
                Create New Course
              </Link>
            </div>

            <div className="courses-list">
              {courses.length === 0 ? (
                <div className="empty-state">
                  <p>No courses yet. Create your first course!</p>
                </div>
              ) : (
                courses.map(course => (
                  <div key={course.id} className="course-item">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div className="course-actions">
                      <Link to={`/admin/courses/${course.id}/edit`} className="btn btn-secondary">
                        Edit
                      </Link>
                      <Link to={`/admin/courses/${course.id}/content`} className="btn btn-secondary">
                        Manage Content
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="categories-tab">
            <div className="tab-header">
              <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                + Add Category
              </button>
            </div>

            {error ? (
              <div className="error-container">
                <p>{error}</p>
              </div>
            ) : (
              <div className="categories-tree">
                {categories.length === 0 ? (
                  <div className="empty-state">
                    <p>No categories yet. Click "Add Category" to create one.</p>
                  </div>
                ) : (
                  renderCategoryTree(categories)
                )}
              </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
              <div className="modal-overlay" onClick={closeModals}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Icon (Emoji)</label>
                        <input
                          type="text"
                          name="icon"
                          value={formData.icon}
                          onChange={handleInputChange}
                          placeholder="📚"
                        />
                      </div>

                      <div className="form-group">
                        <label>Color</label>
                        <input
                          type="color"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Parent Category</label>
                        <select
                          name="parentId"
                          value={formData.parentId || ''}
                          onChange={handleInputChange}
                        >
                          <option value="">None (Root Level)</option>
                          {flatCategories.map(cat => (
                            <option key={cat.id} value={cat.id} disabled={editingCategory && cat.id === editingCategory.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Order Index</label>
                        <input
                          type="number"
                          name="orderIndex"
                          value={formData.orderIndex}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                        />
                        Active (visible in dropdown)
                      </label>
                    </div>

                    <div className="modal-actions">
                      <button type="button" onClick={closeModals} className="btn btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingCategory ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCoursesPage;
