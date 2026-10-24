import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import api from './services/api';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function EntryRedirect() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(Boolean(sessionStorage.getItem('record_token')));
  useEffect(() => {
    if (!sessionStorage.getItem('record_token')) { setChecking(false); return; }
    let alive = true;
    api.get('/onboarding').then(({data}) => {
      if (!alive) return;
      const status = data.completionStatus || data.entry?.completionStatus || 'in_progress';
      sessionStorage.setItem('record_completion_status', status);
      navigate(status === 'completed' ? '/dashboard' : '/onboarding/1', {replace:true});
    }).catch(() => {
      if (alive) navigate('/login', {replace:true});
    }).finally(() => { if (alive) setChecking(false); });
    return () => { alive = false; };
  }, [navigate]);
  if (checking) return <div className="loading-page">Loading your Record profile…</div>;
  return sessionStorage.getItem('record_token')
    ? <Navigate to={sessionStorage.getItem('record_completion_status') === 'completed' ? '/dashboard' : '/onboarding/1'} replace />
    : <Navigate to="/signup" replace />;
}
export default function App(){
 return <BrowserRouter><Routes>
  <Route path="/" element={<EntryRedirect/>}/>
  <Route path="/signup" element={<Auth mode="signup"/>}/>
  <Route path="/login" element={<Auth mode="login"/>}/>
  <Route element={<ProtectedRoute/>}>
   <Route path="/onboarding/:stepNumber" element={<Onboarding/>}/>
   <Route path="/dashboard" element={<Dashboard/>}/>
  </Route>
  <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes></BrowserRouter>
}
