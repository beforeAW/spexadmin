import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-bold rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-karspex-red hover:bg-karspex-gold hover:text-karspex-black text-white',
    secondary: 'bg-karspex-burgundy hover:bg-karspex-burgundy-dark text-white',
    outline: 'border-2 border-karspex-red text-karspex-red hover:bg-karspex-red hover:text-white',
    ghost: 'text-karspex-red hover:bg-karspex-cream',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  const combinedClassName =
    `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}

export default Button;
