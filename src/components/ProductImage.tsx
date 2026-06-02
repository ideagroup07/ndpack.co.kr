/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Image } from 'lucide-react';

export interface ProductImageProps {
  src?: string;
  type?: 'image' | 'pdf' | 'external' | string;
  fileName?: string;
  alt?: string;
  className?: string;
  aspectRatio?: '4/3' | 'square' | 'video' | 'auto' | string;
  ratio?: '4/3' | 'square' | 'video' | 'auto' | string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  type,
  fileName,
  alt = '제품 이미지',
  className = '',
  aspectRatio,
  ratio,
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if the src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // Determine aspect ratio class (default to aspect-square 1:1 if not provided)
  const selectedRatio = aspectRatio || ratio;
  let ratioClass = 'aspect-square';
  if (selectedRatio === 'square') {
    ratioClass = 'aspect-square';
  } else if (selectedRatio === '4/3') {
    ratioClass = 'aspect-4/3';
  } else if (selectedRatio === 'video') {
    ratioClass = 'aspect-video';
  } else if (selectedRatio === 'auto') {
    ratioClass = 'aspect-auto';
  } else if (selectedRatio) {
    if (selectedRatio.startsWith('aspect-')) {
      ratioClass = selectedRatio;
    } else {
      ratioClass = `aspect-[${selectedRatio}]`;
    }
  }

  // Resolve /images/product/ prefix for local raw filenames
  let resolvedSrc = src;
  if (resolvedSrc && !resolvedSrc.startsWith('http') && !resolvedSrc.startsWith('data:') && !resolvedSrc.startsWith('/') && !resolvedSrc.startsWith('.')) {
    resolvedSrc = `/images/product/${resolvedSrc}`;
  } else if (resolvedSrc && resolvedSrc.startsWith('/images/') && !resolvedSrc.startsWith('/images/product/')) {
    const filenameWithExt = resolvedSrc.substring('/images/'.length);
    resolvedSrc = `/images/product/${filenameWithExt}`;
  }

  const baseContainerClass = `relative w-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-100 ${ratioClass} ${className}`;

  // Helper detect if PDF
  const isPdf = 
    type === 'pdf' || 
    (resolvedSrc && resolvedSrc.toLowerCase().split(/[?#]/)[0].endsWith('.pdf')) ||
    (resolvedSrc && resolvedSrc.startsWith('data:application/pdf'));

  // If PDF type, show PDF specific placeholder
  if (isPdf && resolvedSrc && resolvedSrc.trim() !== '') {
    const displayFileName = fileName || '제품_카탈로그.pdf';
    return (
      <div className={baseContainerClass} id="product-pdf-thumbnail">
        <div className="flex flex-col items-center justify-center p-4 text-center select-none w-full h-full bg-slate-50 border border-red-100">
          <div className="relative mb-2">
            <svg 
              className="w-12 h-12 text-red-500 fill-current" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
            </svg>
            <span className="absolute bottom-1 right-2 bg-red-600 text-white font-black text-[9px] px-1 rounded tracking-wider shadow">PDF</span>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-700 truncate max-w-[90%] px-1" title={displayFileName}>
            {displayFileName}
          </span>
          <span className="text-[9px] font-medium text-slate-400 mt-1">다운로드 및 파일 보기 가능</span>
        </div>
      </div>
    );
  }

  // If there's no src, or the URL is empty/blank, or we encountered an error loading the image
  if (!resolvedSrc || resolvedSrc.trim() === '' || hasError) {
    return (
      <div className={baseContainerClass} id="product-image-fallback">
        <div className="flex flex-col items-center justify-center p-4 text-center select-none">
          <Image className="w-9 h-9 text-gray-300 stroke-[1.5] mb-2 animate-pulse" />
          <span className="text-[11px] font-bold text-gray-400">이미지 없음</span>
        </div>
      </div>
    );
  }

  return (
    <div className={baseContainerClass} id="product-image-container">
      <img
        src={resolvedSrc}
        alt={alt}
        onError={() => setHasError(true)}
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain object-center"
      />
    </div>
  );
};

export default ProductImage;
