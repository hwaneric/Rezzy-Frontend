"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { TypographyH4, TypographyP } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Database } from "@/database.types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon } from "lucide-react"
import { formatDate, formatTime, timeToIndex } from "@/utils/time/timeUtils";
import { Separator } from "@/components/ui/separator";
import TimeSlider from "@/components/TimeSlider";
import { useEffect, useTransition } from "react";


type rezzyType = Database['public']['Tables']["rezzys"]["Row"];

export default function RezzyDisplayCard({ rezzy, setLoading }: { rezzy: rezzyType, setLoading: (loading: boolean) => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // When router.refresh() finishes, set loading to false
  useEffect(() => {
    setLoading(isPending)
  }, [isPending])

  const handleCancelRezzy = async () => {
    const supabase = createClient();

    const { error } = await supabase
      .from("rezzys")
      .delete()
      .eq("id", rezzy.id);

    if (error) {
      return toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to cancel reservation. Error details: " + error.message,
      });
    }

    startTransition(() => {
      router.refresh()
    })
    return toast({
      title: "Success",
      description: "Reservation cancelled successfully",
    });

  }


  return (
    <Card className={`lg:w-[55%] md:w-5/6 mb-12`}>
      <CardHeader className="mt-0">
        <div className="flex flex-row gap-8 items-center">
          <CardTitle className="mt-0 text-purple-400 underline">
              {rezzy.restaurant_name ? (
                rezzy.restaurant_name 
              ) : (
                <a href={rezzy.opentable_url as string}> Your Restaurant </a>
              )}
          </CardTitle>
          <div className="flex flex-row items-center">
            <TypographyP className="mt-0 text-xl justify-end font-normal">{rezzy.party_size} </TypographyP>
            <UserIcon className="h-6 w-6 text-slate-700"/>
          </div>
          
        </div>
        <CardDescription className="text-base">Under Name: {rezzy.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <TypographyH4 className="font-bold text-center text-purple-400">Location </TypographyH4>
          <div className="flex flex-row gap-10 justify-center">
            <TypographyP className="">Latitude: {rezzy.latitude} </TypographyP>
            <TypographyP className="">Longitude: {rezzy.longitude} </TypographyP>
          </div>

          <div>
            <TypographyH4 className="font-bold text-center mt-5 text-purple-400">Dates </TypographyH4>

            <div className="flex flex-col md:flex-row md:gap-5 gap-3 items-center">
              <TypographyP className="font-semibold text-right">{formatDate(rezzy.date1)} </TypographyP>
              
              <div className="flex flex-row gap-3 h-full mx-auto">
                <TypographyP>{formatTime(rezzy.minTime1)} - {formatTime(rezzy.maxTime1)} </TypographyP>
                <Separator orientation="vertical" className="w-[2px] bg-slate-400"/>
                <TypographyP>Ideal Time: {formatTime(rezzy.idealTime1)} </TypographyP>
              </div>

              <div className="w-64 mt-6 mb-8 md:mt-0 md:mb-0 mr-2">
                <TimeSlider values={[timeToIndex(rezzy.minTime1), timeToIndex(rezzy.idealTime1), timeToIndex(rezzy.maxTime1)]}/>
              </div>
            </div>

            {rezzy.date2 && rezzy.idealTime2 && rezzy.minTime2 && rezzy.maxTime2 && (
              <div className="flex flex-col md:flex-row md:gap-5 gap-3 items-center mt-10">
                <TypographyP className="font-semibold text-right">{formatDate(rezzy.date1)} </TypographyP>
                
                <div className="flex flex-row gap-3 h-full mx-auto">
                  <TypographyP>{formatTime(rezzy.minTime2)} - {formatTime(rezzy.maxTime2)} </TypographyP>
                  <Separator orientation="vertical" className="w-[2px] bg-slate-400"/>
                  <TypographyP>Ideal Time: {formatTime(rezzy.idealTime2)} </TypographyP>
                </div>

                <div className="w-64 mt-6 mb-8 md:mt-0 md:mb-0 mr-2">
                  <TimeSlider values={[timeToIndex(rezzy.minTime2), timeToIndex(rezzy.idealTime2), timeToIndex(rezzy.maxTime2)]}/>
                </div>
            </div>
            )}

            {rezzy.date3 && rezzy.idealTime3 && rezzy.minTime3 && rezzy.maxTime3 && (
              <div className="flex flex-col md:flex-row md:gap-5 gap-3 items-center mt-10 justify-between">
                <TypographyP className="font-semibold text-right">{formatDate(rezzy.date1)} </TypographyP>
                
                <div className="flex flex-row gap-3 h-full mx-auto">
                  <TypographyP>{formatTime(rezzy.minTime3)} - {formatTime(rezzy.maxTime3)} </TypographyP>
                  <Separator orientation="vertical" className="w-[2px] bg-slate-400"/>
                  <TypographyP>Ideal Time: {formatTime(rezzy.idealTime3)} </TypographyP>
                </div>

                <div className="w-64 mt-6 mb-8 md:mt-0 md:mb-0 mr-2">
                  <TimeSlider values={[timeToIndex(rezzy.minTime3), timeToIndex(rezzy.idealTime3), timeToIndex(rezzy.maxTime3)]}/>
                </div>
            </div>
            )}
          </div>
          
        </div>
      </CardContent>
      <CardFooter className="justify-end mt-10">
        <Button className="w-28 h-9" variant="destructive" onClick={handleCancelRezzy}>Cancel Rezzy</Button>
      </CardFooter>
    </Card>
  )


}
