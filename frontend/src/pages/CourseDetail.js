import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/courses/${id}`);
        setCourse(response.data.data?.course);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="course-detail">
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <div className="course-actions">
        <Link to={`/courses/${id}/practice`} className="btn btn-primary">
          Start Practicing
        </Link>
      </div>
    </div>
  );
};

export default CourseDetail;
