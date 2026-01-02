import React from 'react';
import { ChevronLeft, Loader2, X } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyle = "w-full py-3.5 px-6 rounded-2xl font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:bg-emerald-300",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};

export const Header: React.FC<{ 
  title: string; 
  onBack?: () => void; 
  rightAction?: React.ReactNode 
}> = ({ title, onBack, rightAction }) => (
  <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between flex-shrink-0">
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px]">{title}</h1>
    </div>
    <div>{rightAction}</div>
  </header>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ 
  children, 
  className = '',
  onClick 
}) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl p-5 shadow-sm border border-gray-100 ${onClick ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''} ${className}`}
  >
    {children}
  </div>
);

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (val: number) => void;
  colorClass?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, value, min, max, unit, onChange, colorClass = "accent-emerald-600" }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <span className="text-gray-600 font-medium text-sm">{label}</span>
      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg text-sm">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${colorClass}`}
    />
    <div className="flex justify-between mt-1 text-xs text-gray-400 font-medium">
      <span>{min}{unit}</span>
      <span>{max}{unit}</span>
    </div>
  </div>
);

export const Toggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-4">
    <span className="text-gray-700 font-medium">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  </div>
);

export const ProgressRing: React.FC<{ 
  percentage: number; 
  size?: number; 
  stroke?: number; 
  color?: string; 
  icon?: React.ReactNode 
}> = ({ 
  percentage, 
  size = 80, 
  stroke = 8, 
  color = "text-emerald-500",
  icon 
}) => {
  const radius = size / 2 - stroke;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-gray-200"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        {icon}
        <span className="text-sm font-bold text-gray-700 mt-1">{percentage}%</span>
      </div>
    </div>
  );
};

interface RangeSliderProps {
  label: string;
  startValue: number;
  endValue: number;
  min: number;
  max: number;
  unit: string;
  onChange: (start: number, end: number) => void;
  singleThumb?: boolean;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({ 
  label, 
  startValue, 
  endValue, 
  min, 
  max, 
  unit, 
  onChange,
  singleThumb 
}) => {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), endValue - 1);
    onChange(val, endValue);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), startValue + 1);
    onChange(startValue, val);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-600 font-medium text-sm">{label}</span>
      </div>
      
      <div className="relative h-2 bg-gray-200 rounded-lg">
        <div 
          className="absolute h-full bg-emerald-500 rounded-lg opacity-50"
          style={{ 
            left: `${((startValue - min) / (max - min)) * 100}%`,
            right: `${100 - ((endValue - min) / (max - min)) * 100}%`
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={startValue}
          onChange={handleStartChange}
          className="absolute w-full h-full appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-emerald-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
        />

        {!singleThumb && (
          <input
            type="range"
            min={min}
            max={max}
            value={endValue}
            onChange={handleEndChange}
            className="absolute w-full h-full appearance-none bg-transparent pointer-events-none z-10 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-emerald-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
          />
        )}
      </div>

      <div className="flex justify-between mt-4 text-sm font-medium text-gray-600">
        <div className="flex flex-col items-start">
            <span className="text-xs text-gray-400">Start</span>
            <span>{startValue}{unit}</span>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400">{singleThumb ? "Auto-Stop" : "Stop"}</span>
            <span className={singleThumb ? "text-gray-400" : ""}>{endValue}{unit}</span>
        </div>
      </div>
    </div>
  );
};

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, show, onClose }) => {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 min-w-[300px] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
