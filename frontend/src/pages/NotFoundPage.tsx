import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, LayoutDashboard } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        {/* 404 Illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-indigo-50 flex items-center justify-center">
              <FileQuestion className="w-16 h-16 text-indigo-400" />
            </div>
            <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-black text-lg shadow-lg">
              !
            </div>
          </div>
        </div>

        {/* Error Text */}
        <h1 className="text-8xl font-black text-slate-200 leading-none mb-2 select-none">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Page Not Found</h2>
        <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
          Please check the URL or navigate back to the dashboard.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
