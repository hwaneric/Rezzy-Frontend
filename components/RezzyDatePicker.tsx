"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface FieldProps {
  onChange: (event: Date | undefined) => void;
  [key: string]: any; // This allows for other properties of any type
}

export default function RezzyDatePicker({ field }: { field: FieldProps }) {
  const [date, setDate] = React.useState<Date>()

  return (
    // This div overrides the Calendar's default inline-flex
    <div className="flex w-full w-max-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "max-w-full w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Select date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(day) => {setDate(day), field.onChange(day)}}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
