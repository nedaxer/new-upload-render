// Haptic feedback utility functions

/**
 * Triggers haptic feedback on supported devices
 * @param pattern - Vibration pattern in milliseconds or single duration
 * @param fallback - Whether to use fallback for unsupported devices
 */
export function vibrate(pattern: number | number[] = 50, fallback: boolean = true): void {
  try {
    // Check if vibration API is supported
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
      return;
    }

    // Fallback for iOS devices that support haptic feedback
    if (fallback && 'ontouchstart' in window) {
      // Try to use iOS haptic feedback if available
      const impact = (window as any).DeviceMotionEvent?.requestPermission ? 
        'heavy' : 'medium';
      
      // Use iOS haptic feedback API if available
      if ((window as any).navigator?.vibrate) {
        (window as any).navigator.vibrate(pattern);
      }
    }
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Light tap feedback for UI interactions
 */
export function hapticLight(): void {
  vibrate(5);
}

/**
 * Medium tap feedback for button presses
 */
export function hapticMedium(): void {
  vibrate(8);
}

/**
 * Heavy feedback for important actions
 */
export function hapticHeavy(): void {
  vibrate(12);
}

/**
 * Double tap feedback pattern
 */
export function hapticDoubleTap(): void {
  vibrate([5, 10, 5]);
}

/**
 * Success feedback pattern
 */
export function hapticSuccess(): void {
  vibrate([5, 5, 8]);
}

/**
 * Error feedback pattern
 */
export function hapticError(): void {
  vibrate([12, 8, 12]);
}

/**
 * Navigation feedback for tab switches
 */
export function hapticNavigation(): void {
  vibrate(5);
}