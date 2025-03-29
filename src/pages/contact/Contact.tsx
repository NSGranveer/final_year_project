
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Github, ExternalLink, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Contact Us</CardTitle>
          <CardDescription>
            Get in touch with the Flame Guard development team
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Email</h3>
                <p className="text-sm text-muted-foreground mb-1">Send us an email anytime:</p>
                <a href="mailto:contact@flameguard.ai" className="text-primary hover:underline">
                  contact@flameguard.ai
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Phone</h3>
                <p className="text-sm text-muted-foreground mb-1">Mon-Fri from 9am to 5pm:</p>
                <a href="tel:+1234567890" className="text-primary hover:underline">
                  +1 (234) 567-890
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Github className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">GitHub</h3>
                <p className="text-sm text-muted-foreground mb-1">Check out our open-source code:</p>
                <a href="https://github.com/flameguard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  github.com/flameguard
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Location</h3>
                <p className="text-sm text-muted-foreground mb-1">Our headquarters:</p>
                <p>Longitude: 73.760120</p>
                <p>Latitude: 18.645974</p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg overflow-hidden h-64 md:h-auto">
            {/* This would be a real map in a production environment */}
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/50 p-4">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">Map Location</p>
                <p className="text-sm text-muted-foreground">Interactive map would be displayed here</p>
                <p className="text-xs mt-2">Longitude: 73.760120, Latitude: 18.645974</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>About the Project</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm">
          <p>
            Flame Guard is an advanced wildfire detection system using CNN-based technology to identify fires and smoke in real-time. 
            Our mission is to provide early detection capabilities to help prevent the spread of wildfires and minimize 
            their destructive impact on communities and ecosystems.
          </p>
          <p>
            This project combines cutting-edge computer vision with practical monitoring tools, enabling organizations to:
          </p>
          <ul>
            <li>Monitor locations in real-time for fire and smoke</li>
            <li>Process video footage for post-event analysis</li>
            <li>Receive automated alerts when potential fires are detected</li>
            <li>Maintain comprehensive logs of detection events</li>
          </ul>
          <p>
            For more information on implementation details, custom deployments, or partnership opportunities, 
            please contact our team using any of the methods above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
