
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Flame, LineChart, Video, Bell, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-center">
        <div className="relative w-full max-w-6xl overflow-hidden rounded-lg bg-gradient-to-r from-fire-600 to-orange-500 p-8 text-white shadow-lg">
          <div className="absolute -right-10 -top-10 opacity-20">
            <Flame size={230} />
          </div>
          <div className="relative z-10 max-w-lg">
            <h1 className="mb-2 text-4xl font-bold">Flame Guard</h1>
            <h2 className="mb-4 text-2xl">CNN-Based Wildfire Detection</h2>
            <p className="mb-6 text-fire-50">
              Advanced AI-powered system for early detection and monitoring of wildfires using
              convolutional neural networks and real-time video analysis.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/realtime-alert">
                <Button variant="secondary" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Realtime Monitoring
                </Button>
              </Link>
              <Link to="/video-alert">
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-2">
                  <Video className="h-4 w-4" />
                  Video Analysis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Realtime Detection</CardTitle>
            <AlertTriangle className="w-4 h-4 text-fire-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Webcam Monitoring</div>
            <p className="text-xs text-muted-foreground">
              Live detection of fire and smoke using the YOLOv8 model
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/realtime-alert" className="w-full">
              <Button variant="outline" className="w-full justify-between">
                Go to Realtime Alert
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Video Processing</CardTitle>
            <Video className="w-4 h-4 text-fire-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Video Analysis</div>
            <p className="text-xs text-muted-foreground">
              Upload and analyze videos for fire and smoke detection
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/video-alert" className="w-full">
              <Button variant="outline" className="w-full justify-between">
                Go to Video Alert
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Historical Data</CardTitle>
            <LineChart className="w-4 h-4 text-fire-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Analytics</div>
            <p className="text-xs text-muted-foreground">
              View historical detection logs and download reports
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/historical-logs" className="w-full">
              <Button variant="outline" className="w-full justify-between">
                View Historical Logs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-card rounded-lg p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">Project Information</h2>
        <Separator className="my-4" />
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How does it work?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">
                Flame Guard uses YOLOv8, a state-of-the-art Convolutional Neural Network (CNN) model for object detection, to identify fire and smoke in images and videos with high accuracy. The system processes frames in real-time, drawing bounding boxes around detected fires and calculating confidence scores.
              </p>
              <p>
                When high-confidence fire detections occur, the system automatically captures screenshots, stores them in a database, and can send email alerts to designated recipients with location information.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Key Features</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Real-time monitoring through webcam feeds</li>
                <li>Video processing for uploaded content</li>
                <li>Automatic email alerts with location data</li>
                <li>Screenshot capture of fire incidents</li>
                <li>Historical logging in MySQL database</li>
                <li>Detection data visualization and export</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Technical Implementation</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">
                The frontend is built with React, TypeScript, and Tailwind CSS, providing a responsive and intuitive user interface. The backend is powered by Flask, handling video processing, database operations, and email alerts.
              </p>
              <p className="mb-4">
                Detection data is stored in MySQL databases (fire_detection_db for real-time alerts and fire_detection_vod for video processing), enabling comprehensive historical analysis and reporting.
              </p>
              <p>
                The system uses CUDA acceleration when available, optimizing performance for real-time video processing on compatible hardware.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
