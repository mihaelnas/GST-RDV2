
'use server';
/**
 * @fileOverview Manages doctor availability schedules and absences.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as ScheduleService from '@/services/scheduleService';
import { 
  WeeklyScheduleSchema,
  AbsenceSchema,
  AbsenceCreateSchema,
  DoctorAvailabilitySchema,
  type DaySchedule,
  type Absence,
  type AbsenceCreateInput,
  type DoctorAvailability
} from '@/ai/schemas/availabilitySchemas';


// --- Flows ---

const getDoctorAvailabilityFlow = ai.defineFlow(
  {
    name: 'getDoctorAvailabilityFlow',
    inputSchema: z.string(), // doctorId
    outputSchema: DoctorAvailabilitySchema,
  },
  async (doctorId) => {
    return ScheduleService.getDoctorAvailability(doctorId);
  }
);
export async function getDoctorAvailability(doctorId: string): Promise<DoctorAvailability> {
  return getDoctorAvailabilityFlow(doctorId);
}


const updateWeeklyScheduleFlow = ai.defineFlow(
  {
    name: 'updateWeeklyScheduleFlow',
    inputSchema: z.object({
        doctorId: z.string(),
        schedule: z.array(WeeklyScheduleSchema.shape.schedule.element),
    }),
    outputSchema: z.boolean(),
  },
  async ({ doctorId, schedule }) => {
    return ScheduleService.updateWeeklySchedule(doctorId, schedule);
  }
);
export async function updateWeeklySchedule(doctorId: string, schedule: DaySchedule[]): Promise<boolean> {
  return updateWeeklyScheduleFlow({ doctorId, schedule });
}


const addAbsenceFlow = ai.defineFlow(
  {
    name: 'addAbsenceFlow',
    inputSchema: AbsenceCreateSchema,
    outputSchema: AbsenceSchema,
  },
  async (absenceData) => {
    return ScheduleService.addAbsence(absenceData);
  }
);
export async function addAbsence(absenceData: AbsenceCreateInput): Promise<Absence> {
    return addAbsenceFlow(absenceData);
}

const deleteAbsenceFlow = ai.defineFlow(
  {
    name: 'deleteAbsenceFlow',
    inputSchema: z.string(), // absenceId
    outputSchema: z.boolean(),
  },
  async (absenceId) => {
    return ScheduleService.deleteAbsence(absenceId);
  }
);
export async function deleteAbsence(absenceId: string): Promise<boolean> {
    return deleteAbsenceFlow(absenceId);
}
