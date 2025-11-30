import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  Assessment as StatsIcon
} from '@mui/icons-material';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  // Calculate progress percentage (example: level progress)
  const levelProgress = ((user?.experiencePoints || 0) % 100);

  return (
    <div className="dashboard">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Welcome back, {user?.username}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ready to continue your learning journey?
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          {/* Progress Card */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrophyIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      Your Level
                    </Typography>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                      {user?.level || 1}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Progress to next level
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={levelProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mt: 1,
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {user?.experiencePoints || 0} XP
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Experience Points Card */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      Experience
                    </Typography>
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                      {user?.experiencePoints || 0}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label="Keep Learning!"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Streak Card */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FireIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      Study Streak
                    </Typography>
                    <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                      {user?.currentStreak || 0} 🔥
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {user?.currentStreak > 0
                    ? `Amazing! Keep the streak going!`
                    : 'Start studying to build your streak'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats Card */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StatsIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      Quick Stats
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Study to see your progress here!
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label="More coming soon"
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Info Section */}
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                📚 Continue Your Journey
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Explore courses, practice questions, and track your progress as you learn!
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                <Chip label="Courses Available" color="primary" />
                <Chip label="Flashcards" color="secondary" />
                <Chip label="Practice Tests" color="success" />
                <Chip label="Study Tools" color="info" />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </div>
  );
};

export default Dashboard;
