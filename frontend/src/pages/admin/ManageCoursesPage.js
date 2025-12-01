import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  ContentCopy as ContentIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import api from '../../services/api';
import './ManageCoursesPage.css';

const ManageCoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'courses';
  const navigate = useNavigate();

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

  // DataGrid columns definition for courses
  const courseColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true
    },
    {
      field: 'title',
      headerName: 'Course Title',
      flex: 1,
      minWidth: 250,
      sortable: true,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 300,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {params.value || 'No description'}
        </Typography>
      )
    },
    {
      field: 'difficulty',
      headerName: 'Difficulty',
      width: 130,
      sortable: true,
      renderCell: (params) => {
        const colorMap = {
          'beginner': 'success',
          'intermediate': 'warning',
          'advanced': 'error'
        };
        return (
          <Chip
            label={params.value || 'Not set'}
            color={colorMap[params.value?.toLowerCase()] || 'default'}
            size="small"
          />
        );
      }
    },
    {
      field: 'isPublished',
      headerName: 'Status',
      width: 120,
      sortable: true,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Published' : 'Draft'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant={params.value ? 'filled' : 'outlined'}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit Course">
            <IconButton
              size="small"
              onClick={() => navigate(`/admin/courses/${params.row.id}/edit`)}
              sx={{ color: 'primary.main' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Manage Content">
            <IconButton
              size="small"
              onClick={() => navigate(`/admin/courses/${params.row.id}/content`)}
              sx={{ color: 'secondary.main' }}
            >
              <ContentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Course">
            <IconButton
              size="small"
              onClick={() => navigate(`/courses/${params.row.id}`)}
              sx={{ color: 'info.main' }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                All Courses
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/admin/courses/new')}
                sx={{ borderRadius: '12px' }}
              >
                + Create New Course
              </Button>
            </Box>

            <Box
              sx={{
                height: 600,
                width: '100%',
                '& .MuiDataGrid-root': {
                  border: 'none',
                  borderRadius: '20px',
                  bgcolor: 'background.paper',
                  backdropFilter: 'blur(15px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '20px 20px 0 0',
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 700,
                  },
                  '& .MuiDataGrid-iconButtonContainer': {
                    color: 'white',
                  },
                  '& .MuiDataGrid-sortIcon': {
                    color: 'white',
                  },
                  '& .MuiDataGrid-menuIcon': {
                    color: 'white',
                  },
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  fontSize: '0.9rem',
                },
                '& .MuiDataGrid-row': {
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '2px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '0 0 20px 20px',
                },
              }}
            >
              <DataGrid
                rows={courses}
                columns={courseColumns}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                }}
                pageSizeOptions={[5, 10, 25, 50]}
                disableRowSelectionOnClick
                loading={loading}
                sx={{
                  '& .MuiDataGrid-virtualScroller': {
                    minHeight: courses.length === 0 ? '400px' : 'auto',
                  },
                }}
              />
            </Box>
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
