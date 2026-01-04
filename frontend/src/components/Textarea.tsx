import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, className = '', ...props }, ref) => {
    const baseStyles =
      'w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 resize-vertical';
    const normalStyles =
      'border-karspex-gray-100 focus:border-karspex-red focus:ring-karspex-red/20 bg-white text-karspex-black';
    const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50';
    const disabledStyles =
      'disabled:bg-karspex-gray-100 disabled:cursor-not-allowed disabled:opacity-50';

    const combinedClassName =
      `${baseStyles} ${error ? errorStyles : normalStyles} ${disabledStyles} ${className}`.trim();

    return <textarea ref={ref} className={combinedClassName} {...props} />;
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
