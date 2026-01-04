import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = '', ...props }, ref) => {
    const baseStyles =
      'w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2';
    const normalStyles =
      'border-karspex-gray-100 focus:border-karspex-red focus:ring-karspex-red/20 bg-white text-karspex-black';
    const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50';
    const disabledStyles =
      'disabled:bg-karspex-gray-100 disabled:cursor-not-allowed disabled:opacity-50';

    const combinedClassName =
      `${baseStyles} ${error ? errorStyles : normalStyles} ${disabledStyles} ${className}`.trim();

    return <input ref={ref} className={combinedClassName} {...props} />;
  }
);

Input.displayName = 'Input';

export default Input;
