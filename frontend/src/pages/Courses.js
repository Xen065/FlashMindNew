import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/courses`);
      setCourses(response.data.data?.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading courses...</div>;

  return (
    <div className="courses-page">
      <h1>Available Courses</h1>
      <div className="courses-grid">
        {courses.length === 0 ? (
          <p>No courses available yet.</p>
        ) : (
          courses.map(course => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <Link to={`/courses/${course.id}`} className="btn btn-primary">
                View Course
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;
