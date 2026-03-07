'use client';

import Image from 'next/image';
import { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "relative h-12 w-12", size = 48 }: LogoProps) {
  const [imgSrc, setImgSrc] = useState("https://picsum.photos/seed/t7vapor/400/400");
  const fallbackSrc = "https://cdn-icons-png.flaticon.com/512/616/616430.png";

  return (
    <div className={`${className} overflow-hidden rounded-full border border-white/10 bg-zinc-900`}>
      <Image
        src={imgSrc || fallbackSrc}
        alt="T7 VAPOR Logo"
        fill
        className="object-cover"
        referrerPolicy="no-referrer"
        onError={() => setImgSrc(fallbackSrc)}
      />
    </div>
  );
}
