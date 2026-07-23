import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { SplashScreen } from '../components/feedback/SplashScreen';
import { DashboardPage } from '../pages/DashboardPage';
import { ErrorPage } from '../pages/ErrorPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { BooksPage } from '../pages/BooksPage';
import { CreateEditBookPage } from '../pages/CreateEditBookPage';
import { BookDetailsPage } from '../pages/BookDetailsPage';
import { MyBooksPage } from '../pages/MyBooksPage';
import { BorrowHistoryPage } from '../pages/BorrowHistoryPage';
import { WishlistPage } from '../pages/WishlistPage';
import { MyReviewsPage } from '../pages/MyReviewsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ManageBooksPage } from '../pages/admin/ManageBooksPage';
import { ManageUsersPage } from '../pages/admin/ManageUsersPage';
import { ManageBorrowsPage } from '../pages/admin/ManageBorrowsPage';
import { ManageReservationsPage } from '../pages/admin/ManageReservationsPage';
import { ReviewManagementPage } from '../pages/admin/ReviewManagementPage';
import { useAuth } from '../hooks/useAuth';

export const AppRouter = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    if (!showSplash) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 2400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showSplash]);

  useEffect(() => {
    if (showSplash || isLoading) {
      return;
    }

    if (isAuthenticated && location.pathname === '/login') {
      navigate('/', { replace: true });
      return;
    }

    if (!isAuthenticated && location.pathname === '/') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate, showSplash]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path='/' element={<DashboardPage />} />
          <Route path='/books' element={<BooksPage />} />
          <Route path='/books/:id' element={<BookDetailsPage />} />
          <Route path='/books/create' element={<CreateEditBookPage />} />
          <Route path='/books/:id/edit' element={<CreateEditBookPage />} />
          <Route path='/my-books' element={<MyBooksPage />} />
          <Route path='/wishlist' element={<WishlistPage />} />
          <Route path='/my-reviews' element={<MyReviewsPage />} />
          <Route path='/borrow-history' element={<BorrowHistoryPage />} />
          <Route path='/reports' element={<ReportsPage />} />

          <Route element={<AdminRoute />}>
            <Route path='/admin' element={<AdminDashboard />} />
            <Route path='/admin/books' element={<ManageBooksPage />} />
            <Route path='/admin/users' element={<ManageUsersPage />} />
            <Route path='/admin/borrows' element={<ManageBorrowsPage />} />
            <Route path='/admin/reservations' element={<ManageReservationsPage />} />
            <Route path='/admin/reviews' element={<ReviewManagementPage />} />
          </Route>
        </Route>
      </Route>

      <Route path='/404' element={<NotFoundPage />} />
      <Route path='/error' element={<ErrorPage />} />
      <Route path='*' element={<Navigate to='/404' replace />} />
    </Routes>
  );
};
