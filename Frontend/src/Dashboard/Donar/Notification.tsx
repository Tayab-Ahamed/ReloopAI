import React, { useState } from "react";
import {
  GalleryVerticalEnd,
  Clock4,
  MessageSquareDiff,
  MapPinCheck,
  X,
  Phone,
  Mail
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSnackbar } from "notistack";
import { Badge } from "@/components/ui/badge";

const Notification = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedNgo, setSelectedNgo] = useState<any>(null);

  const notify = [
    {
      heading: "NGO A",
      description: "NGO A accepts their donation",
      date: "29 Feb, 2024",
      time: "4:35 AM",
      location: "Mumbai, India",
      email: "contact@ngo-a.org",
      phone: "+91 98765 43210",
      about: "Providing food security and medical assistance to shelters across Mumbai."
    },
    {
      heading: "NGO C",
      description: "NGO C accepts their donation",
      date: "1 March, 2024",
      time: "10:00 AM",
      location: "Satara, Maharashtra",
      email: "info@ngoc-relief.org",
      phone: "+91 87654 32109",
      about: "Disaster relief and sustainable community support programs in rural areas."
    },
    {
      heading: "NGO B",
      description: "NGO B accepts their donation",
      date: "1 March, 2024",
      time: "10:00 AM",
      location: "Satara, Maharashtra",
      email: "help@ngo-b-childcare.org",
      phone: "+91 76543 21098",
      about: "Committed to childhood education and nutrition programs for underprivileged children."
    },
  ];

  return (
    <div className="p-8 min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="text-3xl font-semibold text-foreground mb-6">
        <h1>Notifications</h1>
      </div>

      {/* Notification List */}
      <div className="w-4/5 space-y-4">
        {notify.map((notification, index) => {
          return (
            <div
              key={index}
              onClick={() => setSelectedNgo(notification)}
              className="p-4 flex gap-4 items-start rounded-lg border border-white/5 bg-card text-foreground shadow-md hover:bg-white/[0.02] transition-all duration-300 cursor-pointer"
            >
              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/20 text-primary">
                <GalleryVerticalEnd className="w-6 h-6 text-primary" />
              </div>

              {/* Notification Content */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">
                  {notification.heading}
                </h2>
                <p className="mt-1 text-sm text-foreground/80">
                  {notification.description}
                </p>

                {/* Date & Time */}
                <p className="mt-2 text-xs text-foreground/60 flex items-center gap-2">
                  <Clock4 className="w-3" />
                  <span className="italic">
                    {notification.date} at {notification.time}
                  </span>
                  <MapPinCheck className="w-4" />
                  <span className="italic">{notification.location}</span>
                </p>
              </div>

              {/* Message Icon */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  enqueueSnackbar(`Opening direct chat with ${notification.heading}...`, { variant: "success" });
                }}
                className="p-1 rounded-md hover:bg-white/5 transition"
              >
                <MessageSquareDiff className="w-6 h-6 text-foreground/60 cursor-pointer hover:text-foreground transition-all duration-300" />
              </button>
            </div>
          );
        })}

        {/* Divider */}
        {notify.length > 1 && <Separator className="mt-2 border-white/5 opacity-30" />}
      </div>

      {/* NGO Detail Modal */}
      {selectedNgo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-card p-6 shadow-2xl text-foreground relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedNgo(null)}
              className="absolute top-4 right-4 rounded-full p-1 hover:bg-white/10 text-foreground/70 hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold mb-2 text-foreground">{selectedNgo.heading}</h2>
            <Badge className="mb-4 bg-primary/20 text-primary border-none">Listing Accepted</Badge>
            
            <p className="text-sm text-foreground/75 mb-6 leading-relaxed">{selectedNgo.about}</p>

            <Separator className="border-white/5 mb-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-foreground/80">
                <Mail className="h-5 w-5 text-primary" />
                <span>{selectedNgo.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground/80">
                <Phone className="h-5 w-5 text-primary" />
                <span>{selectedNgo.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground/80">
                <MapPinCheck className="h-5 w-5 text-primary" />
                <span>{selectedNgo.location}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setSelectedNgo(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-white/5 text-foreground/80 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedNgo(null);
                  enqueueSnackbar(`Initiating chat with ${selectedNgo.heading}...`, { variant: "success" });
                }}
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2 text-sm font-semibold rounded-lg shadow-glow transition"
              >
                Message NGO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
