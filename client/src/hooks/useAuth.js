import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../utils/api';

export function useAuth(options = {}) {
  const { redirectTo = null, requireAuth = false } = options;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await authApi.validateToken();
      setUser(userData);

      // Redirect if already logged in (for login/signup pages)
      if (userData && redirectTo) {
        navigate(redirectTo);
      }

      // Redirect if auth required but not logged in
      if (!userData && requireAuth) {
        navigate('/login');
      }
    } catch (error) {
      console.error('인증 확인 실패:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, redirectTo, requireAuth]);

  useEffect(() => {
    checkAuth();

    // Listen for storage events (login/logout from other components)
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [checkAuth]);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    setUser(data.user);
    window.dispatchEvent(new Event('storage'));

    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  }, [navigate]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.userType === 'admin',
    login,
    logout,
    checkAuth,
  };
}

export default useAuth;
