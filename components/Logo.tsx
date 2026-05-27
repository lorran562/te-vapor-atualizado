'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "relative h-12 w-12", size = 48 }: LogoProps) {
  return (
    <div className={`${className} overflow-hidden rounded-full border border-white/10 bg-zinc-900`}>
      <Image
        src="/logot7.jpeg"
        alt="T7 VAPOR Logo"
        fill
        className="object-cover"
      />
    </div>
  );
}
