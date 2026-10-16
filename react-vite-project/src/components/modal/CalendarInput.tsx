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
  /** The currently selected date (controlled). */
  value?: Date | string | null;
  /** Initial selected date (uncontrolled). */
  defaultValue?: Date | string | null;
  /** Callback fired when the selected date changes. */
  onChange?: (date: Date | null, dateString: string) => void;
  /** Minimum selectable date (inclusive). Dates before this are disabled. */
  min?: Date | string | null;
  /** Maximum selectable date (inclusive). Dates after this are disabled. */
  max?: Date | string | null;
  /** Placeholder text shown when no date is selected. */
  placeholder?: string;
  /** Disables the input and dropdown. */
  disabled?: boolean;
  /** Marks the field as required. */
  required?: boolean;
  /** Field name for form submissions. */
  name?: string;
  /** HTML id for the component. */
  id?: string;
  /** Custom CSS classes for the outer wrapper container. */
  className?: string;
  /** BCP 47 language tag for date formatting (e.g. 'fr-CA', 'en-US'). Defaults to en-US. */
  locale?: string;
  /** Whether selecting a date automatically closes the dropdown. Defaults to true. */
  closeOnSelect?: boolean;
  /** Whether to show a clear button when a date is selected. Defaults to true. */
  allowClear?: boolean;
  /** Custom formatting function for the displayed input value. */
  formatDate?: (date: Date) => string;
}

/**
 * Normalizes a date or date string into a Date instance at local midnight (00:00:00.000).
 * Prevents UTC timezone shift issues when parsing "YYYY-MM-DD" strings.
 */
function normalizeDate(val: Date | string | null | undefined): Date | null {
  if (!val) return null;

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return new Date(val.getFullYear(), val.getMonth(), val.getDate());
  }

  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;

    // Handle "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"
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

/** Formats a date as YYYY-MM-DD */
function toIsoDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Checks whether two dates represent the exact same calendar day */
function isSameDay(d1: Date | null, d2: Date | null): boolean {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/** Compares if d1 is strictly before d2 */
function isBeforeDay(d1: Date, d2: Date): boolean {
  return d1.getTime() < d2.getTime();
}

/** Compares if d1 is strictly after d2 */
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

  // Initial date priority: value -> defaultValue -> null
  const initialDate = useMemo(() => {
    return normalizeDate(value !== undefined ? value : defaultValue);
  }, []);

  const [internalDate, setInternalDate] = useState<Date | null>(initialDate);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Sync internal state when controlled 'value' changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalDate(normalizeDate(value));
    }
  }, [value]);

  const selectedDate = value !== undefined ? normalizeDate(value) : internalDate;

  // Track currently viewed month and year in the calendar
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

  // Close calendar when clicking outside or pressing Escape
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

  // When opening, reset the view to the selected date's month if available
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

  // Determine if prev/next month buttons should be disabled
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

  // Formatted header string (e.g. "Octobre 2026")
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

  // Weekday column headers (Monday to Sunday)
  const weekDays = useMemo(() => {
    const days: string[] = [];
    // Start with a known Monday: 2026-01-05
    const monday = new Date(2026, 0, 5);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      try {
        const name = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d);
        // Clean up punctuation (e.g. "lun." -> "Lun")
        const cleanName = name.replace(".", "");
        days.push(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      } catch {
        days.push(["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i]);
      }
    }
    return days;
  }, [locale]);

  // Calendar day cells for the current view
  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday-based index: Monday = 0, ..., Sunday = 6
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Leading days from previous month
    for (let i = startDayIndex - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    // Trailing days to fill standard 6-week (42 cells) grid for stable height
    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
      cells.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [viewDate]);

  // Display text in the collapsed input trigger
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
      {/* Hidden input for native form compatibility */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedDate ? toIsoDateString(selectedDate) : ""}
          required={required}
        />
      )}

      {/* Collapsed Input Trigger */}
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

      {/* Expanded Calendar Dropdown */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          role="dialog"
          aria-label="Calendrier"
          className="absolute left-0 mt-2 z-50 w-full min-w-[290px] sm:min-w-[320px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header: Month/Year title and Prev/Next navigation */}
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

          {/* Days of the week headers */}
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

          {/* Days grid */}
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
