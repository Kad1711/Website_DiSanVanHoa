import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '14px' },
            success: { style: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' } },
            error:   { style: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
