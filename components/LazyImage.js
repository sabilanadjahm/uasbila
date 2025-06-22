import { useState } from 'react';

export default function LazyImage({ src, alt, className = '' }) {
  const [error, setError] = useState(false);

  return error ? (
    <div className={`bg-gray-200 flex items-center justify-center text-gray-500 italic ${className}`}>
      No image
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className={className}
    />
  );
}
