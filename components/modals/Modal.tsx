'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  preventBackdropClose?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', preventBackdropClose = true }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventBackdropClose) onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, preventBackdropClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!preventBackdropClose && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[95vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {children}
        </div>
      </div>
    </div>
  );
}