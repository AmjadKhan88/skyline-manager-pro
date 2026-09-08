import { useEffect, useState } from "react";
import Loading from "../components/loaders/Loading";
import useGlobal from "../context/GlobalContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../configs/api"; // make sure your api instance is imported
import DotLoading from "../components/loaders/DotLoading";
import { Loader2 } from "lucide-react";

const EmailVerificationCard = () => {
  const { loading, user, setUser } = useGlobal();
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [sendingVerification, setSendingVerification] = useState(false);
  const [countdown, setCountdown] = useState(0); // countdown state
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [verifingEmail, setVerifiyingEmail] = useState(false);
  const navigate = useNavigate();

  

  const sendEmailVerification = async () => {
    setSendingVerification(true);
    try {
      const { data } = await api.post("/api/auth/send-verification-email");
      if (data.success) {
        toast.success(data.message);
        setSuccessMessage(data.message);
        setCountdown(60); // start 60s countdown
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to send verification email"
      );
      setErrorMessage(
        error?.response?.data?.message || "Failed to send verification email"
      );
    } finally {
      setSendingVerification(false);
    }
  };


   useEffect(() => {
    if (user?.verified || user?.role !== "owner") {
      navigate(`/${user.role}`, { replace: true });
    }
  }, [user]);
  

  // if token is present in URL, verify email
  useEffect(() => {
    const verifyEmail = async () => {
      setVerifiyingEmail(true);
      try {
        const { data } = await api.post("/api/auth/verify-email", { token });
        if (data.success) {
          toast.success(data.message);
          setErrorMessage('');
          setUser(data.user);
          navigate(`/${data.user.role}`, { replace: true });
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to verify email"
        );
        setErrorMessage(
          error?.response?.data?.message || "Failed to verify email"
        );
      } finally {
        setVerifiyingEmail(false);
      }
    };

    if (token && !user?.verified && user?.role === "owner") {
      verifyEmail();
    }
  }, [token]);

  // Countdown effect
  useEffect(() => {
    if (countdown === 0) return; // stop when countdown reaches 0
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);


  if(loading || verifingEmail) {
    return loading ? <Loading /> : <DotLoading />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-50"
        style={{ backgroundImage: "url('/bg-building.jpg')" }}
      ></div>

      <div className="max-w-md w-full z-10">
        {/* Logo Section */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white rounded-sm rotate-45 flex items-center justify-center">
              <div className="w-1 h-3 bg-white -rotate-45"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Skyline Manager Pro
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-linear-to-b from-white/70 to-white rounded-3xl shadow-xl shadow-slate-200/60 p-10 text-center border border-slate-100 relative overflow-hidden">
          {/* Subtle Background City Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/city.png')]"></div>

          <div className="relative z-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="text-blue-500 bg-blue-50 p-4 rounded-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Verify Your Email
            </h2>

            <p className="text-slate-500 mb-2 font-medium">
              Hi {user?.name},
            </p>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Welcome to Skyline Manager Pro. Please verify your email address
              to secure your account and access your dashboard.
            </p>

            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
                {errorMessage}
              </div>
            )}

            {/* Verification Button */}
            <button
              onClick={sendEmailVerification}
              disabled={sendingVerification || countdown > 0}
              className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-lg shadow-lg shadow-blue-500/30 transition-transform active:scale-[0.98] bg-gradient-to-r from-[#6366f1] via-[#3b82f6] to-[#0ea5e9] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {sendingVerification ? <Loader2 className="animate-spin text-center" /> : countdown > 0
                ? `Resend in ${countdown}s`
                : "Verify Email Address"}
            </button>

            <p className="mt-8 text-xs text-slate-400">
              This link will expire in 24 hours. If you didn't create a Skyline
              Pro account, please ignore this email.
            </p>

            <div className="mt-8 pt-8 border-t border-slate-100 text-xs text-slate-400">
              <p>
                Need help? Contact our support team at{" "}
                <span className="text-blue-500 cursor-pointer">
                  prostackcreations.dev@gmail.com
                </span>
              </p>
              <p className="mt-2">
                © 2026 Skyline Manager Pro. 123 Business Ave, San Francisco,
                CA 94105
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationCard;
