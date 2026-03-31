import * as React from 'react';
import { AuthForm } from './ui/auth-form';
import { setStorageItem } from '../utils/storage';

interface AuthPageProps {
  onLogin: (user: any) => void;
  onCancel: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onCancel }) => {

  const handleAuthSuccess = (userData: any) => {
    const user = {
      id: userData.id || userData.email,
      name: userData.name || userData.email.split('@')[0],
      email: userData.email.trim().toLowerCase(),
      role: userData.role || 'customer',
      phone: userData.phone,
      token: userData.token,
    };

    // Save to localStorage first
    setStorageItem('user', user);
    window.dispatchEvent(new CustomEvent('townteam_storage', { detail: { key: 'townteam_user' } }));

    // Pass user WITH token to App.tsx
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-2xl rounded-2xl overflow-hidden">
        <AuthForm
          onSuccess={handleAuthSuccess}
          onClose={onCancel}
          initialMode="login"
        />
      </div>
    </div>
  );
};

export default AuthPage;
