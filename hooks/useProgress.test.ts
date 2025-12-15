import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProgress } from '../hooks/useProgress';

const mockPhases = [
    { name: 'Phase 1', days: [1, 5] as [number, number] },
    { name: 'Phase 2', days: [6, 10] as [number, number] },
];

describe('useProgress hook', () => {
    describe('isDayComplete', () => {
        it('returns false when no activities are completed', () => {
            const { result } = renderHook(() =>
                useProgress({
                    completedActivities: {},
                    phases: mockPhases
                })
            );

            const activities = ['Activity 1', 'Activity 2', 'Activity 3'];
            expect(result.current.isDayComplete(1, activities)).toBe(false);
        });

        it('returns true when all activities are completed', () => {
            const { result } = renderHook(() =>
                useProgress({
                    completedActivities: {
                        '1-0': true,
                        '1-1': true,
                        '1-2': true
                    },
                    phases: mockPhases
                })
            );

            const activities = ['Activity 1', 'Activity 2', 'Activity 3'];
            expect(result.current.isDayComplete(1, activities)).toBe(true);
        });

        it('returns false when some activities are completed', () => {
            const { result } = renderHook(() =>
                useProgress({
                    completedActivities: {
                        '1-0': true,
                        '1-1': false,
                        '1-2': true
                    },
                    phases: mockPhases
                })
            );

            const activities = ['Activity 1', 'Activity 2', 'Activity 3'];
            expect(result.current.isDayComplete(1, activities)).toBe(false);
        });

        it('returns false for empty activities array', () => {
            const { result } = renderHook(() =>
                useProgress({
                    completedActivities: {},
                    phases: mockPhases
                })
            );

            expect(result.current.isDayComplete(1, [])).toBe(false);
        });
    });

    describe('getDayProgress', () => {
        it('returns 0% progress when nothing is completed', () => {
            const { result } = renderHook(() =>
                useProgress({
                    completedActivities: {},
                    phases: mockPhases
                })
            );

            const activities = ['Activity 1', 'Activity 2', 'Activity 3', 'Activity 4'];
            const progress = result.current.getDayProgress(1, activities);

            expect(progress.completed).toBe(0);
            expect(progress.total).toBe(4);
            expect(progress.percentage).toBe(0);
        });

        it('returns 50% progress when half is completed', () => {
            const { result } = renderHook(() =>
                useProgress({
                    completedActivities: {
                        '1-0': true,
                        '1-1': true,
                    },
                    phases: mockPhases
                })
            );

            const activities = ['Activity 1', 'Activity 2', 'Activity 3', 'Activity 4'];
            const progress = result.current.getDayProgress(1, activities);

            expect(progress.completed).toBe(2);
            expect(progress.total).toBe(4);
            expect(progress.percentage).toBe(50);
        });

        it('returns 100% progress when all completed', () => {
            const { result } = renderHook(() =>
                useProgress({
                    completedActivities: {
                        '1-0': true,
                        '1-1': true,
                        '1-2': true,
                        '1-3': true,
                    },
                    phases: mockPhases
                })
            );

            const activities = ['Activity 1', 'Activity 2', 'Activity 3', 'Activity 4'];
            const progress = result.current.getDayProgress(1, activities);

            expect(progress.completed).toBe(4);
            expect(progress.total).toBe(4);
            expect(progress.percentage).toBe(100);
        });

        it('handles empty activities array', () => {
            const { result } = renderHook(() =>
                useProgress({
                    completedActivities: {},
                    phases: mockPhases
                })
            );

            const progress = result.current.getDayProgress(1, []);

            expect(progress.completed).toBe(0);
            expect(progress.total).toBe(0);
            expect(progress.percentage).toBe(0);
        });
    });

    describe('overallProgress', () => {
        it('returns 0% when nothing is completed', () => {
            const { result } = renderHook(() =>
                useProgress({
                    completedActivities: {},
                    phases: mockPhases
                })
            );

            expect(result.current.overallProgress.percentage).toBe(0);
            expect(result.current.overallProgress.daysCompleted).toBe(0);
        });
    });

    describe('getWeekProgress', () => {
        it('calculates week progress correctly', () => {
            const { result } = renderHook(() =>
                useProgress({
                    completedActivities: {},
                    phases: mockPhases
                })
            );

            const weekProgress = result.current.getWeekProgress([1, 2, 3, 4, 5]);

            expect(weekProgress.totalDays).toBe(5);
            expect(weekProgress.daysComplete).toBe(0);
        });
    });
});
