// Date utilities for BDR onboarding calendar

/**
 * Gets the actual date for a given onboarding day number, skipping weekends
 * Day 1 = startDate, Day 6 = next Monday after first week, etc.
 */
export function getDateForDay(startDate: Date, dayNumber: number): Date {
    const result = new Date(startDate);
    let daysAdded = 0;

    while (daysAdded < dayNumber - 1) {
        result.setDate(result.getDate() + 1);
        const dayOfWeek = result.getDay();
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            daysAdded++;
        }
    }

    return result;
}

/**
 * Gets the current onboarding day based on start date
 * Returns null if start date is in the future
 */
export function getCurrentDay(startDate: Date): number | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    if (start > today) return null;

    let currentDay = 1;
    const checkDate = new Date(start);

    while (checkDate < today) {
        checkDate.setDate(checkDate.getDate() + 1);
        const dayOfWeek = checkDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            currentDay++;
        }
    }

    return Math.min(currentDay, 60); // Cap at 60 days
}

/**
 * Gets the expected day based on start date (where they should be)
 */
export function getExpectedDay(startDate: Date): number {
    const current = getCurrentDay(startDate);
    return current || 1;
}

/**
 * Formats a date range for a week
 */
export function formatWeekRange(startDate: Date, weekNumber: number): string {
    const weekStartDay = (weekNumber - 1) * 5 + 1;
    const weekEndDay = weekNumber * 5;

    const weekStart = getDateForDay(startDate, weekStartDay);
    const weekEnd = getDateForDay(startDate, weekEndDay);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${weekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}`;
}

/**
 * Formats a single day date
 */
export function formatDayDate(startDate: Date, dayNumber: number): string {
    const date = getDateForDay(startDate, dayNumber);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Checks if a day is today
 */
export function isToday(startDate: Date, dayNumber: number): boolean {
    const dayDate = getDateForDay(startDate, dayNumber);
    const today = new Date();
    return dayDate.toDateString() === today.toDateString();
}

/**
 * Checks if a day is in the past
 */
export function isPastDay(startDate: Date, dayNumber: number): boolean {
    const dayDate = getDateForDay(startDate, dayNumber);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate < today;
}

/**
 * Gets the next Monday from a given date
 */
export function getNextMonday(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const daysUntilMonday = day === 0 ? 1 : (day === 1 ? 0 : 8 - day);
    result.setDate(result.getDate() + daysUntilMonday);
    return result;
}

/**
 * Calculates progress status relative to expected progress
 */
export function getProgressStatus(
    startDate: Date,
    completedDays: number,
    totalActivitiesCompleted: number
): { status: 'ahead' | 'on-track' | 'behind'; message: string; daysOffset: number } {
    const expectedDay = getExpectedDay(startDate);
    const daysDiff = completedDays - expectedDay;

    if (daysDiff >= 2) {
        return { status: 'ahead', message: `${daysDiff} days ahead of schedule`, daysOffset: daysDiff };
    } else if (daysDiff >= -1) {
        return { status: 'on-track', message: 'On track', daysOffset: daysDiff };
    } else {
        return { status: 'behind', message: `${Math.abs(daysDiff)} days behind schedule`, daysOffset: daysDiff };
    }
}
