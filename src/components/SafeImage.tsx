import React, { useState, useEffect } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { resolveDirectImageUrl } from '../utils/imageHelper';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackText = 'صورة الصنف',
  ...props
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(src || '');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve src if it's a page URL (like https://ibb.co/Kz0VkSRB)
  useEffect(() => {
    let isMounted = true;
    if (!src) {
      setResolvedSrc('');
      setIsLoading(false);
      return;
    }

    setHasError(false);
    setIsLoading(true);

    // If already direct image or data URL
    if (
      src.startsWith('data:') ||
      src.startsWith('blob:') ||
      src.includes('i.ibb.co/') ||
      src.match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i)
    ) {
      setResolvedSrc(src);
      return;
    }

    // Try resolving asynchronously via backend
    resolveDirectImageUrl(src)
      .then((resolved) => {
        if (isMounted) {
          setResolvedSrc(resolved);
        }
      })
      .catch(() => {
        if (isMounted) {
          setResolvedSrc(src);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (!resolvedSrc || hasError) {
    return (
      <div
        className={`bg-[#F9EDE1] border border-[#F3D5B8] flex flex-col items-center justify-center text-[#8A6F5C] p-3 text-center select-none ${className}`}
      >
        <ImageOff className="w-7 h-7 text-[#C98457] opacity-60 mb-1" />
        <span className="text-[11px] text-[#8A6F5C] font-bold line-clamp-1">
          {fallbackText || alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className} overflow-hidden`}>
      {isLoading && (
        <div className="absolute inset-0 bg-[#F9EDE1] animate-pulse flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[#E2984C]" />
        </div>
      )}
      <img
        src={resolvedSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        loading="lazy"
        {...props}
      />
    </div>
  );
};
