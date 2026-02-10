
import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, isSameDay, isToday, startOfWeek, addWeeks, subWeeks } from 'date-fns';

interface SlidingCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const WEEK_LENGTH = 14; // 2 weeks of days

interface DateButtonProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  onClick: (date: Date) => void;
}

const DateButton = memo<DateButtonProps>(({ date, isSelected, isToday, onClick }) => {
  const dayName = format(date, 'EEE');
  const dayNumber = format(date, 'd');
  
  return (
    <Button
      variant={isSelected ? 'default' : 'ghost'}
      size="sm"
      className={`flex flex-col h-14 w-17 px-4 rounded-sm transition-colors ${
        isSelected 
          ? 'bg-[#121212] hover:bg-[#1a1a1a] text-white' 
          : isToday 
            ? 'border border-primary/30' 
            : ''
      }`}
      onClick={() => onClick(date)}
      data-selected={isSelected}
    >
      <span className="text-xs font-medium uppercase">{dayName}</span>
      <span className="text-sm font-semibold">{dayNumber}</span>
    </Button>
  );
});

DateButton.displayName = 'DateButton';

const SlidingCalendar = memo<SlidingCalendarProps>(({ selectedDate, onDateSelect }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    return startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start week on Monday
  });
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const isScrollingRef = useRef(false);

  // Memoize the week dates to prevent unnecessary recalculations
  const weekDates = useMemo(() => 
    Array.from({ length: WEEK_LENGTH }, (_, i) => addDays(new Date(currentWeekStart), i)),
    [currentWeekStart]
  );

  // Memoize the date click handler
  const handleDateClick = useCallback((date: Date) => {
    onDateSelect(new Date(date));
  }, [onDateSelect]);

  // Memoize navigation handlers
  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  }, []);

  // Scroll to selected date when it changes
  useEffect(() => {
    if (isScrollingRef.current) return;
    
    const selectedDateInRange = weekDates.some(date => isSameDay(date, selectedDate));
    if (!selectedDateInRange) {
      // When selected date is not in the current view, update the week start
      const newWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      if (!isSameDay(newWeekStart, currentWeekStart)) {
        setCurrentWeekStart(newWeekStart);
      }
    } else if (scrollContainerRef.current) {
      isScrollingRef.current = true;
      
      // Use requestAnimationFrame to ensure smooth scrolling
      requestAnimationFrame(() => {
        const selectedElement = scrollContainerRef.current?.querySelector('[data-selected="true"]');
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
        
        // Reset the scrolling flag after the animation completes
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
        }, 1000);
      });
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [selectedDate, weekDates]);

  return (
    <div className="flex items-center w-full overflow-hidden relative">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={goToPreviousWeek}
        className="shrink-0 z-20"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="relative flex-1 overflow-hidden">
        <div 
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-8 py-1"
        >
          {weekDates.map((date) => (
            <DateButton
              key={date.toISOString()}
              date={date}
              isSelected={isSameDay(date, selectedDate)}
              isToday={isToday(date)}
              onClick={handleDateClick}
              
            />
          ))}
        </div>
        {/* Left fade - black */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black from-0% via-black/80 via-40% to-transparent to-80% pointer-events-none"></div>
        {/* Right fade - black */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black from-0% via-black/80 via-40% to-transparent to-80% pointer-events-none"></div>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={goToNextWeek}
        className="shrink-0 z-20"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});

SlidingCalendar.displayName = 'SlidingCalendar';


export default SlidingCalendar;
