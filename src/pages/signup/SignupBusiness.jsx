import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignup } from '../../context/SignupContext';

const SignupBusiness = () => {
    const navigate = useNavigate();
    const { formData, updateFormData } = useSignup();
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (
            !formData.ownerFirstName ||
            !formData.ownerLastName ||
            !formData.businessName ||
            !formData.registrationNumber
        ) {
            setError('All fields are required');
            return;
        }

        // Proceed to Mail setup
        navigate('/signup/mail');
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Business Details
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                    Create an organization account for your team.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                            Owner First Name
                        </label>
                        <input
                            type="text"
                            value={formData.ownerFirstName}
                            onChange={(e) => updateFormData({ ownerFirstName: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                            Owner Last Name
                        </label>
                        <input
                            type="text"
                            value={formData.ownerLastName}
                            onChange={(e) => updateFormData({ ownerLastName: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Business Name
                    </label>
                    <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => updateFormData({ businessName: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Business ID / Registration Number
                    </label>
                    <input
                        type="text"
                        value={formData.registrationNumber}
                        onChange={(e) => updateFormData({ registrationNumber: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    />
                </div>


                <div className="pt-4 flex justify-between">
                    <button
                        type="button"
                        onClick={() => navigate('/signup/selection')}
                        className="px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    >
                        Next Step
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignupBusiness;
