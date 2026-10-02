import Image from 'next/image';

interface BrandLogoProps {
  size?: 'sm' | 'lg';
  className?: string;
}

export function BrandLogo({ size = 'sm', className = '' }: BrandLogoProps) {
  const dimensions = size === 'lg' ? { width: 76, height: 60 } : { width: 46, height: 36 };

  return (
    <Image
      src="/veersa-logo.svg"
      alt="Veersa"
      width={dimensions.width}
      height={dimensions.height}
      className={`brand-logo ${size === 'lg' ? 'brand-logo-lg' : ''} ${className}`.trim()}
      priority
    />
  );
}
