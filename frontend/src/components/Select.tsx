import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error = false, className = '', children, ...props }, ref) => {
    const baseStyles =
      'w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 appearance-none bg-no-repeat bg-right pr-10';
    const normalStyles =
      'border-karspex-gray-100 focus:border-karspex-red focus:ring-karspex-red/20 bg-white text-karspex-black';
    const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50';
    const disabledStyles =
      'disabled:bg-karspex-gray-100 disabled:cursor-not-allowed disabled:opacity-50';

    const combinedClassName =
      `${baseStyles} ${error ? errorStyles : normalStyles} ${disabledStyles} ${className}`.trim();

    return (
      <div className="relative">
        <select ref={ref} className={combinedClassName} {...props}>
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-karspex-gray-800">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
