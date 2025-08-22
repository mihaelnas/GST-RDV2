/**
 * @fileOverview Zod schemas and TypeScript types for availability management.
 */
import { z } from 'zod';
import { parse } from 'date-fns';

// --- Zod Schemas ---

const DayScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(1).max(7),
  dayName: z.string(),
  isWorkingDay: z.boolean(),
  startTime: z.string().nullable(), // HH:mm format
  endTime: z.string().nullable(),   // HH:mm format
});

export const WeeklyScheduleSchema = z.object({
  schedule: z.array(DayScheduleSchema)
}).refine(data => {
  return data.schedule.every(day => {
    if (day.isWorkingDay) {
      if (!day.startTime || !day.endTime) return false;
      try {
        const start = parse(day.startTime, 'HH:mm', new Date());
        const end = parse(day.endTime, 'HH:mm', new Date());
        return start < end;
      } catch {
        return false;
      }
    }
    return true;
  });
}, {
  message: "Pour les jours travaillés, les heures de début et de fin sont requises et l'heure de début doit être antérieure à l'heure de fin.",
  path: ["schedule"],
});

export const AbsenceSchema = z.object({
  id: z.string(),
  doctorId: z.string(),
  date: z.string(), // ISO Date string (YYYY-MM-DD)
  isFullDay: z.boolean(),
  startTime: z.string().nullable(), // HH:mm
  endTime: z.string().nullable(),   // HH:mm
  reason: z.string().nullable(),
});

export const AbsenceCreateSchema = AbsenceSchema.omit({ id: true }).refine(data => {
  if (!data.isFullDay) {
    if (!data.startTime || !data.endTime) return false;
    try {
        const start = parse(data.startTime, 'HH:mm', new Date());
        const end = parse(data.endTime, 'HH:mm', new Date());
        return start < end;
    } catch {
        return false;
    }
  }
  return true;
}, {
    message: "Pour une absence partielle, les heures de début et de fin sont requises et valides.",
    path: ["startTime"],
});


export const DoctorAvailabilitySchema = z.object({
  weeklySchedule: z.array(DayScheduleSchema),
  absences: z.array(AbsenceSchema),
});


// --- TypeScript Types ---
export type DaySchedule = z.infer<typeof DayScheduleSchema>;
export type WeeklyScheduleFormValues = z.infer<typeof WeeklyScheduleSchema>;
export type Absence = z.infer<typeof AbsenceSchema>;
export type AbsenceCreateInput = z.infer<typeof AbsenceCreateSchema>;
export type DoctorAvailability = z.infer<typeof DoctorAvailabilitySchema>;
