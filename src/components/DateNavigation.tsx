import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DateNavigationProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const DateNavigation = ({ selectedDate, onDateSelect }: DateNavigationProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const goToPreviousDay = () => {
    onDateSelect(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    onDateSelect(addDays(selectedDate, 1));
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
      setCalendarOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Previous Day Button */}
      <button
        onClick={goToPreviousDay}
        className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
      >
        <ChevronLeft className="h-5 w-5 text-gray-600" />
      </button>

      {/* Date Display Card — Opens Calendar on Click */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <button className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center justify-center gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700 font-semibold text-base">
                {format(selectedDate, 'dd/MM')} <span className="uppercase">{format(selectedDate, 'EEE')}</span>
              </span>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Next Day Button */}
      <button
        onClick={goToNextDay}
        className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};
