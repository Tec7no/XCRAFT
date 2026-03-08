import * as React from 'react';

interface ImagePlaceholderProps {
  label?: string;
  className?: string;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ label = 'Image coming soon', className = '' }) => (
  <div
    role="img"
    aria-label={label}
    className={`flex items-center justify-center bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-widest ${className}`}
  >
    <span className="px-3 text-center leading-tight">{label}</span>
  </div>
);

export default ImagePlaceholder;
