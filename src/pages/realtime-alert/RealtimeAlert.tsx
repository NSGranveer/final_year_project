
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { startWebcam, stopWebcam, getRealtimeVideoFeed } from "@/services/api";

export default function RealtimeAlert() {
  const [isWebcamRunning, setIsWebcamRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartWebcam = async () => {
    setIsLoading(true);
    try {
      const response = await startWebcam();
      if (response && response.status !== 'Webcam already running') {
        setIsWebcamRunning(true);
        toast.success("Webcam started", {
          description: "Realtime fire detection is now active",
        });
      }
    } catch (error) {
      console.error('Error starting webcam:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopWebcam = async () => {
    setIsLoading(true);
    try {
      const response = await stopWebcam();
      if (response) {
        setIsWebcamRunning(false);
        toast.success("Webcam stopped", {
          description: "Realtime fire detection has been paused",
        });
      }
    } catch (error) {
      console.error('Error stopping webcam:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Realtime Fire Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              {isWebcamRunning ? (
                <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden mb-4">
                  <img 
                    src={getRealtimeVideoFeed()} 
                    alt="Realtime video feed" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                  <p className="text-muted-foreground">Camera feed will appear here</p>
                </div>
              )}
              
              <div className="flex gap-4">
                {!isWebcamRunning ? (
                  <Button onClick={handleStartWebcam} disabled={isLoading} className="gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Start Monitoring
                  </Button>
                ) : (
                  <Button onClick={handleStopWebcam} disabled={isLoading} variant="destructive" className="gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
                    Stop Monitoring
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className={`font-medium ${isWebcamRunning ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {isWebcamRunning ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Detection Model:</span>
                <span className="font-medium">YOLOv8</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Confidence Threshold:</span>
                <span className="font-medium">0.25</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Alert Threshold:</span>
                <span className="font-medium text-fire-600">0.8</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Email Cooldown:</span>
                <span className="font-medium">5 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Screenshot Interval:</span>
                <span className="font-medium">30 seconds</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
