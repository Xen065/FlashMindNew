import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { Link } from 'react-router-dom';
import './Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${config.apiUrl}/api/courses`);
      setCourses(response.data.data?.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(error.response?.data?.message || 'Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
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
        <h1>Available Courses</h1>
        <p>Explore our collection of courses and start learning today</p>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No Courses Available</h3>
          <p>There are no courses available at the moment. Check back soon!</p>
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
