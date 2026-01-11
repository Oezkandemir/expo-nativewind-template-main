import { AdSlot, DailyAdStatus } from '@/types/ad';

export type { AdSlot };

/**
 * Fixed ad time slots - 5 per day
 */
export const AD_SLOTS: AdSlot[] = [
  { id: 'slot_1', time: '09:00', hour: 9, minute: 0 },
  { id: 'slot_2', time: '12:00', hour: 12, minute: 0 },
  { id: 'slot_3', time: '15:00', hour: 15, minute: 0 },
  { id: 'slot_4', time: '18:00', hour: 18, minute: 0 },
  { id: 'slot_5', time: '21:00', hour: 21, minute: 0 },
];

/**
 * Get current date string in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get current time in HH:mm format
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Get current hour (0-23)
 */
export function getCurrentHour(): number {
  return new Date().getHours();
}

/**
 * Get current minute (0-59)
 */
export function getCurrentMinute(): number {
  return new Date().getMinutes();
}

/**
 * Check if current time is within a time slot window
 * Window is 1 hour before and 1 hour after the slot time
 */
export function isWithinSlotWindow(slot: AdSlot): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  const slotTime = slot.hour * 60 + slot.minute;

  // Window: 1 hour before to 1 hour after
  const windowStart = slotTime - 60;
  const windowEnd = slotTime + 60;

  return currentTime >= windowStart && currentTime <= windowEnd;
}

/**
 * Get the current active slot (if any)
 */
export function getCurrentActiveSlot(): AdSlot | null {
  return AD_SLOTS.find((slot) => isWithinSlotWindow(slot)) || null;
}

/**
 * Get the next upcoming slot
 */
export function getNextSlot(): AdSlot | null {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  // Find next slot today
  const nextSlotToday = AD_SLOTS.find((slot) => {
    const slotTime = slot.hour * 60 + slot.minute;
    return slotTime > currentTime;
  });

  return nextSlotToday || AD_SLOTS[0]; // Return first slot tomorrow if none today
}

/**
 * Get minutes until next slot
 */
export function getMinutesUntilNextSlot(): number {
  const nextSlot = getNextSlot();
  if (!nextSlot) return 0;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const slotTime = nextSlot.hour * 60 + nextSlot.minute;
  let minutesUntil = slotTime - currentTime;

  // If next slot is tomorrow
  if (minutesUntil < 0) {
    minutesUntil = 24 * 60 + minutesUntil;
  }

  return minutesUntil;
}

/**
 * Initialize daily ad status for today
 */
export function initializeDailyAdStatus(): DailyAdStatus {
  return {
    date: getTodayDateString(),
    slots: AD_SLOTS.map((slot) => ({
      slotId: slot.id,
      time: slot.time,
      completed: false,
    })),
  };
}

/**
 * Check if a slot is completed for today
 */
export function isSlotCompleted(
  dailyStatus: DailyAdStatus,
  slotId: string
): boolean {
  const slot = dailyStatus.slots.find((s) => s.slotId === slotId);
  return slot?.completed || false;
}

/**
 * Mark a slot as completed
 */
export function markSlotCompleted(
  dailyStatus: DailyAdStatus,
  slotId: string,
  adId: string
): DailyAdStatus {
  return {
    ...dailyStatus,
    slots: dailyStatus.slots.map((slot) =>
      slot.slotId === slotId
        ? {
            ...slot,
            completed: true,
            adId,
            viewedAt: new Date().toISOString(),
          }
        : slot
    ),
  };
}

/**
 * Get completed slots count for today
 */
export function getCompletedSlotsCount(dailyStatus: DailyAdStatus): number {
  return dailyStatus.slots.filter((slot) => slot.completed).length;
}

/**
 * Get remaining slots count for today
 */
export function getRemainingSlotsCount(dailyStatus: DailyAdStatus): number {
  return dailyStatus.slots.filter((slot) => !slot.completed).length;
}


