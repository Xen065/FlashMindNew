import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'teacher')) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.username} ({user.role})</p>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Manage Courses</h3>
          <Link to="/admin/courses" className="btn btn-primary">
            View Courses
          </Link>
        </div>

        {(user.role === 'admin' || user.role === 'super_admin') && (
          <div className="admin-card">
            <h3>Permissions</h3>
            <Link to="/admin/permissions" className="btn btn-primary">
              Manage Permissions
            </Link>
          </div>
        )}

        <div className="admin-card">
          <h3>Questions</h3>
          <Link to="/admin/questions" className="btn btn-primary">
            Manage Questions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
