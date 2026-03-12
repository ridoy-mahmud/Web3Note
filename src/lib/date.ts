import { format, isToday, isTomorrow, isFuture, parseISO } from "date-fns";

export function formatNoteDate(isoDate: string): string {
  const date = parseISO(isoDate);
  if (isToday(date)) return `Today at ${format(date, "h:mm a")}`;
  if (isTomorrow(date)) return `Tomorrow at ${format(date, "h:mm a")}`;
  return format(date, "MMM d, yyyy h:mm a");
}

export function isDueToday(isoDate: string | null): boolean {
  if (!isoDate) return false;
  return isToday(parseISO(isoDate));
}

export function isUpcoming(isoDate: string | null): boolean {
  if (!isoDate) return false;
  return isFuture(parseISO(isoDate));
}

export function scheduleNotification(
  title: string,
  reminderAt: string,
  noteId: string,
): number | null {
  const time = parseISO(reminderAt).getTime() - Date.now();
  if (time <= 0) return null;
  if ("Notification" in window && Notification.permission === "granted") {
    return window.setTimeout(() => {
      new Notification("Web3NoteApp Reminder", {
        body: title || "You have a reminder",
        tag: noteId,
      });
    }, time);
  }
  return null;
}

export function requestNotificationPermission(): void {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}
