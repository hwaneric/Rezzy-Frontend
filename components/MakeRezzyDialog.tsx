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
import { date, z } from "zod"
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
import { use, useEffect, useState } from "react";
import _ from "lodash";
import { toast } from "./ui/use-toast";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/database.types";
import TimeSelect from "./TimeSlider";
import { Separator } from "./ui/separator";
import path from "path";


type rezzyInsertType = Database['public']['Tables']["rezzys"]["Insert"];

function test(data) {
  console.log("test", data);
  return false
}

function isTime1EarlierThanTime2(time1: string | undefined, time2: string | undefined) {
  if (!time1 || !time2) return new Error("Time1 and Time2 must be defined");

  const [hours1, minutes1, seconds1] = time1.split(":").map(Number);
  const [hours2, minutes2, seconds2] = time2.split(":").map(Number);

  if (hours1 < hours2) return true;
  if (hours1 > hours2) return false;

  if (minutes1 < minutes2) return true;
  if (minutes1 > minutes2) return false;

  return seconds1 <= seconds2;
}

const formSchema = z.object({
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
}).superRefine((data, ctx) => {
  if (test(data) || !data.restaurantName && !data.opentableURL) {
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
      fatal: true,
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one date and time must be defined",
      path: ["date2"],
      fatal: true,
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one date and time must be defined",
      path: ["date3"],
      fatal: true,
    });
  }

  // For date-time pairs that exist, check that the minTime <= idealTime <= maxTime
  if (dateTime1Exists && !((isTime1EarlierThanTime2(data.minTime1, data.idealTime1)) && isTime1EarlierThanTime2(data.idealTime1, data.maxTime1))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Times are not satisfiable",
      path: ["minTime1"],
      fatal: true
    });
  }

  if (dateTime2Exists && !((isTime1EarlierThanTime2(data.minTime2, data.idealTime2)) && isTime1EarlierThanTime2(data.idealTime2, data.maxTime2))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Times are not satisfiable",
      path: ["minTime2"],
      fatal: true
    });
  }

  if (dateTime3Exists && !((isTime1EarlierThanTime2(data.minTime3, data.idealTime3)) && isTime1EarlierThanTime2(data.idealTime3, data.maxTime3))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Times are not satisfiable",
      path: ["minTime3"],
      fatal: true
    });
  }
    
  if (data.longitude === 0 && data.latitude === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide an approximate location",
      path: ["longitude"],
      fatal: true
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide an approximate location",
      path: ["latitude"],
      fatal: true
    });
  }
});

const defaultValues = {
  userName: undefined,
  restaurantName: undefined,
  opentableURL: undefined,
  partySize: undefined,
  longitude: 0,
  latitude: 0,
  date1: null,
  time1: undefined,
  date2: null,
  time2: undefined,
  date3: null,
  time3: undefined,
}

export default function MakeRezzyDialog() {
  const [open, setOpen] = useState(false);
  const times = generateTimeOptions();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  })

  // Watch certain fields for revalidation so users don't see unecessary errors before submitting
  const restaurantName = form.watch("restaurantName");
  const opentableURL = form.watch("opentableURL");
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

  // Revalidate the form when certain fields are updated
  useEffect(() => {
    form.trigger(["restaurantName", "opentableURL"]);
  }, [restaurantName, opentableURL, form.trigger]);

  useEffect(() => {
    form.trigger(["date1", "minTime1", "idealTime1", "maxTime1", "date2", "minTime2", "idealTime2", "maxTime2", "date3", "minTime3", "idealTime3", "maxTime3"]);
  }, [date1, idealTime1, minTime1, maxTime1, date2, idealTime2, minTime2, maxTime2, date3, idealTime3, minTime3, maxTime3, form.trigger]);

  // If user previously gave location permission, pre-load and cache it on first load
  useEffect(() => {
    navigator.permissions.query({ name: 'geolocation' }).then(function(permissionStatus) {
      if (permissionStatus.state === 'granted') {
          // Permission was previously granted
          console.log('Permission granted');
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
    // TODO: Send form data to Supabase and call API 
    
    // TRY TO UPLOAD TO SUPABASE REZZY. ADD DATABASE FUNCTION PREVENT THE USER FROM MAKING A REZZY IF THEY ALREADY HAVE ONE OR IF THEY ARE NOT WHITELISTED
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
      if (error.message === 'duplicate key value violates unique constraint "rezzys_user_email_key"') {
        error.message = "You already have a Rezzy. Due to resource limitations, users are only allowed 1 Rezzy at a time"
      }

      console.log("IN ERROR")
      return toast({
        title: "Error Saving Your Rezzy",
        variant: "destructive",
        description: error.message
      })
    }
    
    toggleOpen();
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
  };

  const useCurrentLocation = () => {
    var start = new Date().getTime();
    console.log("Getting location")
    if (navigator.geolocation) {
      form.setValue("longitude", 0);
      form.setValue("latitude", 0);
      var end = new Date().getTime();
      console.log("Browser has geolocation. Took: ", end - start, " ms")
      start = new Date().getTime();

      navigator.geolocation.getCurrentPosition((position) => {
        end = new Date().getTime();
        console.log("Got location. Took: ", end - start, " ms")
        start = new Date().getTime(); 

        form.setValue("longitude", position.coords.longitude);
        form.setValue("latitude", position.coords.latitude);

        end = new Date().getTime();
        console.log("form values set. Took: ", end - start, " ms")
        start = new Date().getTime();
        // Revalidate form to avoid validation warnings to user
        form.trigger(["longitude", "latitude"]);
        end = new Date().getTime();
        console.log("Form trigger ran. Took ", end - start, " ms");
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
            Configure your dream reservation here. Then, Rezzy will email you as soon as an opening appears.
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
                        <Input placeholder="Restaurant Name" {...field} />
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
                    <FormItem className="w-1/2 mt-[8px]">
                      <FormLabel className="text-purple-400">OpenTable URL</FormLabel>
                      <FormControl>
                        <Input placeholder="OpenTable URL" {...field} />
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
                  <TypographyP className="text-center text-purple-400">Restaurant Approximate Location</TypographyP>
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
              
              <Separator/>
              {/* Date and Time 2 */}
              <FormField
                  control={form.control}
                  name="date2"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel className="text-purple-400">Date 2</FormLabel>
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
              
              <Separator/>

              {/* Date and Time 3 */}
              <FormField
                  control={form.control}
                  name="date3"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel className="text-purple-400">Date 3</FormLabel>
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

              {/* Date and Time 2 */}
              {/* <div className="flex flex-row gap-10 items-center w-full">
                <FormField
                  control={form.control}
                  name="date2"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel className="text-purple-400">Date 2</FormLabel>
                      <FormControl>
                        <div className="flex flex-row items-center gap-10">
                          <RezzyDatePicker field={field}/>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time2"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <div className="mb-[8px]">
                        <FormLabel className="text-purple-400">Time 2</FormLabel>
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
              
              {/* Date and Time 3 */}
              {/* <div className="flex flex-row gap-10 items-center w-full">
                <FormField
                  control={form.control}
                  name="date3"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel className="text-purple-400">Date 3</FormLabel>
                      <FormControl>
                        <div className="flex flex-row items-center gap-10">
                          <RezzyDatePicker field={field}/>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time3"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <div className="mb-[8px]">
                        <FormLabel className="text-purple-400">Time 3</FormLabel>
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
              </div> */}

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



// Create time options in 30 minute increments for 24 hours
const generateTimeOptions = () => {
  const times = [];
  let date = new Date();
  date.setHours(0, 0, 0, 0); // Start at 12:00 AM

  for (let i = 0; i < 48; i++) { // 48 intervals in 24 hours
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert 24-hour format to 12-hour format
    let adjustedHours = hours % 12;
    adjustedHours = adjustedHours ? adjustedHours : 12; // 12-hour format should show 12, not 0

    const formattedTime = `${adjustedHours.toString().padStart(2, '0')}:${minutes} ${period}`;
    const timeValue = `${hours.toString().padStart(2, '0')}:${minutes}:00`
    const timeOption = { time: formattedTime, value: timeValue};
    times.push(timeOption);

    date.setMinutes(date.getMinutes() + 30);
  }
  return times
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