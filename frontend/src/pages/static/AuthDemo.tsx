'use client';

import { AuthForm } from "@/components/ui/auth-form";

const AuthDemo = () => {
    const handleSuccess = (userData: { email: string; name?: string }) => {
        console.log('Auth successful:', userData);
        alert(`Welcome ${userData.name || userData.email}!`);
    };

    const handleClose = () => {
        console.log('Auth form closed');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-muted">
            <div className="max-w-md w-full">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Authentication Demo</h1>
                    <p className="text-muted-foreground">
                        Test the comprehensive auth form with login, signup, and password reset flows
                    </p>
                </div>

                <div className="bg-card border border-border shadow-2xl rounded-2xl overflow-hidden">
                    <AuthForm
                        onSuccess={handleSuccess}
                        onClose={handleClose}
                        initialMode="login"
                    />
                </div>

                <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm">
                    <h3 className="font-semibold mb-2">Features:</h3>
                    <ul className="space-y-1 text-muted-foreground">
                        <li>✓ Login & Signup modes</li>
                        <li>✓ Password reset flow</li>
                        <li>✓ Email verification step</li>
                        <li>✓ Real-time validation</li>
                        <li>✓ Password strength indicator</li>
                        <li>✓ Remember me functionality</li>
                        <li>✓ Accessibility (ARIA labels)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AuthDemo;
