'use client';

import * as React from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import { useState, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/i18n/LanguageContext';
import {
    Mail,
    Lock,
    User as UserIcon,
    Eye,
    EyeOff,
    Shield,
    AlertTriangle,
    KeyRound,
    Phone,
    Loader2,
    ArrowLeft,
} from 'lucide-react';
import { User as UserType } from '../../types';

// Types
type AuthMode = 'login' | 'signup' | 'reset';
type RegistrationStep = 'details' | 'verification' | 'complete';

const ALLOWED_DOMAINS = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'me.com', 'live.com', 'xcraft.com'];

interface AuthFormProps {
    /**
     * Callback triggered when authentication is successful
     */
    onSuccess?: (userData: { email: string; name?: string; password?: string; token?: string; role?: string; id?: string; phone?: string }) => void;
    /**
     * Callback triggered when the form should close
     */
    onClose?: () => void;
    /**
     * Initial authentication mode
     * @default 'login'
     */
    initialMode?: AuthMode;
    /**
     * Additional CSS classes
     */
    className?: string;
}

interface FormData {
    name?: never;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    agreeToTerms: boolean;
    rememberMe: boolean;
    verificationCode: string;
}

interface FormErrors {
    name?: never;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
    agreeToTerms?: string;
    general?: string;
    verificationCode?: string;
}

// Password strength utility
interface PasswordStrength {
    score: number;
    feedback: string[];
    requirements: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        number: boolean;
        special: boolean;
    };
}

const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const feedback: string[] = [];

    if (!requirements.length) feedback.push('At least 8 characters');
    if (!requirements.uppercase) feedback.push('One uppercase letter');
    if (!requirements.lowercase) feedback.push('One lowercase letter');
    if (!requirements.number) feedback.push('One number');
    if (!requirements.special) feedback.push('One special character');

    return { score, feedback, requirements };
};

// Password Strength Indicator Component
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
    const strength = calculatePasswordStrength(password);

    const getStrengthColor = (score: number) => {
        if (score <= 1) return 'text-destructive';
        if (score <= 2) return 'text-orange-500';
        if (score <= 3) return 'text-yellow-500';
        if (score <= 4) return 'text-blue-500';
        return 'text-primary';
    };

    const getStrengthText = (score: number) => {
        if (score <= 1) return 'Very Weak';
        if (score <= 2) return 'Weak';
        if (score <= 3) return 'Fair';
        if (score <= 4) return 'Good';
        return 'Strong';
    };

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2 animate-in fade-in-50 slide-in-from-bottom-1">
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-full ${getStrengthColor(strength.score)} bg-current rounded-full`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                </div>
                <span className="text-xs text-muted-foreground min-w-[60px]">
                    {getStrengthText(strength.score)}
                </span>
            </div>
            {strength.feedback.length > 0 && (
                <div className="grid grid-cols-2 gap-1">
                    {strength.feedback.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-1 text-xs text-amber-500 dark:text-amber-400"
                        >
                            <AlertTriangle className="h-3 w-3" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * AuthForm - A comprehensive authentication form component
 *
 * A customizable authentication form supporting login, signup, and password reset
 * flows with real-time validation and password strength indicators.
 */
export function AuthForm({
    onSuccess,
    onClose,
    initialMode = 'login',
    className,
}: AuthFormProps) {
    // Language context
    const { lang, t } = useLanguage();
    const isRTL = lang === 'ar';

    // State
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
    const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('details');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        agreeToTerms: false,
        rememberMe: false,
        verificationCode: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});

    // Reset form state utility
    const resetFormState = useCallback(() => {
        setSuccessMessage("");
        setErrors({});
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            agreeToTerms: false,
            rememberMe: false,
            verificationCode: ""
        });
    }, []);

    // Load saved email on mount
    React.useEffect(() => {
        const savedEmail = localStorage.getItem('userEmail');
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        if (savedEmail && authMode === 'login') {
            setFormData(prev => ({ ...prev, email: savedEmail, rememberMe }));
        }
    }, [authMode]);

    // Field validation
    const validateField = useCallback((field: keyof FormData, value: string | boolean) => {
        let error = '';

        switch (field) {
            case 'firstName':
                if (typeof value === 'string' && authMode === 'signup' && !value.trim()) {
                    error = 'First name is required';
                }
                break;
            case 'lastName':
                if (typeof value === 'string' && authMode === 'signup' && !value.trim()) {
                    error = 'Last name is required';
                }
                break;

            case 'email':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    error = 'Email is required';
                } else if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address';
                } else if (typeof value === 'string') {
                    const domain = value.split('@')[1]?.toLowerCase();
                    // Only enforce allowed domains for SIGNUP, allow any for login (legacy support)
                    if (authMode === 'signup' && !ALLOWED_DOMAINS.includes(domain)) {
                        error = 'Please use a valid provider (Gmail, Outlook, etc.)';
                    }
                }
                break;

            case 'password':
                if (!value) {
                    error = 'Password is required';
                } else if (typeof value === 'string') {
                    if (value.length < 8) {
                        error = 'Password must be at least 8 characters';
                    } else if (authMode === 'signup') {
                        const strength = calculatePasswordStrength(value);
                        if (strength.score < 3) {
                            error = 'Password is too weak';
                        }
                    }
                }
                break;

            case 'confirmPassword':
                if (authMode === 'signup' && value !== formData.password) {
                    error = 'Passwords do not match';
                }
                break;

            case 'phone':
                if (typeof value === 'string' && value && !/^\+?[\d\s\-()]+$/.test(value)) {
                    error = 'Please enter a valid phone number';
                }
                break;

            case 'verificationCode':
                if (typeof value === 'string' && authMode === 'signup' && registrationStep === 'verification' && !/^\d{6}$/.test(value)) {
                    error = 'Verification code must be 6 digits';
                }
                break;

            case 'agreeToTerms':
                if (authMode === 'signup' && !value) {
                    error = 'You must agree to the terms and conditions';
                }
                break;
        }

        return error;
    }, [formData.password, authMode, registrationStep]);

    // Handle input changes with real-time validation
    const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Real-time validation for touched fields
        if (fieldTouched[field]) {
            const error = validateField(field, value);
            setErrors(prev => ({ ...prev, [field]: error || undefined }));
        }
    }, [fieldTouched, validateField]);

    // Handle field blur (mark as touched)
    const handleFieldBlur = useCallback((field: keyof FormData) => {
        setFieldTouched(prev => ({ ...prev, [field]: true }));
        const value = formData[field];
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }, [formData, validateField]);

    // Validate form
    const validateForm = useCallback(() => {
        const newErrors: FormErrors = {};
        const fieldsToValidate: (keyof FormData)[] = ['email', 'password'];

        if (authMode === 'signup') {
            fieldsToValidate.push('name', 'confirmPassword', 'agreeToTerms');
        }

        if (registrationStep === 'verification') {
            fieldsToValidate.push('verificationCode');
        }

        fieldsToValidate.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [authMode, registrationStep, formData, validateField]);

    // Handle form submission - this would be replaced with your actual authentication logic
    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {

            // =========================
            // LOGIN
            // =========================
            if (authMode === "login") {

                const res = await fetch("http://localhost:5000/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    })
                });

                const data = await res.json();

                if (!data.success) {
                    setErrors({ general: data.message });
                    return;
                }

                setSuccessMessage("Login successful");

                onSuccess?.({
                    email: data.user.email,
                    name: data.user.name,
                    token: data.token,
                    role: data.user.role,
                    id: data.user.id,
                    phone: data.user.phone,
                });

            }

            // =========================
            // SIGNUP
            // =========================
            else if (authMode === "signup") {

                if (registrationStep === "details") {

                    const res = await fetch("http://localhost:5000/auth/send-otp", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: formData.email
                        })
                    });

                    const data = await res.json();

                    if (!data.success) {
                        setErrors({ general: data.message });
                        return;
                    }

                    setRegistrationStep("verification");
                    setSuccessMessage("OTP sent to your email");

                }

                else if (registrationStep === "verification") {
                    console.log(formData.verificationCode)
                    const verifyRes = await fetch("http://localhost:5000/auth/verify-otp", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: formData.email,
                            otp: formData.verificationCode
                        })
                    });

                    const verifyData = await verifyRes.json();

                    if (!verifyData.success) {
                        setErrors({ general: verifyData.message });
                        return;
                    }

                    const signupRes = await fetch("http://localhost:5000/auth/signup", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name: `${formData.firstName} ${formData.lastName}`.trim(),
                            email: formData.email,
                            password: formData.password,
                            confirmPassword: formData.confirmPassword,
                            phone: formData.phone
                        })
                    });

                    const signupData = await signupRes.json();

                    if (!signupData.success) {
                        setErrors({ general: signupData.message });
                        return;
                    }

                    setSuccessMessage("Account created successfully");

                    onSuccess?.({
                        email: signupData.user.email,
                        name: signupData.user.name,
                        token: signupData.token,
                        role: signupData.user.role,
                        id: signupData.user.id,
                        phone: signupData.user.phone,
                    });

                }

            }

        } catch (error) {

            setErrors({
                general: "Server error"
            });

        } finally {

            setIsLoading(false);

        }

    };

    // Render auth form content based on mode and step
    const renderAuthContent = () => {

        if (authMode === "reset") {

            const handleResetSubmit = async () => {

                if (!formData.email) {
                    setErrors({ general: "Please enter your email" });
                    return;
                }

                try {

                    setIsLoading(true);
                    setErrors({});
                    setSuccessMessage("");

                    const res = await fetch("http://localhost:5000/auth/forgot-password", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: formData.email
                        })
                    });

                    const data = await res.json();

                    // الرسالة اللي جاية من الباك
                    setSuccessMessage(data.message);

                    // يرجع للوجين بعد 5 ثواني
                    setTimeout(() => {
                        resetFormState();
                        setAuthMode("login");
                    }, 5000);

                } catch (error) {

                    console.error("Reset password error:", error);

                    setErrors({
                        general: "Server error. Please try again."
                    });

                } finally {

                    setIsLoading(false);

                }
            };

            return (

                <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-5">

                    <div className="text-center mb-6 pt-4">
                        <KeyRound className="h-10 w-10 text-primary mx-auto mb-3 opacity-80" />
                    </div>
                    <div>
                        <div className="relative">

                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                            <input
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-muted/50 border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-input"
                            />

                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleResetSubmit}
                        disabled={isLoading || !formData.email}
                        className="w-full relative bg-primary text-primary-foreground font-medium py-3 px-6 rounded-xl hover:opacity-90 disabled:opacity-50"
                    >

                        <span className="flex items-center justify-center gap-2">

                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <KeyRound className="h-5 w-5" />
                                    Send Reset Link
                                </>
                            )}

                        </span>

                    </button>

                    <div className="text-center">

                        <button
                            type="button"
                            onClick={() => {
                                resetFormState();
                                setAuthMode("login");
                            }}
                            className="text-primary hover:text-primary/80 text-sm"
                        >
                            Back to Login
                        </button>

                    </div>

                </div>
            );
        }

        // Email verification step
        if (authMode === 'signup' && registrationStep === 'verification') {
            return (
                <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-5">
                    <div className="text-center mb-6">
                        <Mail className="h-12 w-12 text-primary mx-auto mb-3" />
                        <h3 className="text-xl font-semibold mb-2">Verify Your Email</h3>
                        <p className="text-muted-foreground text-sm">
                            We've sent a 6-digit code to <span className="font-medium">{formData.email}</span>
                        </p>
                    </div>

                    <div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={formData.verificationCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    handleInputChange('verificationCode', value);
                                }}
                                onBlur={() => handleFieldBlur('verificationCode')}
                                className={cn(
                                    "w-full text-center py-3 px-4 bg-muted/50 border rounded-xl text-2xl font-mono tracking-widest placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                    errors.verificationCode ? "border-destructive" : "border-input"
                                )}
                                maxLength={6}
                                aria-label="Verification Code"
                                aria-describedby={errors.verificationCode ? 'code-error' : undefined}
                            />
                            {errors.verificationCode && (
                                <p
                                    id="code-error"
                                    className="text-destructive text-xs mt-1 flex items-center gap-1 justify-center"
                                >
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.verificationCode}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || formData.verificationCode.length !== 6}
                        className={cn(
                            "w-full relative bg-primary text-primary-foreground font-medium py-3 px-6 rounded-xl transition-all",
                            "hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/20",
                            "disabled:opacity-50"
                        )}
                    >
                        <span className="flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Email"}
                        </span>
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setRegistrationStep('details')}
                            className="text-primary hover:text-primary/80 text-sm transition-colors"
                        >
                            Back to Details
                        </button>
                    </div>
                </div>
            );
        }

        // Registration complete step
        if (authMode === 'signup' && registrationStep === 'complete') {
            return (
                <div className="text-center space-y-6 animate-in fade-in-50 slide-in-from-right-5">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold mb-2">Welcome Aboard!</h3>
                        <p className="text-muted-foreground">
                            Your account has been created successfully.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className={cn(
                            "w-full bg-primary text-primary-foreground font-medium py-3 px-6 rounded-xl",
                            "hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        )}
                    >
                        Get Started
                    </button>
                </div>
            );
        }

        // Default login/signup form
        return (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-5">
                {authMode === 'signup' && (
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                onBlur={() => handleFieldBlur('firstName')}
                                className={cn(
                                    "w-full pl-10 pr-4 py-3 bg-muted/50 border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                    errors.firstName ? "border-destructive" : "border-input"
                                )}
                                aria-label="First Name"
                                aria-describedby={errors.firstName ? 'firstname-error' : undefined}
                            />
                            {errors.firstName && (
                                <p
                                    id="firstname-error"
                                    className="text-destructive text-xs mt-1 flex items-center gap-1"
                                >
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.firstName}
                                </p>
                            )}
                        </div>
                        <div className="relative flex-1">
                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                onBlur={() => handleFieldBlur('lastName')}
                                className={cn(
                                    "w-full pl-10 pr-4 py-3 bg-muted/50 border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                    errors.lastName ? "border-destructive" : "border-input"
                                )}
                                aria-label="Last Name"
                                aria-describedby={errors.lastName ? 'lastname-error' : undefined}
                            />
                            {errors.lastName && (
                                <p
                                    id="lastname-error"
                                    className="text-destructive text-xs mt-1 flex items-center gap-1"
                                >
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.lastName}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            onBlur={() => handleFieldBlur('email')}
                            className={cn(
                                "w-full pl-10 pr-4 py-3 bg-muted/50 border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                errors.email ? "border-destructive" : "border-input"
                            )}
                            aria-label="Email Address"
                            aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        {errors.email && (
                            <p
                                id="email-error"
                                className="text-destructive text-xs mt-1 flex items-center gap-1"
                            >
                                <AlertTriangle className="h-3 w-3" />
                                {errors.email}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            onBlur={() => handleFieldBlur('password')}
                            className={cn(
                                "w-full pl-10 pr-12 py-3 bg-muted/50 border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                errors.password ? "border-destructive" : "border-input"
                            )}
                            aria-label="Password"
                            aria-describedby={errors.password ? 'password-error' : undefined}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        {errors.password && (
                            <p
                                id="password-error"
                                className="text-destructive text-xs mt-1 flex items-center gap-1"
                            >
                                <AlertTriangle className="h-3 w-3" />
                                {errors.password}
                            </p>
                        )}
                    </div>
                    {authMode === 'signup' && (
                        <PasswordStrengthIndicator password={formData.password} />
                    )}
                </div>

                {authMode === 'signup' && (
                    <div>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                onBlur={() => handleFieldBlur('confirmPassword')}
                                className={cn(
                                    "w-full pl-10 pr-12 py-3 bg-muted/50 border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                    errors.confirmPassword ? "border-destructive" : "border-input"
                                )}
                                aria-label="Confirm Password"
                                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                            {errors.confirmPassword && (
                                <p
                                    id="confirm-password-error"
                                    className="text-destructive text-xs mt-1 flex items-center gap-1"
                                >
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {authMode === 'signup' && (
                    <div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="tel"
                                placeholder="Phone Number (Optional)"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                onBlur={() => handleFieldBlur('phone')}
                                className={cn(
                                    "w-full pl-10 pr-4 py-3 bg-muted/50 border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                    errors.phone ? "border-destructive" : "border-input"
                                )}
                                aria-label="Phone Number"
                                aria-describedby={errors.phone ? 'phone-error' : undefined}
                            />
                            {errors.phone && (
                                <p
                                    id="phone-error"
                                    className="text-destructive text-xs mt-1 flex items-center gap-1"
                                >
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.phone}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    {authMode === 'login' ? (
                        <>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                                    aria-label="Remember me"
                                    className="w-4 h-4 rounded border-input bg-muted text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-sm text-muted-foreground">Remember me</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setAuthMode('reset')}
                                className="text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                                Forgot password?
                            </button>
                        </>
                    ) : (
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.agreeToTerms}
                                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                                className="w-4 h-4 mt-0.5 rounded border-input bg-muted text-primary focus:ring-primary focus:ring-offset-0"
                                aria-describedby={errors.agreeToTerms ? 'terms-error' : undefined}
                            />
                            <span className="text-sm text-muted-foreground">
                                I agree to the{' '}
                                <a href="#" className="text-primary hover:underline transition-colors">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-primary hover:underline transition-colors">
                                    Privacy Policy
                                </a>
                            </span>
                        </label>
                    )}
                </div>

                {errors.agreeToTerms && (
                    <p
                        id="terms-error"
                        className="text-destructive text-xs flex items-center gap-1"
                    >
                        <AlertTriangle className="h-3 w-3" />
                        {errors.agreeToTerms}
                    </p>
                )}

                {/* CAPTCHA */}
                <div className="flex justify-center">
                    <ReCAPTCHA
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                        onChange={(token) => setCaptchaToken(token)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !captchaToken}
                    className={cn(
                        "w-full relative bg-primary text-primary-foreground font-medium py-3 px-6 rounded-xl transition-all",
                        "hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/20",
                        "disabled:opacity-50"
                    )}
                >
                    <span className="flex items-center justify-center gap-2">
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            authMode === 'login' ? 'Sign In' : 'Create Account'
                        )}
                    </span>
                </button>
            </div>
        );
    };

    return (
        <div
            className={cn("p-6", className)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
        >
            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-400/30 rounded-xl flex items-center gap-2 animate-in fade-in-0 slide-in-from-top-5">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-700 dark:text-green-300 text-sm">{successMessage}</span>
                </div>
            )}

            {/* Error Message */}
            {errors.general && (
                <div className="mb-4 p-3 bg-destructive/20 border border-destructive/30 rounded-xl flex items-center gap-2 animate-in fade-in-0 slide-in-from-top-5">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-destructive text-sm">{errors.general}</span>
                </div>
            )}

            {/* Header */}
            <div className="text-center mb-8">
                <h2
                    id="auth-title"
                    className="text-2xl font-bold mb-2"
                >
                    {authMode === 'login' ? 'Welcome Back' :
                        authMode === 'reset' ? 'Reset Password' : 'Create Account'}
                </h2>
                <p className="text-muted-foreground">
                    {authMode === 'login' ? 'Sign in to your account' :
                        authMode === 'reset' ? 'Recover your account access' :
                            'Create a new account'}
                </p>
            </div>

            {/* Mode Toggle Tabs (only show for login/signup) */}
            {authMode !== 'reset' && (
                <div className="flex bg-muted rounded-xl p-1 mb-6">
                    <button
                        onClick={() => setAuthMode('login')}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                            authMode === 'login'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        type="button"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => {
                            setAuthMode('signup');
                            setRegistrationStep('details');
                        }}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                            authMode === 'signup'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        type="button"
                    >
                        Sign Up
                    </button>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
                {renderAuthContent()}
            </form>

            {/* Toggle between login/signup at bottom */}
            {authMode !== 'reset' && registrationStep === 'details' && (
                <div className="text-center mt-6">
                    <p className="text-muted-foreground text-sm">
                        {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                            className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            {authMode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            )}

            {/* Back to Home Button */}
            {authMode !== 'reset' && registrationStep === 'details' && (
                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className={cn("h-4 w-4 transition-transform group-hover:-translate-x-1", isRTL && "rotate-180 group-hover:translate-x-1")} />
                        Back to Home
                    </button>
                </div>
            )}
        </div>
    );
}

