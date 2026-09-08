import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verifyToken = async () => {
      try {
        const { data } = await api.post('/api/v1/auth/verify-email', { token });
        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Email successfully verified! You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. Token may be expired.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 'An error occurred while verifying your email.'
        );
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 text-center transition-all">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Verifying Email
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Verified!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{message}</p>
            <Link
              to="/"
              className="mt-6 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Verification Failed
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{message}</p>
            <Link
              to="/"
              className="mt-6 w-full py-2.5 px-4 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
