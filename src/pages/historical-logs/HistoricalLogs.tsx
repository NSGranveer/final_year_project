
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ExternalLink, Clock, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFireLogs, getVideoLogs, getImageUrl, downloadPastVideo, downloadPastLog } from "@/services/api";

interface FireLog {
  id: number;
  timestamp: string;
  confidence: number;
  image_path: string;
}

interface VideoLog {
  id: number;
  timestamp: string;
  video_path: string;
  csv_path: string;
}

export default function HistoricalLogs() {
  const [fireLogs, setFireLogs] = useState<FireLog[]>([]);
  const [videoLogs, setVideoLogs] = useState<VideoLog[]>([]);
  const [isLoading, setIsLoading] = useState({
    fire: false,
    video: false,
  });
  const [error, setError] = useState({
    fire: null as string | null,
    video: null as string | null,
  });

  const fetchFireLogs = async () => {
    setIsLoading(prev => ({ ...prev, fire: true }));
    setError(prev => ({ ...prev, fire: null }));
    
    try {
      const data = await getFireLogs();
      setFireLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching fire logs:', err);
      setError(prev => ({ ...prev, fire: 'Failed to fetch fire logs. Is the backend server running?' }));
    } finally {
      setIsLoading(prev => ({ ...prev, fire: false }));
    }
  };

  const fetchVideoLogs = async () => {
    setIsLoading(prev => ({ ...prev, video: true }));
    setError(prev => ({ ...prev, video: null }));
    
    try {
      const data = await getVideoLogs();
      setVideoLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching video logs:', err);
      setError(prev => ({ ...prev, video: 'Failed to fetch video logs. Is the backend server running?' }));
    } finally {
      setIsLoading(prev => ({ ...prev, video: false }));
    }
  };

  useEffect(() => {
    fetchFireLogs();
    fetchVideoLogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="fire" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="fire">Realtime Fire Logs</TabsTrigger>
          <TabsTrigger value="video">Video Processing Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fire" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Realtime Fire Detection Logs</CardTitle>
              <CardDescription>History of fire detections from realtime monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              {error.fire ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error.fire}</AlertDescription>
                </Alert>
              ) : isLoading.fire ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>Loading logs...</span>
                  </div>
                </div>
              ) : fireLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No fire detection logs found</p>
                  <p className="text-sm">Start realtime monitoring to detect fires</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fireLogs.map((log) => (
                    <div key={log.id} className="border rounded-md p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-fire-600"></span>
                          Fire Detected
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {log.id}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatDate(log.timestamp)}
                        </div>
                        <div className="text-sm">
                          Confidence: <span className="font-medium">{(log.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      {log.image_path && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Image className="h-4 w-4" />
                            <span className="text-sm font-medium">Screenshot</span>
                          </div>
                          <div className="rounded-md overflow-hidden border">
                            <img 
                              src={getImageUrl(log.image_path)} 
                              alt={`Fire detection ${log.id}`}
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <Button onClick={fetchFireLogs} disabled={isLoading.fire} variant="outline" size="sm">
                  {isLoading.fire ? (
                    <>
                      <div className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Refreshing...
                    </>
                  ) : (
                    'Refresh Logs'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="video" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Processing Logs</CardTitle>
              <CardDescription>History of processed videos and detection results</CardDescription>
            </CardHeader>
            <CardContent>
              {error.video ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error.video}</AlertDescription>
                </Alert>
              ) : isLoading.video ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>Loading logs...</span>
                  </div>
                </div>
              ) : videoLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No video processing logs found</p>
                  <p className="text-sm">Upload and process videos to see logs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {videoLogs.map((log) => (
                    <div key={log.id} className="border rounded-md p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                          Video Processed
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {log.id}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <Clock className="inline-block h-4 w-4 mr-1 align-text-bottom" />
                        {formatDate(log.timestamp)}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start gap-2"
                          onClick={() => window.open(downloadPastVideo(log.video_path), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="truncate">Download Video</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start gap-2"
                          onClick={() => window.open(downloadPastLog(log.csv_path), '_blank')}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="truncate">Download CSV Log</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <Button onClick={fetchVideoLogs} disabled={isLoading.video} variant="outline" size="sm">
                  {isLoading.video ? (
                    <>
                      <div className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Refreshing...
                    </>
                  ) : (
                    'Refresh Logs'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
