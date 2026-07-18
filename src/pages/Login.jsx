import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
// import logo from '../assets/bnx.jpeg';

import logo from "../assets/bnx-remove.png";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 2FA state variables
    const [step, setStep] = useState('login'); // 'login', '2fa', 'recovery'
    const [tempToken, setTempToken] = useState('');
    const [otp, setOtp] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSwitchStep = (newStep) => {
        setStep(newStep);
        setError('');
        setSuccessMessage('');
        setOtp('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let loginEmail = formData.email;
            if (!loginEmail.includes('@')) {
                loginEmail = `${loginEmail}@bnxmail.com`;
            }

            const response = await authAPI.login({
                email: loginEmail,
                password: formData.password
            });

            if (response.data.success) {
                const responseData = response.data.data;
                if (responseData && responseData.status === '2FA_REQUIRED') {
                    setTempToken(responseData.tempToken);
                    setStep('2fa');
                    setOtp('');
                    setError('');
                } else {
                    // Pass the whole data object to login context
                    login(responseData);
                    navigate('/inbox');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2fa = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login2fa({
                tempToken,
                code: otp
            });

            if (response.data.success) {
                login(response.data.data);
                navigate('/inbox');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid 2FA code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendRecoveryOtp = async () => {
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const response = await authAPI.send2faRecoveryOtp(tempToken);
            if (response.data.success) {
                setSuccessMessage(response.data.message || 'Recovery code sent to your secondary email.');
                setOtp('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send recovery code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyRecoveryOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.verify2faRecoveryOtp(tempToken, otp);

            if (response.data.success) {
                login(response.data.data);
                navigate('/inbox');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid recovery code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 transition-all duration-500">
                {/* Logo & Dynamic Header */}
                <div className="text-center">
                    <img src={logo} alt="BNX Mail" className="mx-auto h-24 w-auto drop-shadow-md" />
                    <h2 className="mt-3 text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {step === 'login' && 'Welcome Back'}
                        {step === '2fa' && 'Two-Step Verification'}
                        {step === 'recovery' && 'Account Recovery'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 font-medium px-4">
                        {step === 'login' && 'Securely access your BNX Mail account.'}
                        {step === '2fa' && 'To help keep your account safe, BNX Mail wants to make sure it\'s really you.'}
                        {step === 'recovery' && 'We will send a 6-digit recovery code to your registered secondary email address.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl animate-shake text-sm font-medium">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2">
                        <CheckCircle2 size={18} className="shrink-0" />
                        <span className="text-sm font-medium">{successMessage}</span>
                    </div>
                )}

                {/* Form Switcher */}
                {step === 'login' && (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
                                    placeholder="you@bnxmail.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-lg cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
                                    Stay signed in
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" name="forgot-password" id="forgot-password-link" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Authenticating...</span>
                                </div>
                            ) : (
                                'Sign In →'
                            )}
                        </button>

                        <div className="text-center text-sm space-y-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <div className="text-gray-500 dark:text-slate-400">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
                                    Create one for free
                                </Link>
                            </div>
                        </div>
                    </form>
                )}

                {step === '2fa' && (
                    <form className="mt-8 space-y-6" onSubmit={handleVerify2fa}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 text-center">
                                    Enter the 6-digit code from your <b>Authenticator App</b>
                                </label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="••••••"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-center text-2xl font-bold tracking-[0.5em] focus:placeholder-transparent transition-all"
                                    maxLength="6"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                'Verify Code →'
                            )}
                        </button>

                        <div className="flex flex-col gap-3 text-center text-sm pt-4 border-t border-gray-100 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => handleSwitchStep('recovery')}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                            >
                                Don't have your device? Try another way
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSwitchStep('login')}
                                className="flex items-center justify-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors font-medium mt-1"
                            >
                                <ArrowLeft size={16} /> Back to Sign In
                            </button>
                        </div>
                    </form>
                )}

                {step === 'recovery' && (
                    <form className="mt-8 space-y-6" onSubmit={handleVerifyRecoveryOtp}>
                        <div className="space-y-4">
                            {!successMessage ? (
                                <div className="text-center py-2">
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={handleSendRecoveryOtp}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 font-semibold rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        <Mail size={18} />
                                        Send Recovery Code to Email
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="recovery-otp" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 text-center">
                                        Enter 6-digit Recovery Code
                                    </label>
                                    <input
                                        id="recovery-otp"
                                        name="otp"
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="••••••"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-center text-2xl font-bold tracking-[0.5em] focus:placeholder-transparent transition-all"
                                        maxLength="6"
                                        autoFocus
                                    />
                                    
                                    <div className="text-center mt-3">
                                        <button
                                            type="button"
                                            onClick={handleSendRecoveryOtp}
                                            disabled={loading}
                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                                        >
                                            Resend Code
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {successMessage && (
                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    'Verify and Login →'
                                )}
                            </button>
                        )}

                        <div className="flex flex-col gap-3 text-center text-sm pt-4 border-t border-gray-100 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => handleSwitchStep('2fa')}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                            >
                                Use Authenticator App instead
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSwitchStep('login')}
                                className="flex items-center justify-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors font-medium mt-1"
                            >
                                <ArrowLeft size={16} /> Back to Sign In
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;