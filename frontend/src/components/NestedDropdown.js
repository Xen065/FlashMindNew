import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './NestedDropdown.css';

const NestedDropdown = ({ categories, loading, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setOpenSubmenus({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setOpenSubmenus({});
    }
  };

  const toggleSubmenu = (categoryId, event) => {
    event.stopPropagation();
    setOpenSubmenus(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleCategoryClick = (categoryId, hasChildren, event) => {
    if (hasChildren) {
      toggleSubmenu(categoryId, event);
    } else {
      // Navigate to courses page with category filter
      navigate(`/courses?categoryId=${categoryId}`);
      setIsOpen(false);
      setOpenSubmenus({});
    }
  };

  const renderCategoryItem = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isSubmenuOpen = openSubmenus[category.id];

    return (
      <li key={category.id} className={`nested-dropdown-item level-${level}`}>
        <div
          className={`nested-dropdown-link ${hasChildren ? 'has-children' : ''}`}
          onClick={(e) => handleCategoryClick(category.id, hasChildren, e)}
        >
          <span className="category-icon">{category.icon}</span>
          <span className="category-name">{category.name}</span>
          {hasChildren && (
            <span className={`arrow ${isSubmenuOpen ? 'open' : ''}`}>
              ▶
            </span>
          )}
          {category.courseCount > 0 && !hasChildren && (
            <span className="course-count">{category.courseCount}</span>
          )}
        </div>

        {hasChildren && (
          <ul className={`nested-submenu ${isSubmenuOpen ? 'open' : ''}`}>
            {category.children.map(child => renderCategoryItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="nested-dropdown-container" ref={dropdownRef}>
      <button
        className={`nested-dropdown-toggle ${isOpen ? 'active' : ''}`}
        onClick={toggleDropdown}
      >
        Courses
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="nested-dropdown-menu">
          {loading && (
            <div className="nested-dropdown-loading">
              Loading categories...
            </div>
          )}

          {error && (
            <div className="nested-dropdown-error">
              Error loading categories
            </div>
          )}

          {!loading && !error && categories && categories.length === 0 && (
            <div className="nested-dropdown-empty">
              No categories available
            </div>
          )}

          {!loading && !error && categories && categories.length > 0 && (
            <>
              <div className="nested-dropdown-header">
                <button
                  className="view-all-button"
                  onClick={() => {
                    navigate('/courses');
                    setIsOpen(false);
                  }}
                >
                  📚 View All Courses
                </button>
              </div>
              <ul className="nested-dropdown-list">
                {categories.map(category => renderCategoryItem(category))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NestedDropdown;
