import React from 'react';
import { useParams } from 'react-router-dom';

const ManageCourseContent = () => {
  const { courseId } = useParams();

  return (
    <div className="manage-content">
      <h1>Manage Course Content</h1>
      <p>Content management for course {courseId} coming soon!</p>
    </div>
  );
};

export default ManageCourseContent;
