// "use client"

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { TypographyP } from "./ui/typography";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { indexToTime } from "@/utils/time/formatting";

const TimeSlider = ({ min = 0, max = 47, values = [23, 24, 25], step = 1 }) => {
  // const [values, setValues] = React.useState(initialValues);
  const adjustedMin = Math.max(Math.min(...values) - 1, 0);
  const adjustedMax = Math.min(Math.max(...values) + 1, 47);
  const timeLabels = ["Earliest", "Ideal", "Latest"];

  return (
    <SliderPrimitive.Root
      className="relative flex w-full touch-none select-none items-center"
      value={values}
      // onValueChange={setValues}
      min={adjustedMin}
      max={adjustedMax}
      step={step}
      // minStepsBetweenThumbs={1}
      disabled={true}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-slate-300">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-purple-400" />
      </SliderPrimitive.Track>
      {values.map((value, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className="block h-5 w-5 rounded-full bg-white border-2 border-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 items-center justify-center"
        >
          <TypographyP className={`${index % 2 === 0 ? 'translate-y-2/3' : '-translate-y-full'} -translate-x-full`}>{indexToTime(value)}</TypographyP>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className=""> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </TooltipTrigger>
              <TooltipContent>
                <p>{timeLabels[index]} </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SliderPrimitive.Thumb>
        
        
      ))}
    </SliderPrimitive.Root>
  );
};

export default TimeSlider;
