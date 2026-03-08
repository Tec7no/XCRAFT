import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from './ui/auth-form';
import { User as UserType } from '../types';

interface AuthPageProps {
  onLogin: (user: UserType) => void;
  onCancel: () => void;
}

// Auth page component
const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onCancel }) => {
  const navigate = useNavigate();

  const handleAuthSuccess = (userData: { email: string; name?: string; password?: string }) => {
    const normalizedEmail = userData.email.trim().toLowerCase();

    // Get admin credentials from storage or use defaults
    const adminCreds = JSON.parse(localStorage.getItem('admin_credentials') || JSON.stringify({
      email: 'admin@xcraft.com',
      password: 'Admin@2025!'
    }));

    // Check if admin credentials
    if (normalizedEmail === adminCreds.email.toLowerCase() && userData.password === adminCreds.password) {
      // Login as admin and redirect to dashboard
      onLogin({
        id: 'admin-user',
        name: 'Admin',
        email: normalizedEmail,
        role: 'admin'
      });
      return;
    }

    // Regular customer login
    onLogin({
      id: userData.email, // Use email as unique ID for mock persistence
      name: userData.name || userData.email.split('@')[0],
      email: normalizedEmail,
      role: 'customer'
    });
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
