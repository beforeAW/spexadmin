import { InputHTMLAttributes, forwardRef } from 'react';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className = '', checked = false, ...props }, ref) => {
    return (
      <label className={`inline-flex items-center cursor-pointer ${className}`}>
        <input ref={ref} type="checkbox" className="sr-only peer" checked={checked} {...props} />
        <div className="relative w-11 h-6 bg-karspex-gray-100 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-karspex-red/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-karspex-gray-100 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-karspex-red peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
        {label && <span className="ms-3 text-sm text-karspex-black">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
