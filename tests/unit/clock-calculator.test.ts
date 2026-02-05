import { describe, it, expect } from 'vitest';
import {
  getSeverityScore,
  getDecayFactor,
  calculateClockState,
  getPositionLabel,
  getColorForLevel,
} from '@/lib/utils/clock-calculator';
import { createMockEvent } from '../helpers';
import type { EventSeverity } from '@/lib/supabase/types';

describe('clock-calculator', () => {
  describe('getSeverityScore', () => {
    it('should return 1 for minor severity', () => {
      expect(getSeverityScore('minor')).toBe(1);
    });

    it('should return 2 for moderate severity', () => {
      expect(getSeverityScore('moderate')).toBe(2);
    });

    it('should return 3 for significant severity', () => {
      expect(getSeverityScore('significant')).toBe(3);
    });

    it('should return 4 for major severity', () => {
      expect(getSeverityScore('major')).toBe(4);
    });

    it('should return 5 for critical severity', () => {
      expect(getSeverityScore('critical')).toBe(5);
    });
  });

  describe('getDecayFactor', () => {
    it('should return 1.0 for events less than 1 year old', () => {
      expect(getDecayFactor(0.5)).toBe(1.0);
      expect(getDecayFactor(0.9)).toBe(1.0);
    });

    it('should return 0.8 for events 1-2 years old', () => {
      expect(getDecayFactor(1.0)).toBe(0.8);
      expect(getDecayFactor(1.5)).toBe(0.8);
      expect(getDecayFactor(1.9)).toBe(0.8);
    });

    it('should return 0.6 for events 2-3 years old', () => {
      expect(getDecayFactor(2.0)).toBe(0.6);
      expect(getDecayFactor(2.5)).toBe(0.6);
      expect(getDecayFactor(2.9)).toBe(0.6);
    });

    it('should return 0.4 for events 3+ years old', () => {
      expect(getDecayFactor(3.0)).toBe(0.4);
      expect(getDecayFactor(5.0)).toBe(0.4);
      expect(getDecayFactor(10.0)).toBe(0.4);
    });
  });

  describe('getPositionLabel', () => {
    it('should return "Early warning" for level 0-20', () => {
      expect(getPositionLabel(0)).toBe('Early warning');
      expect(getPositionLabel(10)).toBe('Early warning');
      expect(getPositionLabel(20)).toBe('Early warning');
    });

    it('should return "Noticeable decline" for level 21-40', () => {
      expect(getPositionLabel(21)).toBe('Noticeable decline');
      expect(getPositionLabel(30)).toBe('Noticeable decline');
      expect(getPositionLabel(40)).toBe('Noticeable decline');
    });

    it('should return "Significant degradation" for level 41-60', () => {
      expect(getPositionLabel(41)).toBe('Significant degradation');
      expect(getPositionLabel(50)).toBe('Significant degradation');
      expect(getPositionLabel(60)).toBe('Significant degradation');
    });

    it('should return "Severe enshittification" for level 61-80', () => {
      expect(getPositionLabel(61)).toBe('Severe enshittification');
      expect(getPositionLabel(70)).toBe('Severe enshittification');
      expect(getPositionLabel(80)).toBe('Severe enshittification');
    });

    it('should return "Critical / Terminal" for level 81-100', () => {
      expect(getPositionLabel(81)).toBe('Critical / Terminal');
      expect(getPositionLabel(90)).toBe('Critical / Terminal');
      expect(getPositionLabel(100)).toBe('Critical / Terminal');
    });
  });

  describe('getColorForLevel', () => {
    it('should return "green" for level 0-20', () => {
      expect(getColorForLevel(0)).toBe('green');
      expect(getColorForLevel(20)).toBe('green');
    });

    it('should return "yellow" for level 21-40', () => {
      expect(getColorForLevel(21)).toBe('yellow');
      expect(getColorForLevel(40)).toBe('yellow');
    });

    it('should return "orange" for level 41-60', () => {
      expect(getColorForLevel(41)).toBe('orange');
      expect(getColorForLevel(60)).toBe('orange');
    });

    it('should return "red" for level 61-80', () => {
      expect(getColorForLevel(61)).toBe('red');
      expect(getColorForLevel(80)).toBe('red');
    });

    it('should return "darkred" for level 81-100', () => {
      expect(getColorForLevel(81)).toBe('darkred');
      expect(getColorForLevel(100)).toBe('darkred');
    });
  });

  describe('calculateClockState', () => {
    it('should return level 0 for no events', () => {
      const state = calculateClockState([]);
      expect(state.level).toBe(0);
      expect(state.eventCount).toBe(0);
      expect(state.serviceCount).toBe(0);
      expect(state.position).toBe('Early warning');
      expect(state.color).toBe('green');
    });

    it('should calculate correct level for recent minor events', () => {
      const now = new Date();
      const events = [
        createMockEvent({
          severity: 'minor' as EventSeverity,
          event_date: now.toISOString().split('T')[0],
        }),
        createMockEvent({
          severity: 'minor' as EventSeverity,
          event_date: now.toISOString().split('T')[0],
        }),
      ];
      const state = calculateClockState(events);
      expect(state.level).toBeGreaterThan(0);
      expect(state.level).toBeLessThan(30);
      expect(state.eventCount).toBe(2);
    });

    it('should calculate correct level for critical events', () => {
      const now = new Date();
      const events = [
        createMockEvent({
          severity: 'critical' as EventSeverity,
          event_date: now.toISOString().split('T')[0],
        }),
        createMockEvent({
          severity: 'major' as EventSeverity,
          event_date: now.toISOString().split('T')[0],
        }),
        createMockEvent({
          severity: 'critical' as EventSeverity,
          event_date: now.toISOString().split('T')[0],
        }),
      ];
      const state = calculateClockState(events);
      expect(state.level).toBeGreaterThan(40);
      expect(state.eventCount).toBe(3);
    });

    it('should apply time decay correctly', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const recentEvent = createMockEvent({
        severity: 'major' as EventSeverity,
        event_date: new Date().toISOString().split('T')[0],
      });

      const oldEvent = createMockEvent({
        severity: 'major' as EventSeverity,
        event_date: twoYearsAgo.toISOString().split('T')[0],
      });

      const recentState = calculateClockState([recentEvent]);
      const oldState = calculateClockState([oldEvent]);

      expect(recentState.level).toBeGreaterThan(oldState.level);
    });

    it('should count unique services correctly', () => {
      const events = [
        createMockEvent({ service_id: 'service-1' }),
        createMockEvent({ service_id: 'service-1' }),
        createMockEvent({ service_id: 'service-2' }),
      ];

      const state = calculateClockState(events);
      expect(state.serviceCount).toBe(2);
    });

    it('should cap level at 100', () => {
      const now = new Date();
      const manyEvents = Array.from({ length: 100 }, () =>
        createMockEvent({
          severity: 'critical' as EventSeverity,
          event_date: now.toISOString().split('T')[0],
        })
      );

      const state = calculateClockState(manyEvents);
      expect(state.level).toBeLessThanOrEqual(100);
    });
  });
});
