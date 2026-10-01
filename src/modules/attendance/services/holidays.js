import { TIME_CONSTANTS } from "../constants";

export const holidayService = {
  holidays: [
    // Public Holidays 2024-2025
    '2024-01-01', // New Year
    '2024-03-11', // Public Holiday
    '2024-03-29', // Good Friday
    '2024-04-01', // Easter Monday
    '2024-05-01', // Labor Day
    '2024-06-17', // Eid al-Adha
    '2024-09-11', // Ethiopian New Year
    '2024-12-25', // Christmas
    '2025-01-01', // New Year
    '2025-03-10', // Public Holiday
    '2025-03-29', // Good Friday
    '2025-04-01', // Easter Monday
    '2025-05-01', // Labor Day
    '2025-12-25', // Christmas
    '2025-12-26', // Boxing Day
  ],

  schoolHolidays: [
    // School Breaks
    '2024-07-01', '2024-07-02', '2024-07-03', '2024-07-04', '2024-07-05',
    '2024-12-23', '2024-12-24', '2024-12-26', '2024-12-27', '2024-12-30', '2024-12-31',
    '2025-06-30', '2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04',
  ],

  // SRS FR2.3: Automatically mark weekends and holidays as non-working days
  isWeekend(date) {
    try {
      const day = new Date(date).getDay();
      return day === 0 || day === 6; // 0=Sunday, 6=Saturday
    } catch (error) {
      console.error("Error checking weekend:", error);
      return false;
    }
  },
// Add this function to holidayService object:
isWithinAllowedPeriod: (dateString, daysBack = 3) => {
  try {
    const today = new Date();
    const date = new Date(dateString);
    
    // Reset time components for accurate day comparison
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diffTime = today - date;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return diffDays >= 0 && diffDays <= daysBack;
  } catch (error) {
    console.error("Error checking date range:", error);
    return false;
  }
},

// Also add a function to get readable date difference
getDateDifference: (dateString) => {
  try {
    const today = new Date();
    const date = new Date(dateString);
    
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  } catch (error) {
    return dateString;
  }
},
  isPublicHoliday(date) {
    try {
      const dateStr = new Date(date).toISOString().split('T')[0];
      return this.holidays.includes(dateStr);
    } catch (error) {
      console.error("Error checking public holiday:", error);
      return false;
    }
  },

  isSchoolHoliday(date) {
    try {
      const dateStr = new Date(date).toISOString().split('T')[0];
      return this.schoolHolidays.includes(dateStr);
    } catch (error) {
      console.error("Error checking school holiday:", error);
      return false;
    }
  },

  isHoliday(date) {
    return this.isPublicHoliday(date) || this.isSchoolHoliday(date);
  },

  isWorkingDay(date) {
    return !this.isWeekend(date) && !this.isHoliday(date);
  },

  getHolidayType(date) {
    if (this.isPublicHoliday(date)) return 'public_holiday';
    if (this.isSchoolHoliday(date)) return 'school_holiday';
    if (this.isWeekend(date)) return 'weekend';
    return 'working_day';
  },

  getHolidayName(date) {
    const dateStr = new Date(date).toISOString().split('T')[0];
    
    // Map dates to holiday names
    const holidayNames = {
      '2024-01-01': 'New Year',
      '2024-03-29': 'Good Friday',
      '2024-04-01': 'Easter Monday',
      '2024-05-01': 'Labor Day',
      '2024-12-25': 'Christmas Day',
      '2025-01-01': 'New Year',
      '2025-03-29': 'Good Friday',
      '2025-04-01': 'Easter Monday',
      '2025-05-01': 'Labor Day',
      '2025-12-25': 'Christmas Day',
      '2025-12-26': 'Boxing Day',
    };
    
    return holidayNames[dateStr] || (this.isSchoolHoliday(date) ? 'School Break' : 'Holiday');
  },

  // SRS FR2.3: Automatically mark holidays
  getHolidayStatus(date) {
    if (this.isHoliday(date)) {
      return {
        status: 'holiday',
        type: this.getHolidayType(date),
        name: this.getHolidayName(date),
        isWorkingDay: false,
      };
    }
    
    if (this.isWeekend(date)) {
      return {
        status: 'holiday',
        type: 'weekend',
        name: this.isWeekend(date) ? 'Weekend' : 'Non-working Day',
        isWorkingDay: false,
      };
    }
    
    return {
      status: 'working_day',
      type: 'working_day',
      name: 'Working Day',
      isWorkingDay: true,
    };
  },

  getUpcomingHolidays(days = 30) {
    try {
      const today = new Date();
      const upcoming = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (this.isHoliday(dateStr) || this.isWeekend(dateStr)) {
          upcoming.push({
            date: dateStr,
            name: this.getHolidayName(dateStr),
            type: this.getHolidayType(dateStr),
            isWeekend: this.isWeekend(dateStr),
          });
        }
      }
      
      return upcoming.slice(0, 10);
    } catch (error) {
      return [];
    }
  },

  addHoliday(date, name = '', type = 'school_holiday') {
    try {
      const dateStr = new Date(date).toISOString().split('T')[0];
      
      if (!this.holidays.includes(dateStr) && !this.schoolHolidays.includes(dateStr)) {
        if (type === 'public_holiday') {
          this.holidays.push(dateStr);
        } else {
          this.schoolHolidays.push(dateStr);
        }
        
        this.holidays.sort();
        this.schoolHolidays.sort();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  // Check if current time is within school hours
  isWithinSchoolHours() {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                        now.getMinutes().toString().padStart(2, '0');
    
    return currentTime >= TIME_CONSTANTS.CHECK_IN_START && 
           currentTime <= TIME_CONSTANTS.CHECK_OUT_END;
  },

  // Check if student is late based on check-in time
  isLate(checkInTime) {
    if (!checkInTime) return false;
    return checkInTime > TIME_CONSTANTS.LATE_THRESHOLD;
  }
};