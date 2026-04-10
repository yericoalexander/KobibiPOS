"use client";

import { AlertCircle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Ya, Lanjutkan", 
  cancelText = "Batal",
  variant = 'info'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertCircle className="text-red-500" size={32} />,
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          button: 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="text-amber-500" size={32} />,
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
        };
      default:
        return {
          icon: <AlertCircle className="text-blue-500" size={32} />,
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          button: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-4">
          <div className={`w-16 h-16 ${styles.bg} rounded-full flex items-center justify-center mx-auto mb-4 border ${styles.border}`}>
            {styles.icon}
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text)]">{title}</h2>
          <p className="text-[var(--color-text-muted)] text-sm">
            {message}
          </p>
        </div>
        <div className="flex gap-3 p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-semibold bg-white border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-all text-sm"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all text-sm shadow-lg ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
