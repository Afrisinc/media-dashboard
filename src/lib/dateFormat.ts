import {
  formatDistanceToNow,
  format,
  isToday,
  isYesterday,
  differenceInHours,
} from "date-fns";

export type DateFormatStyle = "relative" | "full" | "compact" | "time-only";

/**
 * Formats a date professionally with relative time display
 * Examples:
 * - Today at 2:30 PM
 * - Yesterday at 9:15 AM
 * - 2 hours ago
 * - Mar 10, 2026
 * - Mar 15, 2026 at 11:17 AM
 */
export const formatDateProfessional = (
  date: string | Date,
  style: DateFormatStyle = "relative",
): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Validate date
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    switch (style) {
      case "time-only":
        return format(dateObj, "h:mm a");

      case "full":
        return format(dateObj, "MMM d, yyyy 'at' h:mm a");

      case "compact":
        return format(dateObj, "MMM d, yyyy");

      case "relative":
      default:
        return formatRelativeTime(dateObj);
    }
  } catch {
    return "Invalid date";
  }
};

/**
 * Smart relative time formatter
 * Shows: "Today at 2:30 PM", "Yesterday at 9:15 AM", "2 hours ago", "Mar 10"
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const hoursAgo = differenceInHours(now, date);

  // Today
  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`;
  }

  // Yesterday
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  }

  // Within last 48 hours
  if (hoursAgo < 48) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  // Same year - show Month Day
  if (date.getFullYear() === now.getFullYear()) {
    return format(date, "MMM d");
  }

  // Different year - show Month Day, Year
  return format(date, "MMM d, yyyy");
};

/**
 * Format date for table cells (shorter version)
 * Examples: "Today", "Yesterday", "2h ago", "Mar 15"
 */
export const formatDateShort = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "—";
    }

    if (isToday(dateObj)) {
      return "Today";
    }

    if (isYesterday(dateObj)) {
      return "Yesterday";
    }

    const hoursAgo = differenceInHours(new Date(), dateObj);
    if (hoursAgo < 24) {
      return `${hoursAgo}h ago`;
    }

    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 7) {
      return `${daysAgo}d ago`;
    }

    return format(dateObj, "MMM d");
  } catch {
    return "—";
  }
};

/**
 * Format for tooltips or detailed views
 * Example: "Friday, March 15, 2026 at 2:30:45 PM"
 */
export const formatDateDetailed = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    return format(dateObj, "EEEE, MMMM d, yyyy 'at' h:mm:ss a");
  } catch {
    return "Invalid date";
  }
};

/**
 * Get human readable duration between two dates
 * Example: "2 days, 3 hours"
 */
export const formatDateDuration = (startDate: Date, endDate: Date): string => {
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours % 24}h`;
  }
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m`;
  }
  return `${diffMins}m`;
};
