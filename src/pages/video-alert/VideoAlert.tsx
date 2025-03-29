
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, UploadCloud, Video, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { uploadVideo, getVodVideoFeed, downloadProcessedVideo, downloadDetectionLog } from "@/services/api";

export default function VideoAlert() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime'];
      
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        toast.success("File selected", {
          description: `${file.name} (${formatBytes(file.size)})`,
        });
      } else {
        toast.error("Invalid file type", {
          description: "Please select an MP4, AVI, or MOV video file",
        });
      }
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };

  const uploadAndProcess = async () => {
    if (!selectedFile) {
      toast.error("No file selected", {
        description: "Please select a video file to process",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      await uploadVideo(selectedFile);
      
      toast.success("Upload successful", {
        description: "Video processing started",
      });
      setIsUploading(false);
      setIsProcessing(true);
      
      // Wait for processing to complete (simulated in this frontend demo)
      setTimeout(() => {
        setIsProcessing(false);
        setIsProcessed(true);
        toast.success("Processing complete", {
          description: "Video analysis finished successfully",
        });
      }, 3000);
    } catch (error) {
      console.error('Error uploading/processing video:', error);
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setIsProcessed(false);
  };

  return (
    <div className="p-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Video Fire Detection</CardTitle>
            <CardDescription>Upload and process videos to detect fire and smoke</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              {isProcessed ? (
                <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden mb-4">
                  <img 
                    src={getVodVideoFeed()} 
                    alt="Processed video feed" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center mb-4 aspect-video flex flex-col items-center justify-center">
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">
                      {selectedFile ? selectedFile.name : "Upload Video"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedFile 
                        ? `Size: ${formatBytes(selectedFile.size)}` 
                        : "Drag and drop or click to upload"}
                    </p>
                    <div className="flex gap-4">
                      <Label 
                        htmlFor="video-upload" 
                        className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Select Video
                      </Label>
                      <input 
                        id="video-upload" 
                        type="file" 
                        accept=".mp4,.avi,.mov,video/mp4,video/avi,video/quicktime" 
                        className="hidden" 
                        onChange={handleFileSelect}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 w-full justify-center">
                {!isProcessed ? (
                  <Button 
                    onClick={uploadAndProcess} 
                    disabled={!selectedFile || isUploading || isProcessing}
                    className="gap-2"
                  >
                    {(isUploading || isProcessing) ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isUploading ? "Uploading..." : "Processing..."}
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4" />
                        Process Video
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={resetForm} className="gap-2">
                      <UploadCloud className="h-4 w-4" />
                      Upload Another
                    </Button>
                    <Button 
                      onClick={() => window.open(downloadProcessedVideo(), '_blank')}
                      className="gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Download Processed Video
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(downloadDetectionLog(), '_blank')}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Download Detection Log
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className={`font-medium ${isProcessing ? 'text-amber-500' : isProcessed ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {isProcessing ? 'Processing' : isProcessed ? 'Completed' : 'Ready'}
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
                <span>Classes:</span>
                <span className="font-medium">Fire, Smoke, Other</span>
              </div>

              <div className="bg-muted/50 p-4 rounded-md">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Processing Time</p>
                    <p className="text-muted-foreground">Processing time depends on video length and complexity. Large videos may take several minutes.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
