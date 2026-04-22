import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

const API = '/api';
const DRAWER_WIDTH = 290;

const CATEGORY_CONFIG = {
  Technical: { icon: '💻', color: '#0284c7' },
  Cultural: { icon: '🎭', color: '#c026d3' },
  Workshop: { icon: '🔧', color: '#0f766e' },
  Sports: { icon: '⚽', color: '#ea580c' },
  Seminar: { icon: '🎤', color: '#4f46e5' },
  Social: { icon: '🌿', color: '#059669' },
  Other: { icon: '✨', color: '#475569' },
};

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & ML',
  'Data Science',
  'Cybersecurity',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Commerce',
  'Psychology',
  'Journalism',
  'Law',
  'Medicine',
  'Other',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

function getNav(role) {
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardRoundedIcon /> },
    { id: 'events', label: 'Events', icon: <EventRoundedIcon /> },
    { id: 'announcements', label: 'Announcements', icon: <CampaignRoundedIcon /> },
  ];

  if (role === 'student') {
    links.push({ id: 'my-registrations', label: 'My Registrations', icon: <EventAvailableRoundedIcon /> });
  }

  if (role === 'organizer' || role === 'admin') {
    links.push({ id: 'create-event', label: 'Create Event', icon: <AddCircleOutlineRoundedIcon /> });
    links.push({ id: 'my-events', label: 'My Events', icon: <EditCalendarRoundedIcon /> });
  }

  if (role === 'admin') {
    links.push({ id: 'manage-users', label: 'Manage Users', icon: <ManageAccountsRoundedIcon /> });
    links.push({ id: 'create-announcement', label: 'Post Announcement', icon: <CampaignRoundedIcon /> });
  }

  links.push({ id: 'profile', label: 'Profile', icon: <PersonRoundedIcon /> });

  return links;
}

async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function EventCard({ event, onOpen }) {
  const category = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.Other;
  const capacityPct = Math.min(100, Math.round(((event.registered_count || 0) / (event.capacity || 1)) * 100));

  return (
    <Card sx={{ border: '1px solid rgba(20, 47, 86, 0.08)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2,
          color: '#fff',
          background: `linear-gradient(130deg, ${category.color}, #0f172a)`,
          borderRadius: '16px 16px 0 0',
          minHeight: 120,
          position: 'relative',
        }}
      >
        <Chip label={event.status} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', textTransform: 'capitalize' }} />
        <Typography variant="h4" sx={{ mt: 2 }}>{category.icon}</Typography>
        <Chip
          label={event.category}
          size="small"
          sx={{ position: 'absolute', right: 16, top: 16, bgcolor: 'rgba(255,255,255,0.22)', color: '#fff' }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>{event.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 42 }}>
          {event.description || 'No description provided.'}
        </Typography>

        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary"><AccessTimeRoundedIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />{dayjs(event.date).format('DD MMM YYYY')} at {dayjs(`2000-01-01 ${event.time}`).format('hh:mm A')}</Typography>
          <Typography variant="body2" color="text.secondary"><LocationOnRoundedIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />{event.venue}</Typography>
          <Typography variant="body2" color="text.secondary"><GroupsRoundedIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />{event.registered_count} / {event.capacity} registered</Typography>
        </Stack>

        <LinearProgress variant="determinate" value={capacityPct} sx={{ mb: 2, height: 7, borderRadius: 8 }} />

        <Button fullWidth variant="contained" onClick={onOpen}>View Details</Button>
      </CardContent>
    </Card>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const [authTab, setAuthTab] = useState(0);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    year: '',
    phone: '',
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    date: '',
    time: '',
    venue: '',
    capacity: 100,
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    priority: 'normal',
  });

  const [toast, setToast] = useState({ open: false, type: 'success', message: '' });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width:900px)');

  const nav = useMemo(() => getNav(user?.role), [user]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchCategory = category === 'all' || e.category === category;
      const q = search.toLowerCase().trim();
      const matchSearch = !q || [e.title, e.description, e.venue].some((x) => (x || '').toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [events, category, search]);

  const showToast = (message, type = 'success') => setToast({ open: true, type, message });

  const persistAuth = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setPage('dashboard');
  };

  const refreshData = async () => {
    if (!token || !user) return;
    setLoading(true);
    try {
      const [eventsData, annData] = await Promise.all([
        apiCall('/events', 'GET', null, token),
        apiCall('/announcements', 'GET', null, token),
      ]);
      setEvents(eventsData);
      setAnnouncements(annData);

      if (user.role === 'student') {
        const regData = await apiCall('/events/user/registrations', 'GET', null, token);
        setRegistrations(regData);
      }

      if (user.role === 'admin' || user.role === 'organizer') {
        const statsData = await apiCall('/admin/stats', 'GET', null, token);
        setStats(statsData);
      }

      if (user.role === 'admin') {
        const usersData = await apiCall('/admin/users', 'GET', null, token);
        setUsers(usersData);
      }
    } catch (err) {
      showToast(err.message, 'error');
      if (/token|unauthorized|invalid/i.test(err.message)) {
        clearAuth();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      refreshData();
    }
  }, [token, user]);

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      showToast('Please enter email and password', 'warning');
      return;
    }

    try {
      setLoading(true);
      const data = await apiCall('/auth/login', 'POST', loginForm);
      persistAuth(data.token, data.user);
      showToast(`Welcome back, ${data.user.full_name}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.full_name || !registerForm.email || !registerForm.password) {
      showToast('Please fill required fields', 'warning');
      return;
    }

    try {
      setLoading(true);
      const data = await apiCall('/auth/register', 'POST', registerForm);
      persistAuth(data.token, data.user);
      showToast('Account created successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    showToast('Logged out', 'info');
  };

  const openEvent = async (id) => {
    try {
      const fullEvent = await apiCall(`/events/${id}`, 'GET', null, token);
      setSelectedEvent(fullEvent);
      setEventDialogOpen(true);
      setRating(0);
      setComment('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const registerForEvent = async (id) => {
    try {
      await apiCall(`/events/${id}/register`, 'POST', {}, token);
      showToast('Registered successfully');
      await refreshData();
      if (selectedEvent?.id === id) openEvent(id);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const cancelRegistration = async (id) => {
    try {
      await apiCall(`/events/${id}/register`, 'DELETE', null, token);
      showToast('Registration cancelled', 'info');
      await refreshData();
      if (selectedEvent?.id === id) openEvent(id);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const submitFeedback = async () => {
    if (!selectedEvent) return;
    if (!rating) {
      showToast('Please select a rating', 'warning');
      return;
    }

    try {
      await apiCall(`/events/${selectedEvent.id}/feedback`, 'POST', { rating, comment }, token);
      showToast('Feedback submitted');
      openEvent(selectedEvent.id);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const createEvent = async () => {
    if (!eventForm.title || !eventForm.category || !eventForm.date || !eventForm.time || !eventForm.venue) {
      showToast('Please fill all required event details', 'warning');
      return;
    }

    try {
      await apiCall('/events', 'POST', eventForm, token);
      showToast('Event created successfully');
      setEventForm({
        title: '',
        description: '',
        category: 'Technical',
        date: '',
        time: '',
        venue: '',
        capacity: 100,
      });
      setPage('my-events');
      await refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteEvent = async (id) => {
    try {
      await apiCall(`/events/${id}`, 'DELETE', null, token);
      showToast('Event deleted');
      setEventDialogOpen(false);
      await refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const updateUserRole = async (id, role) => {
    try {
      await apiCall(`/admin/users/${id}/role`, 'PUT', { role }, token);
      showToast('Role updated');
      await refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const removeUser = async (id) => {
    try {
      await apiCall(`/admin/users/${id}`, 'DELETE', null, token);
      showToast('User deleted', 'info');
      await refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const createAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) {
      showToast('Title and message are required', 'warning');
      return;
    }

    try {
      await apiCall('/announcements', 'POST', announcementForm, token);
      showToast('Announcement posted');
      setAnnouncementForm({ title: '', message: '', priority: 'normal' });
      setPage('announcements');
      await refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const pageTitle = useMemo(() => {
    const found = nav.find((n) => n.id === page);
    return found?.label || 'Dashboard';
  }, [nav, page]);

  const goToPage = (targetPage) => {
    setPage(targetPage);
    if (!isDesktop) setMobileNavOpen(false);
  };

  const myEventIds = new Set(registrations.map((r) => r.event_id));
  const myEventRegs = events.filter((e) => myEventIds.has(e.id));
  const organizerEvents = events.filter((e) => e.organizer_id === user?.id);

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
          background: 'linear-gradient(140deg, #0f172a 0%, #0b3954 48%, #005f73 100%)',
        }}
      >
        <Box sx={{ p: { xs: 3, md: 8 }, color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h2" sx={{ mb: 2 }}>CampusVibe</Typography>
          <Typography variant="h6" sx={{ opacity: 0.88, maxWidth: 520, mb: 4 }}>
            A premium event command center for modern campuses. Discover, organize, and track every student event in one elegant workspace.
          </Typography>
          <Stack spacing={2}>
            {[
              'Curated events with instant registration',
              'Role-based dashboards for students, organizers, and admins',
              'Live announcements and attendance insights',
            ].map((item) => (
              <Paper key={item} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                {item}
              </Paper>
            ))}
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Card sx={{ width: '100%', maxWidth: 500, borderRadius: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Tabs value={authTab} onChange={(_, v) => setAuthTab(v)} sx={{ mb: 3 }}>
                <Tab label="Sign In" />
                <Tab label="Sign Up" />
              </Tabs>

              {authTab === 0 ? (
                <Stack spacing={2}>
                  <Typography variant="h5">Welcome back</Typography>
                  <TextField label="Email" value={loginForm.email} onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))} fullWidth />
                  <TextField label="Password" type="password" value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} fullWidth />
                  <Button variant="contained" size="large" onClick={handleLogin} disabled={loading}>Sign In</Button>
                  <Typography variant="caption" color="text.secondary">Demo admin: admin@college.edu / admin123</Typography>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Typography variant="h5">Create account</Typography>
                  <TextField label="Full Name" value={registerForm.full_name} onChange={(e) => setRegisterForm((p) => ({ ...p, full_name: e.target.value }))} fullWidth />
                  <TextField label="Email" value={registerForm.email} onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))} fullWidth />
                  <TextField label="Password" type="password" value={registerForm.password} onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))} fullWidth />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select label="Role" value={registerForm.role} onChange={(e) => setRegisterForm((p) => ({ ...p, role: e.target.value }))}>
                          <MenuItem value="student">Student</MenuItem>
                          <MenuItem value="organizer">Organizer</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Year</InputLabel>
                        <Select label="Year" value={registerForm.year} onChange={(e) => setRegisterForm((p) => ({ ...p, year: e.target.value }))}>
                          {YEARS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select label="Department" value={registerForm.department} onChange={(e) => setRegisterForm((p) => ({ ...p, department: e.target.value }))}>
                      {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                    </Select>
                  </FormControl>

                  <TextField label="Phone" value={registerForm.phone} onChange={(e) => setRegisterForm((p) => ({ ...p, phone: e.target.value }))} fullWidth />
                  <Button variant="contained" size="large" onClick={handleRegister} disabled={loading}>Create Account</Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'rgba(242, 246, 251, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(18, 38, 67, 0.08)',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ minHeight: '72px !important' }}>
          {!isDesktop && (
            <IconButton sx={{ mr: 1 }} onClick={() => setMobileNavOpen(true)}>
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Typography variant="h5" sx={{ flexGrow: 1 }}>{pageTitle}</Typography>
          <TextField
            size="small"
            placeholder="Search events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: 160, sm: 260 } }}
          />
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid rgba(18, 38, 67, 0.08)',
            p: 1.5,
          },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          sx={{ display: { xs: 'block', md: 'none' } }}
          ModalProps={{ keepMounted: true }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>🎓</Avatar>
                <Box>
                  <Typography variant="h6">CampusVibe</Typography>
                  <Typography variant="caption" color="text.secondary">Event Command Center</Typography>
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ mb: 1 }} />

            <List sx={{ px: 1 }}>
              {nav.map((item) => (
                <ListItemButton
                  key={item.id}
                  selected={page === item.id}
                  onClick={() => goToPage(item.id)}
                  sx={{
                    mb: 0.4,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: '#fff',
                      '& .MuiListItemIcon-root': { color: '#fff' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>

            <Box sx={{ mt: 'auto', p: 2 }}>
              <Paper sx={{ p: 1.8, mb: 1.5, border: '1px solid rgba(18, 38, 67, 0.08)' }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Avatar sx={{ bgcolor: user.avatar_color || '#0A9396' }}>{user.full_name?.charAt(0)}</Avatar>
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="subtitle2" noWrap>{user.full_name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{user.role}</Typography>
                  </Box>
                </Stack>
              </Paper>
              <Button variant="outlined" color="inherit" fullWidth startIcon={<LogoutRoundedIcon />} onClick={handleLogout}>Logout</Button>
            </Box>
          </Box>
        </Drawer>

        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' } }} open>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main' }}>🎓</Avatar>
            <Box>
              <Typography variant="h6">CampusVibe</Typography>
              <Typography variant="caption" color="text.secondary">Event Command Center</Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ mb: 1 }} />

        <List sx={{ px: 1 }}>
          {nav.map((item) => (
            <ListItemButton
              key={item.id}
              selected={page === item.id}
              onClick={() => goToPage(item.id)}
              sx={{
                mb: 0.4,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ mt: 'auto', p: 2 }}>
          <Paper sx={{ p: 1.8, mb: 1.5, border: '1px solid rgba(18, 38, 67, 0.08)' }}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar sx={{ bgcolor: user.avatar_color || '#0A9396' }}>{user.full_name?.charAt(0)}</Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="subtitle2" noWrap>{user.full_name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{user.role}</Typography>
              </Box>
            </Stack>
          </Paper>
          <Button variant="outlined" color="inherit" fullWidth startIcon={<LogoutRoundedIcon />} onClick={handleLogout}>Logout</Button>
        </Box>
          </Box>
        </Drawer>
      </Box>

      <Box component="main" sx={{ ml: { md: `${DRAWER_WIDTH}px` }, pt: '88px', px: { xs: 1.5, sm: 2, md: 3 }, pb: 3 }}>
        <Container maxWidth="xl" disableGutters>
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {page === 'dashboard' && (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                {(user.role === 'student'
                  ? [
                      { label: 'Upcoming Events', value: events.filter((e) => e.status === 'upcoming').length, icon: <CelebrationRoundedIcon /> },
                      { label: 'My Registrations', value: registrations.filter((r) => r.status === 'confirmed').length, icon: <EventAvailableRoundedIcon /> },
                      { label: 'Attended', value: registrations.filter((r) => r.status === 'attended').length, icon: <StarRoundedIcon /> },
                      { label: 'Active Announcements', value: announcements.length, icon: <CampaignRoundedIcon /> },
                    ]
                  : [
                      { label: 'Total Users', value: stats?.totalUsers || 0, icon: <PersonRoundedIcon /> },
                      { label: 'Total Events', value: stats?.totalEvents || 0, icon: <EventRoundedIcon /> },
                      { label: 'Registrations', value: stats?.totalRegistrations || 0, icon: <InsightsRoundedIcon /> },
                      { label: 'Upcoming', value: stats?.upcomingEvents || 0, icon: <CelebrationRoundedIcon /> },
                    ]).map((s) => (
                  <Grid item xs={12} sm={6} lg={3} key={s.label}>
                    <Card sx={{ border: '1px solid rgba(20, 47, 86, 0.08)' }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography color="text.secondary" variant="body2">{s.label}</Typography>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 34, height: 34 }}>{s.icon}</Avatar>
                        </Stack>
                        <Typography variant="h4">{s.value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} lg={8}>
                  <Card sx={{ border: '1px solid rgba(20, 47, 86, 0.08)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Upcoming Events</Typography>
                      <Grid container spacing={2}>
                        {events.slice(0, 4).map((ev) => (
                          <Grid item xs={12} sm={6} key={ev.id}>
                            <EventCard event={ev} onOpen={() => openEvent(ev.id)} />
                          </Grid>
                        ))}
                        {!events.length && <Typography color="text.secondary">No events available.</Typography>}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} lg={4}>
                  <Card sx={{ border: '1px solid rgba(20, 47, 86, 0.08)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Recent Announcements</Typography>
                      <Stack spacing={1.5}>
                        {announcements.slice(0, 5).map((a) => (
                          <Paper key={a.id} variant="outlined" sx={{ p: 1.5 }}>
                            <Typography variant="subtitle2">{a.title}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                              {a.priority} priority
                            </Typography>
                          </Paper>
                        ))}
                        {!announcements.length && <Typography color="text.secondary">No announcements yet.</Typography>}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          )}

          {page === 'events' && (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel>Category</InputLabel>
                  <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <MenuItem value="all">All Categories</MenuItem>
                    {Array.from(new Set(events.map((e) => e.category))).map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="outlined" onClick={() => { setCategory('all'); setSearch(''); }}>Clear Filters</Button>
              </Stack>

              <Grid container spacing={2}>
                {filteredEvents.map((ev) => (
                  <Grid item xs={12} md={6} xl={4} key={ev.id}>
                    <EventCard event={ev} onOpen={() => openEvent(ev.id)} />
                  </Grid>
                ))}
                {!filteredEvents.length && <Typography color="text.secondary">No events match your filters.</Typography>}
              </Grid>
            </Stack>
          )}

          {page === 'announcements' && (
            <Stack spacing={1.5}>
              {announcements.map((a) => (
                <Card key={a.id} sx={{ border: '1px solid rgba(20, 47, 86, 0.08)' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Box>
                        <Typography variant="h6">{a.title}</Typography>
                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>{a.message}</Typography>
                      </Box>
                      <Chip label={a.priority} sx={{ textTransform: 'capitalize' }} color={a.priority === 'urgent' ? 'error' : a.priority === 'high' ? 'warning' : 'default'} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                      By {a.author_name || 'Admin'} · {dayjs(a.created_at).format('DD MMM YYYY, hh:mm A')}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
              {!announcements.length && <Typography color="text.secondary">No announcements available.</Typography>}
            </Stack>
          )}

          {page === 'my-registrations' && user.role === 'student' && (
            <Stack spacing={1.5}>
              {registrations.map((r) => (
                <Card key={`${r.event_id}-${r.id}`} sx={{ border: '1px solid rgba(20, 47, 86, 0.08)' }}>
                  <CardContent>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                      <Box>
                        <Typography variant="h6">{r.title}</Typography>
                        <Typography color="text.secondary">{dayjs(r.date).format('DD MMM YYYY')} · {dayjs(`2000-01-01 ${r.time}`).format('hh:mm A')} · {r.venue}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={r.status} color={r.status === 'confirmed' ? 'success' : 'default'} sx={{ textTransform: 'capitalize' }} />
                        {r.status === 'confirmed' && (
                          <Button color="error" variant="outlined" onClick={() => cancelRegistration(r.event_id)}>Cancel</Button>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              {!registrations.length && <Typography color="text.secondary">You have no registrations yet.</Typography>}
            </Stack>
          )}

          {page === 'create-event' && (user.role === 'organizer' || user.role === 'admin') && (
            <Card sx={{ border: '1px solid rgba(20, 47, 86, 0.08)', maxWidth: 880 }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>Create New Event</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Title" value={eventForm.title} onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth multiline minRows={3} label="Description" value={eventForm.description} onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select label="Category" value={eventForm.category} onChange={(e) => setEventForm((p) => ({ ...p, category: e.target.value }))}>
                        {Object.keys(CATEGORY_CONFIG).map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Venue" value={eventForm.venue} onChange={(e) => setEventForm((p) => ({ ...p, venue: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={eventForm.date} onChange={(e) => setEventForm((p) => ({ ...p, date: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth type="time" label="Time" InputLabelProps={{ shrink: true }} value={eventForm.time} onChange={(e) => setEventForm((p) => ({ ...p, time: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth type="number" label="Capacity" value={eventForm.capacity} onChange={(e) => setEventForm((p) => ({ ...p, capacity: Number(e.target.value || 1) }))} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" size="large" onClick={createEvent}>Publish Event</Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {page === 'my-events' && (user.role === 'organizer' || user.role === 'admin') && (
            <Grid container spacing={2}>
              {organizerEvents.map((ev) => (
                <Grid item xs={12} md={6} xl={4} key={ev.id}>
                  <EventCard event={ev} onOpen={() => openEvent(ev.id)} />
                </Grid>
              ))}
              {!organizerEvents.length && <Typography color="text.secondary">No events created yet.</Typography>}
            </Grid>
          )}

          {page === 'manage-users' && user.role === 'admin' && (
            <Card sx={{ border: '1px solid rgba(20, 47, 86, 0.08)' }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>User Management</Typography>
                <Stack spacing={1}>
                  {users.map((u) => (
                    <Paper key={u.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={1.5}>
                        <Box>
                          <Typography variant="subtitle1">{u.full_name}</Typography>
                          <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select value={u.role} onChange={(e) => updateUserRole(u.id, e.target.value)}>
                              <MenuItem value="student">Student</MenuItem>
                              <MenuItem value="organizer">Organizer</MenuItem>
                              <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                          </FormControl>
                          <Button color="error" variant="outlined" onClick={() => removeUser(u.id)}>Delete</Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          {page === 'create-announcement' && user.role === 'admin' && (
            <Card sx={{ border: '1px solid rgba(20, 47, 86, 0.08)', maxWidth: 860 }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>Post Announcement</Typography>
                <Stack spacing={2}>
                  <TextField label="Title" value={announcementForm.title} onChange={(e) => setAnnouncementForm((p) => ({ ...p, title: e.target.value }))} fullWidth />
                  <TextField label="Message" value={announcementForm.message} onChange={(e) => setAnnouncementForm((p) => ({ ...p, message: e.target.value }))} multiline minRows={4} fullWidth />
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select label="Priority" value={announcementForm.priority} onChange={(e) => setAnnouncementForm((p) => ({ ...p, priority: e.target.value }))}>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="contained" onClick={createAnnouncement}>Post Announcement</Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {page === 'profile' && (
            <Card sx={{ border: '1px solid rgba(20, 47, 86, 0.08)', maxWidth: 900 }}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                  <Avatar sx={{ width: 88, height: 88, bgcolor: user.avatar_color || 'primary.main', fontSize: 34 }}>{user.full_name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="h4">{user.full_name}</Typography>
                    <Typography color="text.secondary">{user.email}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip label={user.role} sx={{ textTransform: 'capitalize' }} color="primary" />
                      {user.department && <Chip label={user.department} variant="outlined" />}
                      {user.year && <Chip label={user.year} variant="outlined" />}
                    </Stack>
                  </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography color="text.secondary" variant="body2">Events Available</Typography>
                      <Typography variant="h4">{events.length}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography color="text.secondary" variant="body2">My Registrations</Typography>
                      <Typography variant="h4">{registrations.length}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography color="text.secondary" variant="body2">Announcements</Typography>
                      <Typography variant="h4">{announcements.length}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>

      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">{selectedEvent?.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{selectedEvent?.category}</Typography>
            </Box>
            <Chip label={selectedEvent?.status} sx={{ textTransform: 'capitalize' }} />
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Stack spacing={2}>
              <Typography color="text.secondary">{selectedEvent.description || 'No description available.'}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Chip icon={<AccessTimeRoundedIcon />} label={`${dayjs(selectedEvent.date).format('DD MMM YYYY')} · ${dayjs(`2000-01-01 ${selectedEvent.time}`).format('hh:mm A')}`} />
                <Chip icon={<LocationOnRoundedIcon />} label={selectedEvent.venue} />
                <Chip icon={<GroupsRoundedIcon />} label={`${selectedEvent.registered_count}/${selectedEvent.capacity}`} />
              </Stack>

              <Divider />

              <Typography variant="subtitle1">Reviews</Typography>
              <Stack spacing={1}>
                {(selectedEvent.feedback || []).map((f) => (
                  <Paper key={f.id} variant="outlined" sx={{ p: 1.2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: f.avatar_color }}>{f.full_name.charAt(0)}</Avatar>
                      <Typography variant="body2" fontWeight={700}>{f.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">{f.comment || 'No comment'}</Typography>
                  </Paper>
                ))}
                {!selectedEvent.feedback?.length && <Typography color="text.secondary">No feedback yet.</Typography>}
              </Stack>

              {user.role === 'student' && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Leave Feedback</Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Tooltip title={`${n} star${n > 1 ? 's' : ''}`} key={n}>
                        <IconButton color={n <= rating ? 'warning' : 'default'} onClick={() => setRating(n)}>
                          <StarRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Stack>
                  <TextField fullWidth multiline minRows={2} placeholder="Write your review..." value={comment} onChange={(e) => setComment(e.target.value)} />
                  <Button sx={{ mt: 1 }} variant="contained" onClick={submitFeedback}>Submit Feedback</Button>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {user.role === 'admin' && selectedEvent && (
            <Button color="error" onClick={() => deleteEvent(selectedEvent.id)}>Delete Event</Button>
          )}
          {user.role === 'student' && selectedEvent && (
            myEventRegs.some((e) => e.id === selectedEvent.id)
              ? <Button color="error" variant="outlined" onClick={() => cancelRegistration(selectedEvent.id)}>Cancel Registration</Button>
              : <Button variant="contained" onClick={() => registerForEvent(selectedEvent.id)} disabled={(selectedEvent.registered_count || 0) >= selectedEvent.capacity}>Register</Button>
          )}
          <Button onClick={() => setEventDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3200} onClose={() => setToast((p) => ({ ...p, open: false }))}>
        <Alert severity={toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : toast.type === 'info' ? 'info' : 'success'} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
