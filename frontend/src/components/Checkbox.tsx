import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error = false, className = '', ...props }, ref) => {
    const baseStyles =
      'h-4 w-4 rounded border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';
    const normalStyles =
      'border-karspex-gray-100 text-karspex-red focus:ring-karspex-red/20 checked:bg-karspex-red checked:border-karspex-red';
    const errorStyles = 'border-red-500 focus:ring-red-500/20';
    const disabledStyles =
      'disabled:bg-karspex-gray-100 disabled:cursor-not-allowed disabled:opacity-50';

    const combinedClassName =
      `${baseStyles} ${error ? errorStyles : normalStyles} ${disabledStyles} ${className}`.trim();

    if (label) {
      return (
        <label className="flex items-center space-x-2 cursor-pointer">
          <input ref={ref} type="checkbox" className={combinedClassName} {...props} />
          <span className="text-sm text-karspex-black select-none">{label}</span>
        </label>
      );
    }

    return <input ref={ref} type="checkbox" className={combinedClassName} {...props} />;
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
