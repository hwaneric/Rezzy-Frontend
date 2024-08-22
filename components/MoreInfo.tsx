/**
 * v0 by Vercel.
 * @see https://v0.dev/t/t4wO14JfNPX
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import { useState } from "react"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { TypographyP } from "./ui/typography"

export default function Component() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="relative inline-block">
      <TooltipProvider>
        <Tooltip open={isOpen} onOpenChange={setIsOpen}>
          <TooltipTrigger asChild>
            <div className="flex flex-row items-center">
              <TypographyP>Please enable your location</TypographyP>
              <Button variant="ghost" size="icon" className="rounded-full w-6 h-6" onClick={() => setIsOpen(!isOpen)}>
                <InfoIcon className="w-4 h-4" />
              </Button>
            </div>
            
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px] text-sm text-slate-800">
            We only use your location to find restaurants near you. We never sell or store your location.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function InfoIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}