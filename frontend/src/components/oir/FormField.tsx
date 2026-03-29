'use client';

import type { AnswersMap } from '@/types/oir';

interface Option { value: string; label: string }

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  answers: AnswersMap;
  onChange: (id: string, value: string) => void;
}

interface TextFieldProps extends FieldProps { type?: 'text' | 'textarea'; maxLength?: number; placeholder?: string }
interface SelectFieldProps extends FieldProps { options: Option[] }
interface MultiSelectFieldProps extends FieldProps { options: Option[] }
interface BooleanFieldProps extends FieldProps {}

function RequiredMark() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

export function TextField({ id, label, required, answers, onChange, type = 'text', maxLength, placeholder = 'Escribe aquí...' }: TextFieldProps) {
  const value = answers[id] ?? '';
  if (type === 'textarea') {
    return (
      <div>
        <label className="label">{label}{required && <RequiredMark />}</label>
        <textarea
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          maxLength={maxLength}
          rows={4}
          className="input-field resize-none"
          placeholder={placeholder}
        />
        {maxLength && (
          <p className="mt-1 text-xs text-gray-400 text-right">{value.length}/{maxLength}</p>
        )}
      </div>
    );
  }
  return (
    <div>
      <label className="label">{label}{required && <RequiredMark />}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        className="input-field"
        placeholder={placeholder}
      />
    </div>
  );
}

export function SelectField({ id, label, required, answers, onChange, options }: SelectFieldProps) {
  const value = answers[id] ?? '';
  return (
    <div>
      <label className="label">{label}{required && <RequiredMark />}</label>
      <select value={value} onChange={(e) => onChange(id, e.target.value)} className="input-field">
        <option value="">Selecciona una opción...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function MultiSelectField({ id, label, required, answers, onChange, options }: MultiSelectFieldProps) {
  const rawValue = answers[id] ?? '';
  const selected = rawValue ? rawValue.split('|') : [];

  function toggle(val: string) {
    const next = selected.includes(val)
      ? selected.filter((v) => v !== val)
      : [...selected, val];
    onChange(id, next.join('|'));
  }

  return (
    <div>
      <label className="label">{label}{required && <RequiredMark />}</label>
      <p className="text-xs text-gray-500 mb-2">Selecciona todas las que apliquen</p>
      <div className="space-y-2">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(o.value)}
              onChange={() => toggle(o.value)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function TextareaField({ id, label, required, answers, onChange, placeholder }: TextFieldProps) {
  return <TextField id={id} label={label} required={required} answers={answers} onChange={onChange} type="textarea" placeholder={placeholder} />;
}

export function BooleanField({ id, label, required, answers, onChange }: BooleanFieldProps) {
  const value = answers[id] ?? '';
  return (
    <div>
      <label className="label">{label}{required && <RequiredMark />}</label>
      <div className="flex gap-4 mt-1">
        {['Sí', 'No'].map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={id}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(id, opt)}
              className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
