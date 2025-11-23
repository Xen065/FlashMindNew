import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/admin/courses`);
      setCourses(response.data.data?.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-courses">
      <div className="page-header">
        <h1>Manage Courses</h1>
        <Link to="/admin/courses/new" className="btn btn-primary">
          Create New Course
        </Link>
      </div>

      <div className="courses-list">
        {courses.length === 0 ? (
          <p>No courses yet. Create your first course!</p>
        ) : (
          courses.map(course => (
            <div key={course.id} className="course-item">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-actions">
                <Link to={`/admin/courses/${course.id}/edit`} className="btn">
                  Edit
                </Link>
                <Link to={`/admin/courses/${course.id}/content`} className="btn">
                  Manage Content
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCourses;
