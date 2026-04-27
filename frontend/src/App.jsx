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
  const capacityColor = capacityPct >= 90 ? '#ef4444' : capacityPct >= 70 ? '#f59e0b' : '#10b981';
  const eventDate = dayjs(event.date);
  const isUpcoming = eventDate.isAfter(dayjs());
  const isPast = eventDate.isBefore(dayjs(), 'day');

  return (
    <Card
      sx={{
        border: '1px solid rgba(20, 47, 86, 0.08)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 20px 40px rgba(16, 45, 75, 0.15)',
          borderColor: `${category.color}30`,
        },
        '&:hover .card-header-shine': {
          opacity: 1,
        },
        '&:hover .card-icon': {
          transform: 'scale(1.15) rotate(-5deg)',
        },
      }}
      onClick={onOpen}
    >
      <Box
        sx={{
          p: 2,
          color: '#fff',
          background: `linear-gradient(130deg, ${category.color}, #0f172a)`,
          borderRadius: '16px 16px 0 0',
          minHeight: 120,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circle */}
        <Box sx={{
          position: 'absolute', top: -30, right: -30, width: 120, height: 120,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -20, left: '50%', width: 80, height: 80,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)',
        }} />
        {/* Hover shine overlay */}
        <Box
          className="card-header-shine"
          sx={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)',
            opacity: 0, transition: 'opacity 0.4s ease',
          }}
        />
        <Stack direction="row" spacing={0.8} sx={{ position: 'relative', zIndex: 1 }}>
          <Chip label={event.status} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', textTransform: 'capitalize' }} />
          {capacityPct >= 90 && <Chip label="Almost Full" size="small" sx={{ bgcolor: 'rgba(239,68,68,0.5)', color: '#fff' }} />}
        </Stack>
        <Typography
          className="card-icon"
          variant="h4"
          sx={{ mt: 2, position: 'relative', zIndex: 1, transition: 'transform 0.35s ease', display: 'inline-block' }}
        >
          {category.icon}
        </Typography>
        <Chip
          label={event.category}
          size="small"
          sx={{ position: 'absolute', right: 16, top: 16, bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', zIndex: 1 }}
        />
        {/* Date badge */}
        <Box sx={{
          position: 'absolute', right: 16, bottom: 12,
          bgcolor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)',
          borderRadius: '10px', px: 1.2, py: 0.5, textAlign: 'center',
          zIndex: 1,
        }}>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1, display: 'block', color: 'rgba(255,255,255,0.7)' }}>
            {eventDate.format('MMM')}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#fff' }}>
            {eventDate.format('DD')}
          </Typography>
        </Box>
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ mb: 0.5, lineHeight: 1.3 }}>{event.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 42, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {event.description || 'No description provided.'}
        </Typography>

        <Stack spacing={0.8} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeRoundedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">{dayjs(event.date).format('DD MMM YYYY')} at {dayjs(`2000-01-01 ${event.time}`).format('hh:mm A')}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocationOnRoundedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary" noWrap>{event.venue}</Typography>
          </Stack>
        </Stack>

        <Box sx={{ mt: 'auto' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: capacityColor }}>
              {event.registered_count} / {event.capacity}
            </Typography>
            <Typography variant="caption" color="text.disabled">{capacityPct}% filled</Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={capacityPct}
            sx={{
              mb: 2, height: 6, borderRadius: 8,
              bgcolor: `${capacityColor}18`,
              '& .MuiLinearProgress-bar': { bgcolor: capacityColor, borderRadius: 8 },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            sx={{
              background: `linear-gradient(135deg, ${category.color}, ${category.color}cc)`,
              '&:hover': { background: `linear-gradient(135deg, ${category.color}ee, ${category.color})`, boxShadow: `0 4px 14px ${category.color}40` },
            }}
          >
            View Details
          </Button>
        </Box>
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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
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

  const eventCategories = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.category).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchCategory = category === 'all' || e.category === category;
      const q = search.toLowerCase().trim();
      const matchSearch = !q || [e.title, e.description, e.venue].some((x) => (x || '').toLowerCase().includes(q));
      const hideCancelled = e.status !== 'cancelled';
      return matchCategory && matchSearch && hideCancelled;
    }).sort((a, b) => {
      const aDate = dayjs(`${a.date || ''} ${a.time || '00:00'}`);
      const bDate = dayjs(`${b.date || ''} ${b.time || '00:00'}`);
      return aDate.valueOf() - bDate.valueOf();
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

  const openStudentDetails = (student) => {
    setSelectedStudent(student);
    setStudentDialogOpen(true);
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
  const dashboardCards = user?.role === 'student'
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
      ];
  const dashboardEvents = events.filter((e) => e.status !== 'cancelled').slice(0, 4);

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

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ═══ ENHANCED SIDEBAR ═══ */}
      {/* ═══════════════════════════════════════════════════════ */}
      {(() => {
        const mainNavItems = nav.filter(n => ['dashboard', 'events', 'announcements'].includes(n.id));
        const actionNavItems = nav.filter(n => ['create-event', 'my-events', 'my-registrations', 'create-announcement'].includes(n.id));
        const adminNavItems = nav.filter(n => ['manage-users'].includes(n.id));
        const profileNavItem = nav.find(n => n.id === 'profile');

        const sidebarContent = (
          <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, #0f172a 0%, #1a2740 40%, #1e293b 100%)',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative bg elements */}
            <Box sx={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(0,109,119,0.08)' }} />
            <Box sx={{ position: 'absolute', bottom: 80, left: -40, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(10,147,150,0.06)' }} />

            {/* ─── Brand Header ─── */}
            <Box sx={{ p: 2.5, position: 'relative', zIndex: 1 }}>
              <Box sx={{
                p: 2,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(0,109,119,0.2) 0%, rgba(10,147,150,0.1) 100%)',
                border: '1px solid rgba(0,109,119,0.25)',
                backdropFilter: 'blur(10px)',
              }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{
                    width: 44, height: 44, borderRadius: '14px',
                    background: 'linear-gradient(135deg, #006D77, #0A9396)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem',
                    boxShadow: '0 4px 14px rgba(0,109,119,0.4)',
                  }}>
                    🎓
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#fff', letterSpacing: '-0.3px' }}>
                      CampusVibe
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                      EVENT COMMAND CENTER
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* ─── Navigation ─── */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, position: 'relative', zIndex: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4 } }}>
              {/* Main Section */}
              <Typography variant="overline" sx={{ px: 1.5, pt: 1, pb: 0.5, display: 'block', color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', letterSpacing: '1.5px' }}>
                MAIN
              </Typography>
              <List disablePadding>
                {mainNavItems.map((item) => (
                  <ListItemButton
                    key={item.id}
                    selected={page === item.id}
                    onClick={() => goToPage(item.id)}
                    sx={{
                      mb: 0.5,
                      borderRadius: '12px',
                      py: 1,
                      color: 'rgba(255,255,255,0.6)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0, top: '50%', transform: 'translateY(-50%)',
                        width: 3, height: 0,
                        bgcolor: '#0A9396',
                        borderRadius: '0 4px 4px 0',
                        transition: 'height 0.3s ease',
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.06)',
                        color: '#fff',
                        '&::before': { height: '60%' },
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(0,109,119,0.2)',
                        color: '#fff',
                        boxShadow: '0 0 20px rgba(0,109,119,0.15)',
                        '& .MuiListItemIcon-root': { color: '#0A9396' },
                        '&::before': { height: '60%' },
                        '&:hover': { bgcolor: 'rgba(0,109,119,0.25)' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: 'rgba(255,255,255,0.4)', transition: 'color 0.3s ease' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: page === item.id ? 700 : 500 }} />
                    {page === item.id && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0A9396', boxShadow: '0 0 8px rgba(10,147,150,0.6)' }} />}
                  </ListItemButton>
                ))}
              </List>

              {/* Actions Section */}
              {actionNavItems.length > 0 && (
                <>
                  <Typography variant="overline" sx={{ px: 1.5, pt: 2, pb: 0.5, display: 'block', color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', letterSpacing: '1.5px' }}>
                    ACTIONS
                  </Typography>
                  <List disablePadding>
                    {actionNavItems.map((item) => (
                      <ListItemButton
                        key={item.id}
                        selected={page === item.id}
                        onClick={() => goToPage(item.id)}
                        sx={{
                          mb: 0.5,
                          borderRadius: '12px',
                          py: 1,
                          color: 'rgba(255,255,255,0.6)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0, top: '50%', transform: 'translateY(-50%)',
                            width: 3, height: 0,
                            bgcolor: '#0A9396',
                            borderRadius: '0 4px 4px 0',
                            transition: 'height 0.3s ease',
                          },
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.06)',
                            color: '#fff',
                            '&::before': { height: '60%' },
                          },
                          '&.Mui-selected': {
                            bgcolor: 'rgba(0,109,119,0.2)',
                            color: '#fff',
                            boxShadow: '0 0 20px rgba(0,109,119,0.15)',
                            '& .MuiListItemIcon-root': { color: '#0A9396' },
                            '&::before': { height: '60%' },
                            '&:hover': { bgcolor: 'rgba(0,109,119,0.25)' },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: 'rgba(255,255,255,0.4)', transition: 'color 0.3s ease' }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: page === item.id ? 700 : 500 }} />
                        {page === item.id && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0A9396', boxShadow: '0 0 8px rgba(10,147,150,0.6)' }} />}
                      </ListItemButton>
                    ))}
                  </List>
                </>
              )}

              {/* Admin Section */}
              {adminNavItems.length > 0 && (
                <>
                  <Typography variant="overline" sx={{ px: 1.5, pt: 2, pb: 0.5, display: 'block', color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', letterSpacing: '1.5px' }}>
                    ADMIN
                  </Typography>
                  <List disablePadding>
                    {adminNavItems.map((item) => (
                      <ListItemButton
                        key={item.id}
                        selected={page === item.id}
                        onClick={() => goToPage(item.id)}
                        sx={{
                          mb: 0.5,
                          borderRadius: '12px',
                          py: 1,
                          color: 'rgba(255,255,255,0.6)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0, top: '50%', transform: 'translateY(-50%)',
                            width: 3, height: 0,
                            bgcolor: '#0A9396',
                            borderRadius: '0 4px 4px 0',
                            transition: 'height 0.3s ease',
                          },
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.06)',
                            color: '#fff',
                            '&::before': { height: '60%' },
                          },
                          '&.Mui-selected': {
                            bgcolor: 'rgba(0,109,119,0.2)',
                            color: '#fff',
                            boxShadow: '0 0 20px rgba(0,109,119,0.15)',
                            '& .MuiListItemIcon-root': { color: '#0A9396' },
                            '&::before': { height: '60%' },
                            '&:hover': { bgcolor: 'rgba(0,109,119,0.25)' },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: 'rgba(255,255,255,0.4)', transition: 'color 0.3s ease' }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: page === item.id ? 700 : 500 }} />
                        {page === item.id && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0A9396', boxShadow: '0 0 8px rgba(10,147,150,0.6)' }} />}
                      </ListItemButton>
                    ))}
                  </List>
                </>
              )}

              {/* Profile */}
              {profileNavItem && (
                <>
                  <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
                  <List disablePadding>
                    <ListItemButton
                      selected={page === 'profile'}
                      onClick={() => goToPage('profile')}
                      sx={{
                        mb: 0.5,
                        borderRadius: '12px',
                        py: 1,
                        color: 'rgba(255,255,255,0.6)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0, top: '50%', transform: 'translateY(-50%)',
                          width: 3, height: 0,
                          bgcolor: '#0A9396',
                          borderRadius: '0 4px 4px 0',
                          transition: 'height 0.3s ease',
                        },
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.06)',
                          color: '#fff',
                          '&::before': { height: '60%' },
                        },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(0,109,119,0.2)',
                          color: '#fff',
                          boxShadow: '0 0 20px rgba(0,109,119,0.15)',
                          '& .MuiListItemIcon-root': { color: '#0A9396' },
                          '&::before': { height: '60%' },
                          '&:hover': { bgcolor: 'rgba(0,109,119,0.25)' },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: 'rgba(255,255,255,0.4)', transition: 'color 0.3s ease' }}>{profileNavItem.icon}</ListItemIcon>
                      <ListItemText primary={profileNavItem.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: page === 'profile' ? 700 : 500 }} />
                      {page === 'profile' && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0A9396', boxShadow: '0 0 8px rgba(10,147,150,0.6)' }} />}
                    </ListItemButton>
                  </List>
                </>
              )}
            </Box>

            {/* ─── Bottom Section ─── */}
            <Box sx={{ p: 2, position: 'relative', zIndex: 1 }}>
              {/* User Profile Card */}
              <Box sx={{
                p: 1.5,
                mb: 1.5,
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': { background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)' },
              }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box sx={{
                    p: '2px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #006D77, #0A9396, #94D2BD)',
                  }}>
                    <Avatar sx={{
                      bgcolor: user.avatar_color || '#0A9396',
                      width: 38, height: 38,
                      fontSize: '1rem',
                      fontWeight: 700,
                      border: '2px solid #0f172a',
                    }}>
                      {user.full_name?.charAt(0)}
                    </Avatar>
                  </Box>
                  <Box sx={{ overflow: 'hidden', flex: 1 }}>
                    <Typography variant="subtitle2" noWrap sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{user.full_name}</Typography>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{
                        height: 20, fontSize: '0.65rem', fontWeight: 600,
                        textTransform: 'capitalize',
                        bgcolor: user.role === 'admin' ? 'rgba(239,68,68,0.2)' : user.role === 'organizer' ? 'rgba(245,158,11,0.2)' : 'rgba(10,147,150,0.2)',
                        color: user.role === 'admin' ? '#fca5a5' : user.role === 'organizer' ? '#fcd34d' : '#94D2BD',
                        borderRadius: '6px',
                      }}
                    />
                  </Box>
                </Stack>
              </Box>

              {/* Logout Button */}
              <Button
                variant="outlined"
                fullWidth
                startIcon={<LogoutRoundedIcon />}
                onClick={handleLogout}
                sx={{
                  borderRadius: '12px',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                  py: 1,
                  fontSize: '0.85rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'rgba(239,68,68,0.4)',
                    color: '#fca5a5',
                    bgcolor: 'rgba(239,68,68,0.08)',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        );

        return (
          <Box
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                bgcolor: 'transparent',
                borderRight: 'none',
                overflow: 'hidden',
              },
            }}
          >
            <Drawer
              variant="temporary"
              open={mobileNavOpen}
              onClose={() => setMobileNavOpen(false)}
              sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: 'none' } }}
              ModalProps={{ keepMounted: true }}
            >
              {sidebarContent}
            </Drawer>

            <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' } }} open>
              {sidebarContent}
            </Drawer>
          </Box>
        );
      })()}

      <Box component="main" sx={{ ml: { md: `${DRAWER_WIDTH}px` }, pt: '88px', px: { xs: 1.5, sm: 2, md: 3 }, pb: 3 }}>
        <Container maxWidth="xl" disableGutters>
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {page === 'dashboard' && (
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
                  gap: 2,
                }}
              >
                {dashboardCards.map((s) => (
                  <Box key={s.label}>
                    <Card sx={{ border: '1px solid rgba(20, 47, 86, 0.08)' }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography color="text.secondary" variant="body2">{s.label}</Typography>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 34, height: 34 }}>{s.icon}</Avatar>
                        </Stack>
                        <Typography variant="h4">{s.value}</Typography>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(0, 1fr)' },
                  gap: 2,
                }}
              >
                <Box>
                  <Card sx={{ border: '1px solid rgba(20, 47, 86, 0.08)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Upcoming Events</Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                          gap: 2,
                        }}
                      >
                        {dashboardEvents.map((ev) => (
                          <Box key={ev.id}>
                            <EventCard event={ev} onOpen={() => openEvent(ev.id)} />
                          </Box>
                        ))}
                        {!dashboardEvents.length && <Typography color="text.secondary">No events available.</Typography>}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
                <Box>
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
                </Box>
              </Box>
            </Stack>
          )}

          {page === 'events' && (
            <Stack spacing={3}>
              {/* ─── Events Hero Banner ─── */}
              <Box
                sx={{
                  borderRadius: '22px',
                  overflow: 'hidden',
                  p: { xs: 3, sm: 4 },
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #0b3954 75%, #005f73 100%)',
                  color: '#fff',
                  position: 'relative',
                  minHeight: 140,
                }}
              >
                {/* Decoratives */}
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />
                <Box sx={{ position: 'absolute', bottom: -30, left: '30%', width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)' }} />
                <Box sx={{ position: 'absolute', top: 20, right: 60, width: 50, height: 50, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem' }, mb: 0.5 }}>
                      🎉 Discover Events
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 480 }}>
                      Browse upcoming campus events, filter by category, and register in one click.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1.5}>
                    <Paper sx={{ bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', px: 2.5, py: 1.5, borderRadius: '14px', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800 }}>{events.filter(e => e.status === 'upcoming').length}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Upcoming</Typography>
                    </Paper>
                    <Paper sx={{ bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', px: 2.5, py: 1.5, borderRadius: '14px', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800 }}>{events.length}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Total</Typography>
                    </Paper>
                  </Stack>
                </Stack>
              </Box>

              {/* ─── Category Pill Filters ─── */}
              <Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Chip
                    label="All Events"
                    onClick={() => setCategory('all')}
                    sx={{
                      px: 1.5, py: 2.5, fontSize: '0.88rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer',
                      border: category === 'all' ? '2px solid #006D77' : '2px solid transparent',
                      bgcolor: category === 'all' ? 'rgba(0,109,119,0.1)' : 'rgba(0,0,0,0.03)',
                      color: category === 'all' ? '#006D77' : 'text.primary',
                      transition: 'all 0.25s ease',
                      '&:hover': { bgcolor: 'rgba(0,109,119,0.08)', transform: 'translateY(-2px)' },
                    }}
                  />
                  {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                    const count = events.filter(e => e.category === key && e.status !== 'cancelled').length;
                    return (
                      <Chip
                        key={key}
                        label={`${cfg.icon}  ${key}${count ? ` (${count})` : ''}`}
                        onClick={() => setCategory(key)}
                        sx={{
                          px: 1, py: 2.5, fontSize: '0.88rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer',
                          border: category === key ? `2px solid ${cfg.color}` : '2px solid transparent',
                          bgcolor: category === key ? `${cfg.color}14` : 'rgba(0,0,0,0.03)',
                          color: category === key ? cfg.color : 'text.primary',
                          transition: 'all 0.25s ease',
                          '&:hover': { bgcolor: `${cfg.color}1A`, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${cfg.color}25` },
                        }}
                      />
                    );
                  })}

                  {/* Results counter */}
                  <Box sx={{ ml: { md: 'auto' }, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {(category !== 'all' || search) && (
                      <Button size="small" variant="outlined" onClick={() => { setCategory('all'); setSearch(''); }} sx={{ borderRadius: '10px' }}>
                        Clear Filters
                      </Button>
                    )}
                    <Chip
                      label={`${filteredEvents.length} event${filteredEvents.length === 1 ? '' : 's'}`}
                      size="small"
                      sx={{ bgcolor: 'rgba(0,109,119,0.08)', color: '#006D77', fontWeight: 700 }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* ─── Event Cards Grid ─── */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
                  gap: 2.5,
                }}
              >
                {filteredEvents.map((ev) => (
                  <Box key={ev.id} sx={{ animation: 'fadeInUp 0.4s ease forwards', '@keyframes fadeInUp': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                    <EventCard event={ev} onOpen={() => openEvent(ev.id)} />
                  </Box>
                ))}
                {!filteredEvents.length && (
                  <Card sx={{ border: '1px solid rgba(20, 47, 86, 0.08)', gridColumn: '1 / -1', textAlign: 'center', py: 6 }}>
                    <CardContent>
                      <Typography variant="h1" sx={{ fontSize: '4rem', mb: 1 }}>🔍</Typography>
                      <Typography variant="h6" sx={{ mb: 1 }}>No events found</Typography>
                      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                        {search
                          ? `No events match "${search}". Try a different search or clear your filters.`
                          : 'There are no events in this category yet. Check back later or explore all categories!'}
                      </Typography>
                      <Button variant="outlined" onClick={() => { setCategory('all'); setSearch(''); }}>
                        View All Events
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </Box>
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

          {page === 'create-event' && (user.role === 'organizer' || user.role === 'admin') && (() => {
            const cat = CATEGORY_CONFIG[eventForm.category] || CATEGORY_CONFIG.Other;
            const capacityPct = 0;
            const formComplete = eventForm.title && eventForm.category && eventForm.date && eventForm.time && eventForm.venue;
            return (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' }, gap: 3, alignItems: 'start' }}>
              {/* ─── Left Column: Form ─── */}
              <Stack spacing={3}>
                {/* Hero Header */}
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: '22px',
                    overflow: 'hidden',
                    p: { xs: 3, sm: 4 },
                    background: `linear-gradient(135deg, ${cat.color} 0%, #0f172a 60%, #1e293b 100%)`,
                    color: '#fff',
                    transition: 'background 0.6s ease',
                    minHeight: 170,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                  }}
                >
                  {/* Decorative circles */}
                  <Box sx={{
                    position: 'absolute', top: -40, right: -40, width: 200, height: 200,
                    borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)',
                  }} />
                  <Box sx={{
                    position: 'absolute', bottom: -30, left: '40%', width: 140, height: 140,
                    borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)',
                  }} />

                  <Typography variant="h3" sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem' }, mb: 0.5, position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: '2.4rem', marginRight: 12 }}>{cat.icon}</span>
                    Create New Event
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.82, maxWidth: 500, position: 'relative', zIndex: 1 }}>
                    Fill in the details below to publish a new event. Your attendees will see a beautiful card just like the preview.
                  </Typography>
                </Box>

                {/* Section 1: Basic Info */}
                <Card sx={{
                  border: '1px solid rgba(20, 47, 86, 0.08)',
                  position: 'relative',
                  overflow: 'visible',
                  '&::before': {
                    content: '"📝"',
                    position: 'absolute',
                    top: -16,
                    left: 24,
                    width: 36,
                    height: 36,
                    bgcolor: '#fff',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(20,47,86,0.06)',
                  },
                }}>
                  <CardContent sx={{ pt: 3.5 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.5, mb: 0.5, display: 'block' }}>
                      Basic Information
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2.5 }}>What's your event about?</Typography>

                    <Stack spacing={2.5}>
                      <TextField
                        fullWidth
                        label="Event Title"
                        placeholder="e.g. Annual Hackathon 2026"
                        value={eventForm.title}
                        onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CelebrationRoundedIcon sx={{ color: cat.color, fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { minHeight: 50 } }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Description"
                        placeholder="Tell attendees what to expect, what they'll learn, and why they shouldn't miss it..."
                        value={eventForm.description}
                        onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))}
                      />

                      {/* Category Pill Grid */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                          Event Category
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                            <Chip
                              key={key}
                              label={`${cfg.icon}  ${key}`}
                              onClick={() => setEventForm((p) => ({ ...p, category: key }))}
                              sx={{
                                cursor: 'pointer',
                                px: 1,
                                py: 2.5,
                                fontSize: '0.88rem',
                                fontWeight: 600,
                                borderRadius: '12px',
                                border: eventForm.category === key ? `2px solid ${cfg.color}` : '2px solid transparent',
                                bgcolor: eventForm.category === key ? `${cfg.color}14` : 'rgba(0,0,0,0.03)',
                                color: eventForm.category === key ? cfg.color : 'text.primary',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                  bgcolor: `${cfg.color}1A`,
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 4px 12px ${cfg.color}30`,
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Section 2: Schedule & Location */}
                <Card sx={{
                  border: '1px solid rgba(20, 47, 86, 0.08)',
                  position: 'relative',
                  overflow: 'visible',
                  '&::before': {
                    content: '"📍"',
                    position: 'absolute',
                    top: -16,
                    left: 24,
                    width: 36,
                    height: 36,
                    bgcolor: '#fff',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(20,47,86,0.06)',
                  },
                }}>
                  <CardContent sx={{ pt: 3.5 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.5, mb: 0.5, display: 'block' }}>
                      Schedule & Location
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2.5 }}>When and where?</Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Event Date"
                          InputLabelProps={{ shrink: true }}
                          value={eventForm.date}
                          onChange={(e) => setEventForm((p) => ({ ...p, date: e.target.value }))}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EventRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { minHeight: 50 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="time"
                          label="Start Time"
                          InputLabelProps={{ shrink: true }}
                          value={eventForm.time}
                          onChange={(e) => setEventForm((p) => ({ ...p, time: e.target.value }))}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTimeRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { minHeight: 50 } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Venue"
                          placeholder="e.g. Main Auditorium, Block A, 2nd Floor"
                          value={eventForm.venue}
                          onChange={(e) => setEventForm((p) => ({ ...p, venue: e.target.value }))}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOnRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { minHeight: 50 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Section 3: Capacity & Publish */}
                <Card sx={{
                  border: '1px solid rgba(20, 47, 86, 0.08)',
                  position: 'relative',
                  overflow: 'visible',
                  '&::before': {
                    content: '"👥"',
                    position: 'absolute',
                    top: -16,
                    left: 24,
                    width: 36,
                    height: 36,
                    bgcolor: '#fff',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(20,47,86,0.06)',
                  },
                }}>
                  <CardContent sx={{ pt: 3.5 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.5, mb: 0.5, display: 'block' }}>
                      Capacity & Publish
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2.5 }}>Final details</Typography>

                    <Stack spacing={2.5}>
                      <Box>
                        <TextField
                          fullWidth
                          type="number"
                          label="Max Capacity"
                          value={eventForm.capacity}
                          onChange={(e) => setEventForm((p) => ({ ...p, capacity: Number(e.target.value || 1) }))}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <GroupsRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { minHeight: 50 } }}
                          helperText={`Up to ${eventForm.capacity} attendees can register`}
                        />
                      </Box>

                      {/* Readiness indicator */}
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: '14px',
                          bgcolor: formComplete ? 'rgba(5,150,105,0.06)' : 'rgba(234,88,12,0.06)',
                          borderColor: formComplete ? 'rgba(5,150,105,0.25)' : 'rgba(234,88,12,0.25)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{
                            width: 10, height: 10, borderRadius: '50%',
                            bgcolor: formComplete ? '#059669' : '#ea580c',
                            boxShadow: formComplete ? '0 0 8px rgba(5,150,105,0.5)' : '0 0 8px rgba(234,88,12,0.5)',
                          }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: formComplete ? '#059669' : '#ea580c' }}>
                            {formComplete ? 'Ready to publish!' : 'Fill in all required fields to publish'}
                          </Typography>
                        </Stack>
                        {!formComplete && (
                          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                            {!eventForm.title && <Chip label="Title" size="small" color="warning" variant="outlined" />}
                            {!eventForm.date && <Chip label="Date" size="small" color="warning" variant="outlined" />}
                            {!eventForm.time && <Chip label="Time" size="small" color="warning" variant="outlined" />}
                            {!eventForm.venue && <Chip label="Venue" size="small" color="warning" variant="outlined" />}
                          </Stack>
                        )}
                      </Paper>

                      <Button
                        variant="contained"
                        size="large"
                        onClick={createEvent}
                        disabled={!formComplete}
                        startIcon={<AddCircleOutlineRoundedIcon />}
                        sx={{
                          py: 1.8,
                          fontSize: '1rem',
                          background: formComplete
                            ? `linear-gradient(135deg, ${cat.color}, #0f172a)`
                            : undefined,
                          transition: 'all 0.4s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 24px ${cat.color}40`,
                          },
                        }}
                      >
                        Publish Event
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>

              {/* ─── Right Column: Live Preview ─── */}
              <Box sx={{ position: { lg: 'sticky' }, top: { lg: 100 } }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.5, mb: 1.5, display: 'block', px: 0.5 }}>
                  Live Preview
                </Typography>

                <Card
                  sx={{
                    border: '1px solid rgba(20, 47, 86, 0.08)',
                    transition: 'all 0.4s ease',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      color: '#fff',
                      background: `linear-gradient(130deg, ${cat.color}, #0f172a)`,
                      borderRadius: '16px 16px 0 0',
                      minHeight: 120,
                      position: 'relative',
                      transition: 'background 0.5s ease',
                    }}
                  >
                    <Chip label="upcoming" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', textTransform: 'capitalize' }} />
                    <Typography variant="h4" sx={{ mt: 2 }}>{cat.icon}</Typography>
                    <Chip
                      label={eventForm.category}
                      size="small"
                      sx={{ position: 'absolute', right: 16, top: 16, bgcolor: 'rgba(255,255,255,0.22)', color: '#fff' }}
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {eventForm.title || 'Event Title'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 42, fontStyle: eventForm.description ? 'normal' : 'italic', opacity: eventForm.description ? 1 : 0.5 }}>
                      {eventForm.description || 'Your event description will appear here...'}
                    </Typography>

                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <AccessTimeRoundedIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
                        {eventForm.date ? dayjs(eventForm.date).format('DD MMM YYYY') : '—'} at {eventForm.time ? dayjs(`2000-01-01 ${eventForm.time}`).format('hh:mm A') : '—'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <LocationOnRoundedIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
                        {eventForm.venue || 'Venue TBD'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <GroupsRoundedIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
                        0 / {eventForm.capacity} registered
                      </Typography>
                    </Stack>

                    <LinearProgress variant="determinate" value={capacityPct} sx={{ mb: 2, height: 7, borderRadius: 8 }} />

                    <Button fullWidth variant="contained" disabled>View Details</Button>
                  </CardContent>
                </Card>

                {/* Tips Card */}
                <Paper
                  variant="outlined"
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: 'rgba(2,132,199,0.04)',
                    borderColor: 'rgba(2,132,199,0.15)',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#0284c7' }}>
                    💡 Tips for a Great Event
                  </Typography>
                  <Stack spacing={0.8}>
                    <Typography variant="caption" color="text.secondary">• Use a clear, catchy title that grabs attention</Typography>
                    <Typography variant="caption" color="text.secondary">• Include what attendees will gain in the description</Typography>
                    <Typography variant="caption" color="text.secondary">• Set capacity slightly above expected turnout</Typography>
                    <Typography variant="caption" color="text.secondary">• Include building, room number & floor in venue</Typography>
                  </Stack>
                </Paper>
              </Box>
            </Box>
            );
          })()}

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

              {(user.role === 'admin' || user.role === 'organizer') && (
                <>
                  <Divider />
                  <Typography variant="subtitle1">Registered Students</Typography>
                  <Stack spacing={1}>
                    {(selectedEvent.registrations || []).length > 0 ? (
                      selectedEvent.registrations.map((r) => (
                        <Paper key={r.id} variant="outlined" sx={{ p: 1.25 }}>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            justifyContent="space-between"
                            alignItems={{ sm: 'center' }}
                          >
                            <Box>
                              <Button
                                variant="text"
                                sx={{ px: 0, minWidth: 0, textTransform: 'none', fontWeight: 600 }}
                                onClick={() => openStudentDetails(r)}
                              >
                                {r.full_name}
                              </Button>
                              <Typography variant="body2" color="text.secondary">{r.email}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {r.department || 'Department not set'}{r.year ? ` · ${r.year}` : ''}
                              </Typography>
                            </Box>
                            <Chip
                              label={r.status || 'confirmed'}
                              size="small"
                              color={r.status === 'cancelled' ? 'default' : 'success'}
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </Stack>
                        </Paper>
                      ))
                    ) : (
                      <Typography color="text.secondary">No student registrations yet.</Typography>
                    )}
                  </Stack>
                </>
              )}

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

      <Dialog open={studentDialogOpen} onClose={() => setStudentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent dividers>
          {selectedStudent && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: selectedStudent.avatar_color || 'primary.main' }}>
                  {selectedStudent.full_name?.charAt(0) || 'S'}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedStudent.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedStudent.email}</Typography>
                </Box>
              </Stack>

              <Divider />

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Department</Typography>
                  <Typography variant="body2">{selectedStudent.department || 'Not set'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Year</Typography>
                  <Typography variant="body2">{selectedStudent.year || 'Not set'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body2">{selectedStudent.phone || 'Not set'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Role</Typography>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{selectedStudent.role || 'student'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Registration Status</Typography>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{selectedStudent.status || 'confirmed'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Registered On</Typography>
                  <Typography variant="body2">
                    {selectedStudent.registered_at ? dayjs(selectedStudent.registered_at).format('DD MMM YYYY, hh:mm A') : 'Not available'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Joined Platform</Typography>
                  <Typography variant="body2">
                    {selectedStudent.user_created_at ? dayjs(selectedStudent.user_created_at).format('DD MMM YYYY') : 'Not available'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Student ID</Typography>
                  <Typography variant="body2">#{selectedStudent.user_id}</Typography>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStudentDialogOpen(false)}>Close</Button>
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
