import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { Link, useSearchParams } from 'react-router-dom';
import './Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const searchQuery = searchParams.get('search');
  const categoryId = searchParams.get('categoryId');

  useEffect(() => {
    fetchCourses();
    if (categoryId) {
      fetchCategoryInfo();
    } else {
      setSelectedCategory(null);
    }
  }, [searchQuery, categoryId]);

  const fetchCategoryInfo = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/public/course-categories/tree`);
      if (response.data.success) {
        const category = findCategoryById(response.data.data, parseInt(categoryId));
        setSelectedCategory(category);
      }
    } catch (error) {
      console.error('Error fetching category info:', error);
    }
  };

  const findCategoryById = (categories, id) => {
    for (const cat of categories) {
      if (cat.id === id) return cat;
      if (cat.children && cat.children.length > 0) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryId) params.append('categoryId', categoryId);

      const url = `${config.apiUrl}/api/courses${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url);
      setCourses(response.data.data?.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(error.response?.data?.message || 'Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>⚠️ Oops!</h2>
          <p>{error}</p>
          <button onClick={fetchCourses} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        {selectedCategory ? (
          <>
            <div className="category-badge">
              <span className="category-icon">{selectedCategory.icon}</span>
              <span className="category-name">{selectedCategory.name}</span>
            </div>
            <h1>Courses in {selectedCategory.name}</h1>
            <p>{selectedCategory.description || `Browse all courses in ${selectedCategory.name}`}</p>
          </>
        ) : searchQuery ? (
          <>
            <h1>Search Results for "{searchQuery}"</h1>
            <p>Showing courses matching your search</p>
          </>
        ) : (
          <>
            <h1>Available Courses</h1>
            <p>Explore our collection of courses and start learning today</p>
          </>
        )}
        {(searchQuery || categoryId) && (
          <button onClick={clearFilters} className="btn btn-secondary btn-small">
            Clear Filters
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{searchQuery ? '🔍' : '📚'}</div>
          <h3>{searchQuery ? 'No courses found' : 'No Courses Available'}</h3>
          <p>
            {searchQuery
              ? 'Try searching with different keywords or clear the search to see all courses.'
              : 'There are no courses available at the moment. Check back soon!'}
          </p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="course-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3>{course.title}</h3>
              <p>{course.description || 'No description available'}</p>

              {/* Course metadata */}
              {(course.difficulty || course.cardCount || course.modules) && (
                <div className="course-meta">
                  {course.difficulty && (
                    <div className="course-meta-item">
                      <span className="icon">📊</span>
                      <span>{course.difficulty}</span>
                    </div>
                  )}
                  {course.cardCount && (
                    <div className="course-meta-item">
                      <span className="icon">🎴</span>
                      <span>{course.cardCount} cards</span>
                    </div>
                  )}
                  {course.modules && (
                    <div className="course-meta-item">
                      <span className="icon">📖</span>
                      <span>{course.modules} modules</span>
                    </div>
                  )}
                </div>
              )}

              <Link
                to={`/courses/${course.id}`}
                className="btn btn-primary"
                aria-label={`View ${course.title} course`}
              >
                View Course
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
