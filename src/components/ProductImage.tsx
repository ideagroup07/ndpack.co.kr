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

  if (!imageSrc || isImageError) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gray-100 text-sm font-semibold text-gray-400 ${className}`}
      >
        이미지 없음
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={imageAlt}
      className={`h-full w-full object-cover ${className}`}
      loading="lazy"
      onError={() => setIsImageError(true)}
    />
  );
};

export default ProductImage;
