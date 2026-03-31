import { X, ZoomIn } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  altText?: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, altText = 'Enlarged Image' }: ImageModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-dark-900/95 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 rounded-full bg-dark-800/50 hover:bg-dark-700 transition-colors text-dark-300 hover:text-white backdrop-blur-sm z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        className="relative max-w-[90vw] max-h-[90vh] bg-dark-800 rounded-xl overflow-hidden shadow-2xl border border-dark-700 animate-slideUp flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-2 sm:p-4 bg-dark-900/50 border-b border-dark-700 flex items-center justify-center gap-2">
           <ZoomIn className="w-4 h-4 text-dark-400" />
           <span className="text-sm font-bold text-dark-300 uppercase tracking-widest">{altText}</span>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-dark-900">
          <img 
            src={imageUrl} 
            alt={altText} 
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
