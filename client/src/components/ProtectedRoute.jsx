import { Navigate, Outlet } from 'react-router-dom';
export default function ProtectedRoute() { return sessionStorage.getItem('record_token') ? <Outlet /> : <Navigate to="/login" replace />; }
