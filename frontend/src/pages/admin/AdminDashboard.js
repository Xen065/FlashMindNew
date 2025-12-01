import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Skeleton,
  Fade
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [engagementStats, setEngagementStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, userStatsRes, courseStatsRes, engagementRes] = await Promise.all([
        api.get('/api/admin/dashboard/overview'),
        api.get('/api/admin/dashboard/stats/users'),
        api.get('/api/admin/dashboard/stats/courses'),
        api.get('/api/admin/dashboard/stats/engagement')
      ]);

      setDashboardData(overviewRes.data.data);
      setUserStats(userStatsRes.data.data);
      setCourseStats(courseStatsRes.data.data);
      setEngagementStats(engagementRes.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="40%" height={50} />
        <Skeleton variant="text" width="25%" height={30} />
      </Box>

      {/* Stats Cards Skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} lg={3} key={item}>
            <Card sx={{ borderRadius: '20px', height: '100%' }}>
              <CardContent>
                <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="60%" height={40} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="50%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row Skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: '20px' }}>
            <CardContent>
              <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: '12px' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: '20px' }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
              <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activity Chart Skeleton */}
      <Card sx={{ borderRadius: '20px', mb: 4 }}>
        <CardContent>
          <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: '12px' }} />
        </CardContent>
      </Card>
    </Box>
  );

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'teacher')) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Access denied. Admin privileges required.</Alert>
      </Box>
    );
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Users',
      value: dashboardData?.overview?.totalUsers || 0,
      subtitle: `${dashboardData?.overview?.activeUsers || 0} active`,
      icon: <PeopleIcon fontSize="large" />,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Total Courses',
      value: dashboardData?.overview?.totalCourses || 0,
      subtitle: `${dashboardData?.overview?.publishedCourses || 0} published`,
      icon: <SchoolIcon fontSize="large" />,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      title: 'Study Sessions',
      value: engagementStats?.totals?.sessions || 0,
      subtitle: `${engagementStats?.totals?.cardsStudied || 0} cards studied`,
      icon: <AssignmentIcon fontSize="large" />,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: 'Avg Accuracy',
      value: `${engagementStats?.totals?.averageAccuracy || 0}%`,
      subtitle: `${engagementStats?.activeUsers || 0} active learners`,
      icon: <TrophyIcon fontSize="large" />,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  // Chart colors
  const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Prepare course difficulty data for pie chart
  const difficultyData = courseStats?.byDifficulty?.map(item => ({
    name: item.difficulty || 'Not Set',
    value: item.count
  })) || [];

  return (
    <Fade in={!loading} timeout={600}>
      <Box component="main" sx={{ p: 3 }} role="main" aria-label="Admin Dashboard">
        {/* Header */}
        <Box component="header" sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user.username} ({user.role})
          </Typography>
        </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }} component="section" aria-label="Platform Statistics">
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '20px',
                background: 'background.paper',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: stat.bgColor,
                      color: stat.color,
                      width: 56,
                      height: 56
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5 }}>
                  {stat.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }} component="section" aria-label="Analytics Charts">
        {/* User Growth Chart */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              borderRadius: '20px',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                User Registration Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userStats?.userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" stroke="currentColor" opacity={0.7} />
                  <YAxis stroke="currentColor" opacity={0.7} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="New Users"
                    dot={{ fill: '#10B981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Course Difficulty Distribution */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              borderRadius: '20px',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Courses by Difficulty
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      border: 'none'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Study Activity Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: '20px',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Study Activity Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementStats?.studyActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" stroke="currentColor" opacity={0.7} />
                  <YAxis stroke="currentColor" opacity={0.7} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sessions" fill="#3B82F6" name="Study Sessions" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="cards" fill="#10B981" name="Cards Studied" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Section - Recent Activity & Top Courses */}
      <Grid container spacing={3} component="section" aria-label="Recent Activity">
        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '20px',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Registrations
              </Typography>
              <List>
                {dashboardData?.recentUsers?.map((recentUser, index) => (
                  <React.Fragment key={recentUser.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonAddIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={recentUser.username}
                        secondary={`${recentUser.email} • ${recentUser.role}`}
                      />
                      <Chip
                        label={new Date(recentUser.createdAt).toLocaleDateString()}
                        size="small"
                        variant="outlined"
                      />
                    </ListItem>
                    {index < dashboardData.recentUsers.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Courses */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '20px',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Most Popular Courses
              </Typography>
              <List>
                {dashboardData?.topCourses?.map((course, index) => (
                  <React.Fragment key={course.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: CHART_COLORS[index % CHART_COLORS.length] }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={course.title}
                        secondary={`Category: ${course.category || 'N/A'}`}
                      />
                      <Chip
                        label={`${course.enrollmentCount} enrolled`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </ListItem>
                    {index < dashboardData.topCourses.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box component="section" sx={{ mt: 4 }} aria-label="Quick Actions">
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              component={Link}
              to="/admin/courses"
              sx={{
                textDecoration: 'none',
                borderRadius: '12px',
                bgcolor: 'primary.main',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 30px rgba(16, 185, 129, 0.3)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SchoolIcon fontSize="large" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Manage Courses
                    </Typography>
                    <Typography variant="body2">
                      View and edit all courses
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {(user.role === 'admin' || user.role === 'super_admin') && (
            <Grid item xs={12} sm={6} md={4}>
              <Card
                component={Link}
                to="/admin/permissions"
                sx={{
                  textDecoration: 'none',
                  borderRadius: '12px',
                  bgcolor: 'secondary.main',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 30px rgba(20, 184, 166, 0.3)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SpeedIcon fontSize="large" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Permissions
                      </Typography>
                      <Typography variant="body2">
                        Manage user permissions
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={4}>
            <Card
              component={Link}
              to="/admin/questions"
              sx={{
                textDecoration: 'none',
                borderRadius: '12px',
                bgcolor: 'info.main',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 30px rgba(59, 130, 246, 0.3)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckIcon fontSize="large" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Questions
                    </Typography>
                    <Typography variant="body2">
                      Manage question bank
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
    </Fade>
  );
};

export default AdminDashboard;
