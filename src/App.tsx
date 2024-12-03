import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme, SxProps, Theme } from '@mui/material/styles';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import CustomerList from './pages/CustomerList';
import TrainingList from './pages/TrainingList';
import CalendarPage from './pages/Calendar';
import StatisticsPage from './pages/Statistics';

declare module '@mui/material/styles' {
  interface Components {
    MuiDataGrid: {
      styleOverrides: {
        root: SxProps<Theme>;
        columnHeader: SxProps<Theme>;
      };
    };
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      dark: '#1d4ed8',
      light: '#60a5fa',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0284c7',
      dark: '#0369a1',
      light: '#38bdf8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#334155',
    },
  },
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.04)',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: '2px solid #2563eb',
            outlineOffset: '-1px',
          },
        },
        columnHeader: {
          backgroundColor: '#f1f5f9',
          color: '#0f172a',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#2563eb',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&:focus-visible': {
            outline: '2px solid #2563eb',
            outlineOffset: 2,
          },
        },
        containedSecondary: {
          backgroundColor: '#0284c7',
          '&:hover': {
            backgroundColor: '#0369a1',
          },
        },
      },
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      color: '#0f172a',
    },
    body1: {
      color: '#334155',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="bottom-center" expand={true} richColors />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<CustomerList />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/trainings" element={<TrainingList />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
