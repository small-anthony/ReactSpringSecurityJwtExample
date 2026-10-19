import React, { useState, useEffect, useRef, useMemo, useId } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import i18n from "i18next";

export interface CalendarInputProps {
  value?: Date | string | null;
  defaultValue?: Date | string | null;
  onChange?: (date: Date | null, dateString: string) => void;
  min?: Date | string | null;
  max?: Date | string | null;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  locale?: string;
  closeOnSelect?: boolean;
  allowClear?: boolean;
  formatDate?: (date: Date) => string;
}

function normalizeDate(val: Date | string | null | undefined): Date | null {
  if (!val) return null;

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return new Date(val.getFullYear(), val.getMonth(), val.getDate());
  }

  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;

    const datePartMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (datePartMatch) {
      const year = parseInt(datePartMatch[1], 10);
      const month = parseInt(datePartMatch[2], 10) - 1;
      const day = parseInt(datePartMatch[3], 10);
      return new Date(year, month, day);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }
  }

  return null;
}

function toIsoDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(d1: Date | null, d2: Date | null): boolean {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isBeforeDay(d1: Date, d2: Date): boolean {
  return d1.getTime() < d2.getTime();
}

function isAfterDay(d1: Date, d2: Date): boolean {
  return d1.getTime() > d2.getTime();
}

export default function CalendarInput({
  className = "",
  id: customId,
  name,
  value,
  defaultValue,
  onChange,
  min,
  max,
  placeholder = "...",
  disabled = false,
  required = false,
  locale = "en-US",
  closeOnSelect = true,
  allowClear = true,
  formatDate,
}: CalendarInputProps) {
  const generatedId = useId();
  const inputId = customId || `calendar-input-${generatedId}`;

  const effectiveMin = useMemo(() => normalizeDate(min), [min]);
  const effectiveMax = useMemo(() => normalizeDate(max), [max]);

  const initialDate = useMemo(() => {
    return normalizeDate(value !== undefined ? value : defaultValue);
  }, []);

  const [internalDate, setInternalDate] = useState<Date | null>(initialDate);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (value !== undefined) {
      setInternalDate(normalizeDate(value));
    }
  }, [value]);

  const selectedDate = value !== undefined ? normalizeDate(value) : internalDate;

  const [viewDate, setViewDate] = useState<Date>(() => {
    if (selectedDate) return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    if (effectiveMin && isBeforeDay(new Date(), effectiveMin)) {
      return new Date(effectiveMin.getFullYear(), effectiveMin.getMonth(), 1);
    }
    if (effectiveMax && isAfterDay(new Date(), effectiveMax)) {
      return new Date(effectiveMax.getFullYear(), effectiveMax.getMonth(), 1);
    }
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      if (selectedDate) {
        setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
      } else if (effectiveMin && isBeforeDay(viewDate, effectiveMin)) {
        setViewDate(new Date(effectiveMin.getFullYear(), effectiveMin.getMonth(), 1));
      } else if (effectiveMax && isAfterDay(viewDate, effectiveMax)) {
        setViewDate(new Date(effectiveMax.getFullYear(), effectiveMax.getMonth(), 1));
      }
    }
    setIsOpen((prev) => !prev);
  };

  const isDateDisabled = (date: Date): boolean => {
    if (effectiveMin && isBeforeDay(date, effectiveMin)) return true;
    if (effectiveMax && isAfterDay(date, effectiveMax)) return true;
    return false;
  };

  const handleSelectDate = (date: Date) => {
    if (disabled || isDateDisabled(date)) return;

    if (value === undefined) {
      setInternalDate(date);
    }

    if (onChange) {
      onChange(date, toIsoDateString(date));
    }

    if (closeOnSelect) {
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    if (value === undefined) {
      setInternalDate(null);
    }

    if (onChange) {
      onChange(null, "");
    }
  };

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isPrevMonthDisabled = useMemo(() => {
    if (!effectiveMin) return false;
    const lastDayOfPrevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0);
    return isBeforeDay(lastDayOfPrevMonth, effectiveMin);
  }, [viewDate, effectiveMin]);

  const isNextMonthDisabled = useMemo(() => {
    if (!effectiveMax) return false;
    const firstDayOfNextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    return isAfterDay(firstDayOfNextMonth, effectiveMax);
  }, [viewDate, effectiveMax]);

  const formattedMonthYear = useMemo(() => {
    try {
      const formatter = new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      });
      const str = formatter.format(viewDate);
      return str.charAt(0).toUpperCase() + str.slice(1);
    } catch {
      return `${viewDate.getMonth() + 1} / ${viewDate.getFullYear()}`;
    }
  }, [viewDate, locale]);

  const weekDays = useMemo(() => {
    const days: string[] = [];
    const monday = new Date(2026, 0, 5);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      try {
        const name = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d);
        const cleanName = name.replace(".", "");
        days.push(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      } catch {
        days.push(["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i]);
      }
    }
    return days;
  }, [locale]);

  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let i = startDayIndex - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
      cells.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [viewDate]);

  const displayValue = useMemo(() => {
    if (!selectedDate) return "";
    if (formatDate) return formatDate(selectedDate);
    try {
      return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(selectedDate);
    } catch {
      return toIsoDateString(selectedDate);
    }
  }, [selectedDate, formatDate, locale]);

  const today = useMemo(() => normalizeDate(new Date())!, []);

  return (
    <div ref={containerRef} className={`relative w-full text-left ${className}`}>
      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedDate ? toIsoDateString(selectedDate) : ""}
          required={required}
        />
      )}

      <button
        id={inputId}
        type="button"
        disabled={disabled}
        onClick={handleToggleOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-xl text-sm transition outline-none select-none ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            : isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20 cursor-pointer"
            : "border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon
            className={`w-4 h-4 shrink-0 transition-colors ${
              disabled
                ? "text-gray-300"
                : isOpen || selectedDate
                ? "text-blue-600"
                : "text-gray-400"
            }`}
          />
          <span
            className={`truncate text-sm ${
              selectedDate ? "text-gray-900 font-medium" : "text-gray-400 font-normal"
            }`}
          >
            {selectedDate ? displayValue : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {allowClear && selectedDate && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Effacer la date"
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}

          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-blue-600" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          role="dialog"
          aria-label="Calendrier"
          className="absolute left-0 mt-2 z-50 w-full min-w-[290px] sm:min-w-[320px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-800 tracking-wide select-none">
              {formattedMonthYear}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={isPrevMonthDisabled}
                aria-label="Mois précédent"
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                disabled={isNextMonthDisabled}
                aria-label="Mois suivant"
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {weekDays.map((dayName, idx) => (
              <div
                key={idx}
                className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider py-1 select-none"
              >
                {dayName}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map(({ date, isCurrentMonth }, idx) => {
              const disabledDay = isDateDisabled(date);
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentDay = isSameDay(date, today);

              let buttonClasses =
                "h-8 sm:h-9 w-full flex items-center justify-center text-xs sm:text-sm rounded-xl transition duration-150 select-none relative ";

              if (disabledDay) {
                buttonClasses +=
                  "text-gray-300 opacity-40 cursor-not-allowed pointer-events-none";
              } else if (isSelected) {
                buttonClasses +=
                  "bg-blue-600 text-white font-semibold shadow-xs hover:bg-blue-700 cursor-pointer";
              } else if (isCurrentDay) {
                buttonClasses +=
                  "border border-blue-500 text-blue-600 font-semibold hover:bg-blue-50 cursor-pointer";
              } else if (!isCurrentMonth) {
                buttonClasses +=
                  "text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer";
              } else {
                buttonClasses +=
                  "text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 cursor-pointer";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelectDate(date)}
                  aria-pressed={isSelected}
                  aria-disabled={disabledDay}
                  className={buttonClasses}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { CalendarInput };
