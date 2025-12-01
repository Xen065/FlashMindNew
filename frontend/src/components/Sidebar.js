import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Divider,
  Collapse,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  MenuBook as StudyIcon,
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Category as CategoryIcon,
  People as PeopleIcon,
  Quiz as QuizIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [adminOpen, setAdminOpen] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleAdminToggle = () => {
    setAdminOpen(!adminOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (isMobile) {
      onClose();
    }
  };

  const isActive = (path) => location.pathname === path;
  const isAdminActive = () => location.pathname.startsWith('/admin');

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      badge: null
    },
    {
      title: 'Courses',
      icon: <SchoolIcon />,
      path: '/courses',
      badge: null
    },
    {
      title: 'Study',
      icon: <StudyIcon />,
      path: '/study',
      badge: user?.currentStreak > 0 ? `${user.currentStreak}🔥` : null
    },
  ];

  const adminMenuItems = [
    {
      title: 'Dashboard',
      icon: <AdminIcon />,
      path: '/admin'
    },
    {
      title: 'Courses',
      icon: <CategoryIcon />,
      path: '/admin/courses'
    },
    {
      title: 'Permissions',
      icon: <PeopleIcon />,
      path: '/admin/permissions'
    },
    {
      title: 'Questions',
      icon: <QuizIcon />,
      path: '/admin/questions'
    },
  ];

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header with User Info */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
              fontSize: '1.5rem',
              fontWeight: 700
            }}
          >
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user?.username || 'User'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
              <Chip
                label={`Level ${user?.level || 1}`}
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
              {user?.currentStreak > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <FireIcon sx={{ fontSize: 16, color: 'error.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    {user.currentStreak}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        {isMobile && (
          <IconButton onClick={onClose} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* Main Navigation */}
      <List sx={{ flex: 1, py: 2, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: '12px',
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive(item.path) ? 'white' : 'primary.main',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 500,
                  fontSize: '0.95rem'
                }}
              />
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.75rem',
                    bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'error.light',
                    color: isActive(item.path) ? 'white' : 'error.contrastText',
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <>
            <Divider sx={{ my: 2, mx: 2 }} />
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={handleAdminToggle}
                selected={isAdminActive()}
                sx={{
                  borderRadius: '12px',
                  mx: 1,
                  '&.Mui-selected': {
                    bgcolor: 'secondary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'secondary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isAdminActive() ? 'white' : 'secondary.main',
                  }}
                >
                  <AdminIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Admin"
                  primaryTypographyProps={{
                    fontWeight: isAdminActive() ? 600 : 500,
                    fontSize: '0.95rem'
                  }}
                />
                {adminOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={adminOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {adminMenuItems.map((item) => (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      selected={isActive(item.path)}
                      sx={{
                        borderRadius: '12px',
                        mx: 1,
                        pl: 4,
                        '&.Mui-selected': {
                          bgcolor: 'secondary.light',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'secondary.main',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'white',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: isActive(item.path) ? 'white' : 'secondary.main',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          fontWeight: isActive(item.path) ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
      </List>

      {/* Bottom Actions */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => handleNavigation('/settings')}
            sx={{
              borderRadius: '12px',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{ fontSize: '0.9rem' }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: '12px',
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.contrastText',
                '& .MuiListItemIcon-root': {
                  color: 'error.contrastText',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: 'none',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };
