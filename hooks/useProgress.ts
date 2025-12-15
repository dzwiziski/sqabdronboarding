import { useMemo, useCallback } from 'react';
import { getDayInfo } from '../data';
import { ActivityState, DayProgress } from '../types';

interface PhaseProgress {
    name: string;
    activitiesCompleted: number;
    totalActivities: number;
    percentage: number;
    daysComplete: number;
    totalDays: number;
}

interface OverallProgress {
    activitiesCompleted: number;
    totalActivities: number;
    percentage: number;
    daysCompleted: number;
    totalDays: number;
}

interface Phase {
    name: string;
    days: [number, number];
}

interface UseProgressOptions {
    completedActivities: ActivityState;
    phases: Phase[];
    totalDays?: number;
}

/**
 * Custom hook for calculating progress across the onboarding calendar.
 * Memoizes all calculations for performance.
 */
export function useProgress({ completedActivities, phases, totalDays = 90 }: UseProgressOptions) {
    /**
     * Check if all activities for a specific day are completed
     */
    const isDayComplete = useCallback((day: number, activities: string[]): boolean => {
        if (!activities || activities.length === 0) return false;
        return activities.every((_, idx) => completedActivities[`${day}-${idx}`]);
    }, [completedActivities]);

    /**
     * Get progress stats for a specific day
     */
    const getDayProgress = useCallback((day: number, activities: string[]): DayProgress => {
        if (!activities || activities.length === 0) {
            return { completed: 0, total: 0, percentage: 0 };
        }
        const completed = activities.filter((_, idx) => completedActivities[`${day}-${idx}`]).length;
        return {
            completed,
            total: activities.length,
            percentage: Math.round((completed / activities.length) * 100)
        };
    }, [completedActivities]);

    /**
     * Calculate overall progress across all days
     */
    const overallProgress = useMemo((): OverallProgress => {
        let totalActivities = 0;
        let completedCount = 0;
        let daysCompleted = 0;

        for (let day = 1; day <= totalDays; day++) {
            const dayInfo = getDayInfo(day);
            if (dayInfo && dayInfo.activities) {
                totalActivities += dayInfo.activities.length;
                let dayComplete = true;
                dayInfo.activities.forEach((_, idx) => {
                    if (completedActivities[`${day}-${idx}`]) {
                        completedCount++;
                    } else {
                        dayComplete = false;
                    }
                });
                if (dayComplete && dayInfo.activities.length > 0) {
                    daysCompleted++;
                }
            }
        }

        return {
            activitiesCompleted: completedCount,
            totalActivities,
            percentage: totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0,
            daysCompleted,
            totalDays
        };
    }, [completedActivities, totalDays]);

    /**
     * Calculate progress for each phase
     */
    const phaseProgress = useMemo((): PhaseProgress[] => {
        return phases.map(phase => {
            let totalActivities = 0;
            let completedCount = 0;
            let daysComplete = 0;
            let phaseTotalDays = 0;

            for (let day = phase.days[0]; day <= phase.days[1]; day++) {
                phaseTotalDays++;
                const dayInfo = getDayInfo(day);
                if (dayInfo && dayInfo.activities) {
                    totalActivities += dayInfo.activities.length;
                    let dayComplete = true;
                    dayInfo.activities.forEach((_, idx) => {
                        if (completedActivities[`${day}-${idx}`]) {
                            completedCount++;
                        } else {
                            dayComplete = false;
                        }
                    });
                    if (dayComplete && dayInfo.activities.length > 0) {
                        daysComplete++;
                    }
                }
            }

            return {
                name: phase.name,
                activitiesCompleted: completedCount,
                totalActivities,
                percentage: totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0,
                daysComplete,
                totalDays: phaseTotalDays
            };
        });
    }, [completedActivities, phases]);

    /**
     * Calculate week progress
     */
    const getWeekProgress = useCallback((days: number[]) => {
        let weekActivitiesComplete = 0;
        let weekActivitiesTotal = 0;
        let weekDaysComplete = 0;

        days.forEach(day => {
            const dayInfo = getDayInfo(day);
            if (dayInfo && dayInfo.activities) {
                weekActivitiesTotal += dayInfo.activities.length;
                let dayComplete = true;
                dayInfo.activities.forEach((_, idx) => {
                    if (completedActivities[`${day}-${idx}`]) {
                        weekActivitiesComplete++;
                    } else {
                        dayComplete = false;
                    }
                });
                if (dayComplete && dayInfo.activities.length > 0) {
                    weekDaysComplete++;
                }
            }
        });

        return {
            activitiesComplete: weekActivitiesComplete,
            activitiesTotal: weekActivitiesTotal,
            daysComplete: weekDaysComplete,
            totalDays: days.length,
            percentage: weekActivitiesTotal > 0
                ? Math.round((weekActivitiesComplete / weekActivitiesTotal) * 100)
                : 0
        };
    }, [completedActivities]);

    return {
        isDayComplete,
        getDayProgress,
        overallProgress,
        phaseProgress,
        getWeekProgress
    };
}

export default useProgress;
