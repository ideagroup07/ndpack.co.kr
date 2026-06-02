import React, { useEffect, useState } from 'react';

type ProductImageProps = {
  src?: string;
  alt?: string;
  className?: string;
  product?: {
    imageUrl?: string;
    name?: string;
  };
};

const ProductImage = ({
  src,
  alt,
  className = '',
  product,
}: ProductImageProps) => {
  const imageSrc = src || product?.imageUrl || '';
  const imageAlt = alt || product?.name || '제품 이미지';
  const [isImageError, setIsImageError] = useState(false);

  useEffect(() => {
    setIsImageError(false);
  }, [imageSrc]);

  const wrapperClassName = [
    'relative w-full overflow-hidden bg-gray-100',
    'min-h-[220px] sm:min-h-[240px] md:min-h-[260px]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!imageSrc || isImageError) {
    return (
      <div className={wrapperClassName}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <div className="mb-2 text-3xl leading-none">▧</div>
          <div className="text-sm font-semibold">이미지 없음</div>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        onError={() => setIsImageError(true)}
      />
    </div>
  );
};

export default ProductImage;
