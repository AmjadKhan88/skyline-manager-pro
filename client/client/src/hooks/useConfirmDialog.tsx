// hooks/useConfirmDialog.tsx
import { toast } from 'react-hot-toast';
import React from 'react';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  icon?: 'warning' | 'info' | 'success' | 'error';
}

interface ToastProps {
  t: any;
  options: ConfirmDialogOptions;
  resolve: (value: boolean) => void;
}

const ConfirmDialogToast: React.FC<ToastProps> = ({ t, options, resolve }) => {
  const {
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'bg-red-600',
    icon = 'warning'
  } = options;

  const getIcon = () => {
    const iconProps = {
      className: 'w-6 h-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24' as const,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
      strokeWidth: 2
    };

    switch (icon) {
      case 'warning':
        return (
          <div className="bg-yellow-100 p-3 rounded-lg mr-3">
            <svg {...iconProps} className="w-6 h-6 text-yellow-600">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.974-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="bg-blue-100 p-3 rounded-lg mr-3">
            <svg {...iconProps} className="w-6 h-6 text-blue-600">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="bg-green-100 p-3 rounded-lg mr-3">
            <svg {...iconProps} className="w-6 h-6 text-green-600">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="bg-red-100 p-3 rounded-lg mr-3">
            <svg {...iconProps} className="w-6 h-6 text-red-600">
              <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl w-96 border border-gray-200 animate-in slide-in-from-top-5">
      <div className="flex items-start mb-4">
        {getIcon()}
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <p className="text-gray-600 mt-1">{message}</p>
        </div>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            resolve(false);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
          type="button"
        >
          ✕
        </button>
      </div>
      
      <div className="flex gap-3 justify-end mt-6">
        <button
          onClick={() => {
            toast.dismiss(t.id);
            resolve(false);
          }}
          className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          type="button"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            resolve(true);
          }}
          className={`px-5 py-2.5 ${confirmColor} text-white rounded-lg font-medium hover:opacity-90 transition-opacity`}
          type="button"
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};

export function useConfirmDialog() {
  const confirm = (options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      toast.custom(
        (t) => <ConfirmDialogToast t={t} options={options} resolve={resolve} />,
        {
          duration: Infinity,
          position: 'top-center',
        }
      );
    });
  };

  return { confirm };
}