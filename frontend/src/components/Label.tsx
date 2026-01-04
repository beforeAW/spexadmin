import { LabelHTMLAttributes, ReactNode } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: ReactNode;
}

function Label({ required = false, children, className = '', ...props }: LabelProps) {
  const baseStyles = 'block text-sm font-medium text-karspex-black mb-1';
  const combinedClassName = `${baseStyles} ${className}`.trim();

  return (
    <label className={combinedClassName} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export default Label;
