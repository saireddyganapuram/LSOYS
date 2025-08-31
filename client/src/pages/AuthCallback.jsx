import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (type === 'signup' && token_hash) {
          setStatus('Confirming your email...');
          
          const response = await fetch(`/api/auth/confirm?token_hash=${token_hash}&type=${type}`);
          const data = await response.json();

          if (response.ok) {
            setStatus('Email confirmed successfully!');
            setTimeout(() => {
              navigate('/login', { 
                state: { message: 'Email confirmed! You can now sign in.' }
              });
            }, 2000);
          } else {
            setError(data.error || 'Failed to confirm email');
          }
        } else {
          setError('Invalid confirmation link');
        }
      } catch (error) {
        setError('An error occurred while confirming your email');
        console.error('Email confirmation error:', error);
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Confirmation
          </h2>
          
          {!error ? (
            <div className="mt-4">
              <div className="text-gray-600">{status}</div>
              {status === 'Processing...' && (
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <div className="text-red-600 bg-red-50 p-4 rounded-md">
                {error}
              </div>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 text-indigo-600 hover:text-indigo-500"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
