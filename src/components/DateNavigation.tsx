import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addDays, subDays } from "date-fns";

interface DateNavigationProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const DateNavigation = ({ selectedDate, onDateSelect }: DateNavigationProps) => {
  const goToPreviousDay = () => {
    onDateSelect(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    onDateSelect(addDays(selectedDate, 1));
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

      {/* Date Display Card */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-3">
        <div className="flex items-center justify-center gap-3">
          <Calendar className="h-5 w-5 text-gray-600" />
          <span className="text-gray-700 font-semibold text-base">
            {format(selectedDate, 'dd/MM')} <span className="uppercase">{format(selectedDate, 'EEE')}</span>
          </span>
        </div>
      </div>

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
