import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CoursePage from './pages/CoursePage';
import ChapterStagePage from './pages/ChapterStagePage';
import ProfilePage from './pages/ProfilePage';

const theme = createTheme({
  palette: {
    primary:   { main: '#2E3A8C' },
    secondary: { main: '#E89B3F' },
    success:   { main: '#3E7C5A' },
    error:     { main: '#B43A2E' },
    warning:   { main: '#E89B3F' },
    background: { default: '#F6F1E6', paper: '#FBF7EE' },
    text: { primary: '#15161E', secondary: '#5C5D6C' },
  },
  typography: {
    fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { background: '#F6F1E6' } } },
  },
});

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <ProgressProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="courses/:slug" element={<CoursePage />} />
                <Route path="courses/:slug/chapters/:chapterId" element={<ChapterStagePage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
