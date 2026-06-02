import React, { useEffect, useState } from 'react';

type ProductImageProps = {
  src?: string;
  alt?: string;
  className?: string;
  type?: string;
  fileName?: string;
  aspectRatio?: 'square' | 'wide' | 'video' | string;
};

const ProductImage = ({
  src,
  alt = '제품 이미지',
  className = '',
  aspectRatio = 'square',
}: ProductImageProps) => {
  const [isImageError, setIsImageError] = useState(false);

  useEffect(() => {
    setIsImageError(false);
  }, [src]);

  const aspectClass =
    aspectRatio === 'wide'
      ? 'aspect-[16/9]'
      : aspectRatio === 'video'
        ? 'aspect-video'
        : 'aspect-square';

  const frameClassName = [
    'relative w-full overflow-hidden bg-gray-100',
    aspectClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!src || isImageError) {
    return (
      <div className={frameClassName}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <div className="text-sm font-bold">이미지 없음</div>
        </div>
      </div>
    );
  }

  return (
    <div className={frameClassName}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        onError={() => setIsImageError(true)}
      />
    </div>
  );
};

export default ProductImage;
