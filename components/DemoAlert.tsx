import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function DemoAlert() {
  return (
    <Alert variant="destructive" className="w-5/6 mt-3">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Unfortunately, due to resource constraints we are currently <span className="font-bold">whitelist-only</span>. 
        For demo purposes, you may still make a sample Rezzy, but we are currently unable to monitor it and notify you when an opening appears. 😞

        <br/>
        <br/>

        To apply to be added to the whitelist, please contact the dev at <a className="text-red-600" href="mailto:rezzy.notifications@gmail.com"> rezzy.notifications@gmail.com </a>
      </AlertDescription>
    </Alert>
  )
}