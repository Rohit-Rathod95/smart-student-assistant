function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toTime(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function getFreeSlots(
  classes: { start: string; end: string }[],
  dayStart: string = "06:00",
  dayEnd: string = "23:00"
) {
  const free: { start: string; end: string }[] = [];

  // If no classes, entire day is free
  if (classes.length === 0) {
    return [{ start: dayStart, end: dayEnd }];
  }

  const sorted = [...classes].sort(
    (a, b) => toMinutes(a.start) - toMinutes(b.start)
  );

  const dayStartMin = toMinutes(dayStart);
  const dayEndMin = toMinutes(dayEnd);

  // Free time before first class
  const firstClassStart = toMinutes(sorted[0].start);
  if (firstClassStart - dayStartMin >= 30) {
    free.push({
      start: dayStart,
      end: sorted[0].start,
    });
  }

  // Free time between classes
  for (let i = 0; i < sorted.length - 1; i++) {
    const end = toMinutes(sorted[i].end);
    const nextStart = toMinutes(sorted[i + 1].start);

    if (nextStart - end >= 30) {
      free.push({
        start: toTime(end),
        end: toTime(nextStart),
      });
    }
  }

  // Free time after last class
  const lastClassEnd = toMinutes(sorted[sorted.length - 1].end);
  if (dayEndMin - lastClassEnd >= 30) {
    free.push({
      start: sorted[sorted.length - 1].end,
      end: dayEnd,
    });
  }

  return free;
}

export function getTotalFreeMinutes(freeSlots: { start: string; end: string }[]) {
  return freeSlots.reduce((total, slot) => {
    return total + (toMinutes(slot.end) - toMinutes(slot.start));
  }, 0);
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}