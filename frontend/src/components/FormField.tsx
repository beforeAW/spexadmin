import { ReactNode } from 'react';
import Label from './Label';

interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}

function FormField({
  label,
  error,
  helperText,
  required = false,
  htmlFor,
  children,
}: FormFieldProps) {
  return (
    <div className="mb-4">
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-karspex-gray-800">{helperText}</p>}
    </div>
  );
}

export default FormField;
