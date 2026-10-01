"use client";

import { useEffect, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import { X } from "lucide-react";

interface LightboxProps {
  isOpen: boolean;
  src: StaticImageData;
  alt: string;
  caption: string;
  onClose: () => void;
}

export default function Lightbox({ isOpen, src, alt, caption, onClose }: LightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={caption}
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
      >
        <X className="h-5 w-5" />
      </button>

      <figure
        onClick={(event) => event.stopPropagation()}
        className="max-h-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <Image
          src={src}
          alt={alt}
          sizes="(min-width: 1024px) 80vw, 95vw"
          className="h-auto max-h-[80vh] w-full object-contain"
        />
        <figcaption className="border-t border-gray-100 px-5 py-3 text-center text-sm font-medium text-gray-700">
          {caption}
        </figcaption>
      </figure>
    </div>
  );
}