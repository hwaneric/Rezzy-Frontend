"use client"

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

const TimeSlider = ({ min = 0, max = 100, initialValues = [20, 50, 80], step = 1 }) => {
  const [values, setValues] = React.useState(initialValues);

  const handleValueChange = (newValues: number[]) => {
    const constrainedValues = newValues.map((value, index) => {
      if (index === 0) {
        return Math.min(value, values[1] - step);
      }
      if (index === values.length - 1) {
        return Math.max(value, values[index - 1] + step);
      }
      return Math.min(
        Math.max(value, values[index - 1] + step),
        values[index + 1] - step
      );
    });
    setValues(constrainedValues);
  };

  return (
    <SliderPrimitive.Root
      className="relative flex w-full touch-none select-none items-center"
      value={values}
      onValueChange={handleValueChange}
      min={min}
      max={max}
      step={step}
      minStepsBetweenThumbs={1}
      disabled={true}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-gray-300">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-blue-500" />
      </SliderPrimitive.Track>
      {values.map((value, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className="block h-5 w-5 rounded-full bg-white border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ))}
    </SliderPrimitive.Root>
  );
};

export default TimeSlider;
