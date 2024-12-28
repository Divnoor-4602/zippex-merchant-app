"use client";
import fallbackImage from "@/../public/images/item_placeholder.jpg";
import Image, { ImageProps, StaticImageData } from "next/image";
import { useEffect, useState } from "react";

type ImageWithFallbackProps = ImageProps & {
  fallback?: string | StaticImageData;
};

const ImageWithFallback = ({
  fallback = fallbackImage,
  alt,
  src,
  ...props
}: ImageWithFallbackProps) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
  }, [src]);

  return (
    <Image
      alt={alt}
      onError={() => {
        console.log("error running");
        setError(() => null);
      }}
      src={error ? fallback : src}
      {...props}
    />
  );
};

export default ImageWithFallback;
