import type { ImgHTMLAttributes } from 'react';

export type LogoProps = ImgHTMLAttributes<HTMLImageElement>;

export const BrandingLogo = ({ className, ...props }: LogoProps) => {
  return (
    <img
      src="/logo22.png"
      alt="Documenso Logo"
      className={className}
      {...props}
    />
  );
};
