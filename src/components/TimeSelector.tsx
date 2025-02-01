import React from 'react';
import { Input } from "@/components/ui/input";
import { Clock } from 'lucide-react';

interface TimeSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({ label, value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Clock className="w-4 h-4" /> {label}
      </label>
      <Input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background"
      />
    </div>
  );
};