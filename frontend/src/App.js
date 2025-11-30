import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminProvider } from './contexts/AdminContext';
import Navigation from './components/Navigation';
import Sidebar, { DRAWER_WIDTH } from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Study from './pages/Study';
import PracticeQuestions from './pages/PracticeQuestions';
import AdminDashboard from './pages/admin/AdminDashboard';
import Permissions from './pages/admin/Permissions';
import ManageCoursesPage from './pages/admin/ManageCoursesPage';
import CreateCourse from './pages/admin/CreateCourse';
import ManageCourseContent from './pages/admin/ManageCourseContent';
import QuestionManagement from './pages/admin/QuestionManagement';
import './App.css';

// Layout component to handle sidebar visibility
function AppLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Routes where sidebar should NOT be shown
  const publicRoutes = ['/', '/login', '/register'];
  const showSidebar = user && !publicRoutes.includes(location.pathname);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: showSidebar && !isMobile ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Top Navigation Bar */}
        <Navigation>
          {showSidebar && isMobile && (
            <IconButton
              onClick={handleSidebarToggle}
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Navigation>

        {/* Page Content */}
        <Box
          className="main-content"
          sx={{
            flexGrow: 1,
            p: 0,
            mt: '64px', // Height of Navigation
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AdminProvider>
            <AppLayout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Homepage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                  {/* Protected routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/courses"
                    element={
                      <ProtectedRoute>
                        <Courses />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/courses/:id"
                    element={
                      <ProtectedRoute>
                        <CourseDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/study"
                    element={
                      <ProtectedRoute>
                        <Study />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/courses/:id/practice"
                    element={
                      <ProtectedRoute>
                        <PracticeQuestions />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/courses"
                    element={
                      <ProtectedRoute>
                        <ManageCoursesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/courses/new"
                    element={
                      <ProtectedRoute>
                        <CreateCourse />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/courses/:id/edit"
                    element={
                      <ProtectedRoute>
                        <CreateCourse />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/courses/:courseId/content"
                    element={
                      <ProtectedRoute>
                        <ManageCourseContent />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/permissions"
                    element={
                      <ProtectedRoute>
                        <Permissions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/questions"
                    element={
                      <ProtectedRoute>
                        <QuestionManagement />
                      </ProtectedRoute>
                    }
                  />

                {/* Default route - redirect unknown paths to homepage */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </AdminProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
