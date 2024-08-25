"use client";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { TypographyH4, TypographyP } from "@/components/ui/typography";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import RezzyDatePicker from "./RezzyDatePicker";
import { useEffect, useState } from "react";
import _ from "lodash";
import { toast } from "./ui/use-toast";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/database.types";
import { Separator } from "./ui/separator";
import { formSchema, defaultValues } from "@/utils/zod/form";
import { useRouter } from "next/navigation";
import { generateTimeOptions } from "@/utils/time/formatting";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CirclePlus, LucideSquarePlus, SquarePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type rezzyInsertType = Database['public']['Tables']["rezzys"]["Insert"];

export default function MakeRezzyDialog() {
  const [open, setOpen] = useState(false);
  const [date2Open, setDate2Open] = useState(false);
  const [date3Open, setDate3Open] = useState(false);
  const times = generateTimeOptions();
  const router = useRouter();
  console.log(date2Open)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  })

  // Watch certain fields for revalidation so users don't see unecessary errors before submitting
  const date1 = form.watch("date1");
  const idealTime1 = form.watch("idealTime1");
  const maxTime1 = form.watch("maxTime1");
  const minTime1 = form.watch("minTime1");

  const date2 = form.watch("date2");
  const idealTime2 = form.watch("idealTime2");
  const maxTime2 = form.watch("maxTime2");
  const minTime2 = form.watch("minTime2");

  const date3 = form.watch("date3");
  const idealTime3 = form.watch("idealTime3");
  const maxTime3 = form.watch("maxTime3");
  const minTime3 = form.watch("minTime3");

  // Delay validation for restaurant name and OpenTable URL for 0.5 seconds after last keystroke
  let debounceTimeout = setTimeout(() => {}, 0); 
  function debounceValidation() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      form.trigger(["restaurantName", "opentableURL"]);
    }, 500);
  }

  // Revalidate form when certain fields change
  useEffect(() => {
    form.trigger(["date1", "minTime1", "idealTime1", "maxTime1", "date2", "minTime2", "idealTime2", "maxTime2", "date3", "minTime3", "idealTime3", "maxTime3"]);
  }, [date1, idealTime1, minTime1, maxTime1, date2, idealTime2, minTime2, maxTime2, date3, idealTime3, minTime3, maxTime3, form.trigger]);

  // If user previously gave location permission, pre-load and cache it on first load
  useEffect(() => {
    navigator.permissions.query({ name: 'geolocation' }).then(function(permissionStatus) {
      if (permissionStatus.state === 'granted') {
          // Permission was previously granted
          navigator.geolocation.getCurrentPosition((position) => {
            form.setValue("longitude", position.coords.longitude);
            form.setValue("latitude", position.coords.latitude);
            form.trigger(["longitude", "latitude"]);
          });
      }
    })
  }, []);


  function formatValues(values: z.infer<typeof formSchema>, email: string): rezzyInsertType {
    // Push up dates and times
    if (!values.date1) {
      if (values.date3 && values.minTime3 && values.idealTime3 && values.maxTime3) {
        values.date1 = values.date3;
        values.minTime1, values.idealTime1, values.maxTime1 = values.minTime3, values.idealTime3, values.maxTime3;
        values.date3 = values.minTime3 = values.idealTime3 = values.maxTime3 = undefined;
      }
      else {
        values.date1 = values.date2;
        values.minTime1, values.idealTime1, values.maxTime1 = values.minTime2, values.idealTime2, values.maxTime2;
        values.date2 = values.minTime2 = values.idealTime2 = values.maxTime2 = undefined;
      }
    }
   
    if (!values.date2 && values.date3) {
      values.date2 = values.date3;
      values.minTime2, values.idealTime2, values.maxTime2 = values.minTime3, values.idealTime3, values.maxTime3;
      values.date3 = values.minTime3 = values.idealTime3 = values.maxTime3 = undefined;
    }

    const formattedValues : rezzyInsertType = {
      latitude: values.latitude,
      longitude: values.longitude,
      name: values.userName,
      opentable_url: values.opentableURL,
      party_size: values.partySize,
      restaurant_name: values.restaurantName,
      date1: values.date1 ? values.date1.toISOString() : "",
      date2: values.date2 ? values.date2.toISOString() : null,
      date3: values.date3 ? values.date3.toISOString() : null,
      minTime1: values.minTime1 ? values.minTime1 : "",
      idealTime1: values.idealTime1 ? values.idealTime1 : "",
      maxTime1: values.maxTime1 ? values.maxTime1 : "",
      minTime2: values.minTime2 ? values.minTime2 : null,
      idealTime2: values.idealTime2 ? values.idealTime2 : null,
      maxTime2: values.maxTime2 ? values.maxTime2 : null,
      minTime3: values.minTime3 ? values.minTime3 : null,
      idealTime3: values.idealTime3 ? values.idealTime3 : null,
      maxTime3: values.maxTime3 ? values.maxTime3 : null,
      user_email: email,
    }
    return formattedValues;
  }
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(form.formState.errors);
    console.log("Hello");
    console.log(values);
    
    // Upload Rezzy to Supabase
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return toast({
        title: "Destructive!",
        variant: "destructive",
        description: "User could not be found. Please log in again.",
      });
    }
    const formattedValues = formatValues(values, user.email);

    const { data, error } = await supabase
      .from("rezzys")
      .upsert({ ...formattedValues, user_email: user.email })
      .select();
    
    console.log("Response from Supabase: ", data, error)

    if (error) {
      console.log(error);
      if (error.message === 'duplicate key value violates unique constraint "rezzys_user_email_key"') {
        error.message = "You already have a Rezzy. Due to resource limitations, users are only allowed 1 Rezzy at a time"
      }
      
      return toast({
        title: "Error Saving Your Rezzy",
        variant: "destructive",
        description: error.message
      })
    }
    
    setOpen(!open);
    form.reset(defaultValues);
    router.refresh();
    return toast({
      title: "Success!",
      description: "Rezzy has been made! You will be notified as soon as an opening appears.",
    });
  }

  const toggleOpen = () => {
    const isClosing = open;
    const formValues = form.getValues();
    const changesWereMade = !_.isEqual(defaultValues, formValues) as boolean;
    if (isClosing && changesWereMade) {
      if (!window.confirm("Are you sure you want to exit? Your changes will be lost.")) {
        return;
      }
      form.reset(defaultValues);
    }
    setOpen(!open);
    setDate2Open(false);
    setDate3Open(false);
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      form.setValue("longitude", 0);
      form.setValue("latitude", 0);

      navigator.geolocation.getCurrentPosition((position) => {
        form.setValue("longitude", position.coords.longitude);
        form.setValue("latitude", position.coords.latitude);

        // Revalidate form to avoid validation warnings to user
        form.trigger(["longitude", "latitude"]);
      }, (error) => {
        return toast({
          title: "Error While Getting Location",
          description: error.message,
          variant: "destructive",
        });
      }, 
      {
        enableHighAccuracy: false,
        // timeout: 5000,
        maximumAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
      }
    );
    } else {
      return toast({
        title: "Location Unavailable",
        description: "Unfortunately, your browser does not support location services :(",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={toggleOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="text-2xl text-center bg-purple-400"> <span className="text-3xl text-center mb-1 mr-1">+ </span> Make Rezzy</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4/5 w-2/3 px-4 sm:px-6 lg:px-8 overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-purple-400">Make Rezzy</DialogTitle>
          <DialogDescription>
            Configure your dream reservation here. Then, Rezzy will notify you as soon as an opening appears!
          </DialogDescription>
        </DialogHeader>

        {/* FORM HERE */}
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem className="w-2/3">
                    <FormLabel className="text-purple-400">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Restaurant Name or OpenTable URL */}
              <div className="flex flex-row items-center gap-10">
                <FormField
                  control={form.control}
                  name="restaurantName"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel className="text-purple-400">Restaurant Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Restaurant Name" {...field} onChange={(value) => {field.onChange(value), debounceValidation()}} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <TypographyH4 className="mt-6">Or</TypographyH4>

                <FormField
                  control={form.control}
                  name="opentableURL"
                  render={({ field }) => (
                    <FormItem className="mt-[8px] w-1/2">
                      <FormLabel className="text-purple-400 flex flex-row items-center gap-1">
                        <p>OpenTable URL</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger> 
                              <InfoIcon/>
                            </TooltipTrigger>
                            <TooltipContent className="min-w-36 max-w-52 -translate-x-16 md:-translate-x-7">
                              <TypographyP>
                                The URL of your desired restaurant's OpenTable page.
                                <br/>
                                <br/>
                                Here is an example: &nbsp;
                                <a target="_blank" className="text-blue-400 no-underline hover:underline" href="https://www.opentable.com/house-of-prime-rib?corrid=f8a4c49a-3acc-4184-8757-2a7a1d464af3&p=2&sd=2024-08-24T22%3A30%3A00">House of Prime Rib</a>
                              </TypographyP>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                      </FormLabel>
                      <FormControl>
                        <Input className="w-full" placeholder="OpenTable URL" {...field} onChange={(value) => {field.onChange(value), debounceValidation()}}/>
                      </FormControl>
                      <FormDescription>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Party Size */}
              <FormField
                control={form.control}
                name="partySize"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel className="text-purple-400">Party Size</FormLabel>
                      <FormControl>
                        <Select onValueChange={(value) => field.onChange(Number(value))}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Party Size" />
                          </SelectTrigger>
                        
                          <SelectContent>
                            {/* Generate select options from 1 to 20 */}
                            {Array.from({ length: 20 }, (_, i) => i + 1).map((number) => (
                              <SelectItem key={number} value={number.toString()}>
                                {number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1 items-center">
                  <div className="text-purple-400 flex flex-row items-center gap-1">
                    <TypographyP className="text-center text-purple-400">Restaurant Approximate Location</TypographyP>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger> 
                          <InfoIcon/>
                        </TooltipTrigger>
                        <TooltipContent className="min-w-36 max-w-52 -translate-x-16 md:-translate-x-7">
                          <TypographyP>
                            The approximate location of the restaurant. You can check coordinates on <a target="_blank" className="text-blue-400 no-underline hover:underline" href="https://support.google.com/maps/answer/18539?hl=en&co=GENIE.Platform%3DDesktop&oco=1">Google Maps.</a>
                            <br/>
                            <br/>
                            We use your location to find restaurants near you. We never sell or store your location.
                          </TypographyP>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  

                  <Button variant="outline" onClick={useCurrentLocation} size={"sm"} className="flex items-cente text-sm">
                    <LocateIcon className="h-4 w-4 mr-1" />
                    Use Current Location
                  </Button>
                </div>
                <div className="flex flex-row items-center gap-10">
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormLabel className="text-purple-400">Longitude</FormLabel>
                        <FormControl>
                          <Input placeholder="Longitude" value={field.value ? field.value : 0} onChange={(e) => {field.onChange(parseFloat(e.target.value ? e.target.value : "0"))}} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <TypographyH4 className="mt-6">And</TypographyH4>
                  
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem className="w-1/2 mt-[8px]">
                        <FormLabel className="text-purple-400">Latitude</FormLabel>
                        <FormControl>
                          <Input placeholder="Latitude" value={field.value ? field.value : 0} onChange={(e) => {field.onChange(parseFloat(e.target.value ? e.target.value : "0"))}} />
                        </FormControl>
                        <FormDescription>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>



              <Separator/>
              
              {/* Date and Time 1 */}
              <FormField
                  control={form.control}
                  name="date1"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel className="text-purple-400">Date 1</FormLabel>
                      <FormControl>
                        <div className="flex flex-row items-center gap-10">
                          <RezzyDatePicker field={field}/>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="flex flex-row gap-10 items-center w-full">
                <FormField
                  control={form.control}
                  name="minTime1"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <div className="mb-[8px]">
                        <FormLabel className="text-purple-400">Earliest Time 1</FormLabel>
                      </div>
                      
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {times.map((time) => (
                                <SelectItem key={time.value} value={time.value}>
                                  {time.time}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idealTime1"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <div className="mb-[8px]">
                        <FormLabel className="text-purple-400">Ideal Time 1</FormLabel>
                      </div>
                      
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {times.map((time) => (
                                <SelectItem key={time.value} value={time.value}>
                                  {time.time}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxTime1"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <div className="mb-[8px]">
                        <FormLabel className="text-purple-400">Latest Time 1</FormLabel>
                      </div>
                      
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {times.map((time) => (
                                <SelectItem key={time.value} value={time.value}>
                                  {time.time}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Date and Time 2 */}
              {date2Open ? (
                <>
                  <Separator/>
                  <FormField
                      control={form.control}
                      name="date2"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="flex flex-row justify-between w-full items-center">
                            <TypographyP className="text-purple-400">Date 2 </TypographyP>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger> 
                                  <Trash2 
                                    onClick={() => {
                                      setDate2Open(false);
                                      form.setValue("date2", null);
                                      form.setValue("minTime2", undefined);
                                      form.setValue("idealTime2", undefined);
                                      form.setValue("maxTime2", undefined);
                                    }} 
                                    className="w-5 h-5 text-red-500"/>
                                </TooltipTrigger>
                                <TooltipContent className="-translate-x-10 md:-translate-x-7">
                                  <TypographyP>
                                    Delete Date
                                  </TypographyP>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                          </FormLabel>
                          <FormControl>
                            <div className="flex flex-row items-center gap-10 w-1/2">
                              <RezzyDatePicker field={field}/>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <div className="flex flex-row gap-10 items-center w-full">
                    <FormField
                      control={form.control}
                      name="minTime2"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <div className="mb-[8px]">
                            <FormLabel className="text-purple-400">Earliest Time 2</FormLabel>
                          </div>
                          
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                              <SelectContent>
                                <SelectGroup>
                                  {times.map((time) => (
                                    <SelectItem key={time.value} value={time.value}>
                                      {time.time}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="idealTime2"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <div className="mb-[8px]">
                            <FormLabel className="text-purple-400">Ideal Time 2</FormLabel>
                          </div>
                          
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                              <SelectContent>
                                <SelectGroup>
                                  {times.map((time) => (
                                    <SelectItem key={time.value} value={time.value}>
                                      {time.time}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxTime2"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <div className="mb-[8px]">
                            <FormLabel className="text-purple-400">Latest Time 2</FormLabel>
                          </div>
                          
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                              <SelectContent>
                                <SelectGroup>
                                  {times.map((time) => (
                                    <SelectItem key={time.value} value={time.value}>
                                      {time.time}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>) : (
                  // Add Date 2 Button
                  <div className="flex items-center justify-center w-full">
                    {/* Left line */}
                    <div className="flex-grow h-px bg-purple-300"></div>

                    {/* Icon */}
                    <CirclePlus 
                      onClick={() => setDate2Open(true)} 
                      className="mx-4 text-purple-400 hover:cursor-pointer transition-colors hover:text-purple-400/50" 
                      size={24} 
                    />

                    {/* Right line */}
                    <div className="flex-grow h-px bg-purple-300"></div>
                  </div>
                )
                
              }
              
              {/* Date and Time 3 */}
              {(date2Open && date3Open) ? (
                <>
                  <Separator/>
                  <FormField
                    control={form.control}
                    name="date3"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-purple-400 flex flex-row justify-between">
                          <TypographyP>Date 3</TypographyP>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger> 
                                <Trash2 
                                onClick={() => {
                                  setDate3Open(false);
                                  form.setValue("date3", null);
                                  form.setValue("minTime3", undefined);
                                  form.setValue("idealTime3", undefined);
                                  form.setValue("maxTime3", undefined);
                                }} 
                                className="w-5 h-5 text-red-500"/>
                              </TooltipTrigger>
                              <TooltipContent className="-translate-x-10 md:-translate-x-7">
                                <TypographyP>
                                  Delete Date
                                </TypographyP>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                        </FormLabel>
                        <FormControl>
                          <div className="flex flex-row items-center gap-10 w-1/2">
                            <RezzyDatePicker field={field}/>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-row gap-10 items-center w-full">
                    <FormField
                      control={form.control}
                      name="minTime3"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <div className="mb-[8px]">
                            <FormLabel className="text-purple-400">Earliest Time 3</FormLabel>
                          </div>
                          
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                              <SelectContent>
                                <SelectGroup>
                                  {times.map((time) => (
                                    <SelectItem key={time.value} value={time.value}>
                                      {time.time}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="idealTime3"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <div className="mb-[8px]">
                            <FormLabel className="text-purple-400">Ideal Time 3</FormLabel>
                          </div>
                          
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                              <SelectContent>
                                <SelectGroup>
                                  {times.map((time) => (
                                    <SelectItem key={time.value} value={time.value}>
                                      {time.time}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxTime3"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <div className="mb-[8px]">
                            <FormLabel className="text-purple-400">Latest Time 3</FormLabel>
                          </div>
                          
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                              <SelectContent>
                                <SelectGroup>
                                  {times.map((time) => (
                                    <SelectItem key={time.value} value={time.value}>
                                      {time.time}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Separator/>
                </>
              ) : (
                (date2Open && (
                  // Add Date 3 Button
                  <div className="flex items-center justify-center w-full">
                    {/* Left line */}
                    <div className="flex-grow h-px bg-purple-300"></div>

                    {/* Icon */}
                    <CirclePlus 
                      onClick={() => setDate3Open(true)} 
                      className="mx-4 text-purple-400 hover:cursor-pointer transition-colors hover:text-purple-400/50" 
                      size={24} 
                    />

                    {/* Right line */}
                    <div className="flex-grow h-px bg-purple-300"></div>
                  </div>
                )

                )
                
              )}
              

              <div className="flex justify-end">
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
        </div>

        
      </DialogContent>
    </Dialog>
  )
}

function LocateIcon(props: any) {
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
      <line x1="2" x2="5" y1="12" y2="12" />
      <line x1="19" x2="22" y1="12" y2="12" />
      <line x1="12" x2="12" y1="2" y2="5" />
      <line x1="12" x2="12" y1="19" y2="22" />
      <circle cx="12" cy="12" r="7" />
    </svg>
  )
}

function InfoIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
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

