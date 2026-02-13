'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 24, md: 36, lg: 48 };
const goldColor = '#c9a227';

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const s = sizes[size];
  return (
    <div className={`inline-flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <svg
        width={s}
        height={s}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
      >
        <path
          d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
          stroke={goldColor}
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M24 12L34 18V30L24 36L14 30V18L24 12Z"
          stroke={goldColor}
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />
        <circle cx="24" cy="24" r="3" fill={goldColor} />
      </svg>
    </div>
  );
}
