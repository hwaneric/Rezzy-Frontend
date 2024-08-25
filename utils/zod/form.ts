import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { isTime1EarlierThanTime2 } from "@/utils/time/timeUtils"

export const defaultValues = {
  userName: undefined,
  restaurantName: undefined,
  opentableURL: undefined,
  partySize: undefined,
  longitude: 0,
  latitude: 0,
  date1: null,
  minTime1: undefined,
  idealTime1: undefined,
  maxTime1: undefined,
  date2: null,
  minTime2: undefined,
  idealTime2: undefined,
  maxTime2: undefined,
  date3: null,
  minTime3: undefined,
  idealTime3: undefined,
  maxTime3: undefined,
}

export const formSchema = z.object({
  userName: z.string().min(1, { message: "Name cannot be empty" }),
  restaurantName: z.string().optional(),
  opentableURL: z.optional(z.string()),
  partySize: z.number().positive().int().max(20),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),

  date1: z.date().min(new Date(), { message: "Date cannot be in the past" }).optional().nullable(),
  minTime1: z.string().time().optional(),
  idealTime1: z.string().time().optional(),
  maxTime1: z.string().time().optional(),


  date2: z.date().min(new Date(), { message: "Date cannot be in the past" }).nullable().optional(),
  minTime2: z.string().time().optional(),
  idealTime2: z.string().time().optional(),
  maxTime2: z.string().time().optional(),

  date3: z.date().min(new Date(), { message: "Date cannot be in the past" }).nullable().optional(),
  minTime3: z.string().time().optional(),
  idealTime3: z.string().time().optional(),
  maxTime3: z.string().time().optional(),
})
.superRefine((data, ctx) => {
  if (!data.restaurantName && !data.opentableURL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide either the restaurant name or the OpenTable URL",
      path: ["restaurantName"],
      fatal: true
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide either the restaurant name or the OpenTable URL",
      path: ["opentableURL"],
      fatal: true 
    });
  }

  if (data.opentableURL && !data.opentableURL.includes("opentable")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "URL not from OpenTable",
      path: ["opentableURL"],
      fatal: true
    });
  }

  const dateTime1Exists = data.date1 && data.minTime1 && data.idealTime1 && data.maxTime1;
  const dateTime2Exists = data.date2 && data.minTime2 && data.idealTime2 && data.maxTime2;
  const dateTime3Exists = data.date3 && data.minTime3 && data.idealTime3 && data.maxTime3;

  if (!dateTime1Exists && 
      !dateTime2Exists && 
      !dateTime3Exists) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one date and timemust be defined",
      path: ["date1"],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one date and time must be defined",
      path: ["date2"],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one date and time must be defined",
      path: ["date3"],
    });
  }

  // For date-time pairs that exist, check that the minTime <= idealTime <= maxTime
  if (dateTime1Exists && !((isTime1EarlierThanTime2(data.minTime1, data.idealTime1)) && isTime1EarlierThanTime2(data.idealTime1, data.maxTime1))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Times are not satisfiable",
      path: ["minTime1"],
    });
  }

  if (dateTime2Exists && !((isTime1EarlierThanTime2(data.minTime2, data.idealTime2)) && isTime1EarlierThanTime2(data.idealTime2, data.maxTime2))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Times are not satisfiable",
      path: ["minTime2"],
    });
  }

  if (dateTime3Exists && !((isTime1EarlierThanTime2(data.minTime3, data.idealTime3)) && isTime1EarlierThanTime2(data.idealTime3, data.maxTime3))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Times are not satisfiable",
      path: ["minTime3"],
    });
  }

  
  // Reject incomplete dates-time pairs
  if (!dateTime1Exists && (data.date1 || data.minTime1 || data.idealTime1 || data.maxTime1)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Incomplete date-time",
      path: ["date1"],
    });
  }
  if (!dateTime2Exists && (data.date2 || data.minTime2 || data.idealTime2 || data.maxTime2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Incomplete date-time",
      path: ["date2"],
    });
  }
  if (!dateTime3Exists && (data.date3 || data.minTime3 || data.idealTime3 || data.maxTime3)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Incomplete date-time",
      path: ["date3"],
    });
  }
    
  if (data.longitude === 0 && data.latitude === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide an approximate location",
      path: ["longitude"],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide an approximate location",
      path: ["latitude"],
    });
  }
});
