"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, User, X } from "lucide-react";
import { toast } from "sonner";
import { useDrawRoute } from "@/hooks/useDrawRoute";

interface Props {
  location: { name: string; lat: number; lng: number; description?: string };
  userLocation: [number, number] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDestination: (start: [number, number]) => void;
}

export default function LocationRoutingPopup({
  location,
  userLocation,
  open,
  onOpenChange,
  onSelectDestination,
}: Props) {
  const { drawRoute } = useDrawRoute();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {location.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {location.description && <p className="text-sm text-gray-600">{location.description}</p>}
          <p className="text-xs font-mono text-gray-500">
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>

          <div className="pt-3 border-t space-y-2">
            {userLocation && (
              <Button
                onClick={() => {
                  drawRoute(userLocation, [location.lat, location.lng]);
                  onOpenChange(false);
                }}
                className="w-full justify-start"
                variant="outline"
              >
                <User className="w-4 h-4 mr-2" />
                Từ vị trí hiện tại của tôi
              </Button>
            )}

            <Button
              onClick={() => {
                onSelectDestination([location.lat, location.lng]);
                toast.info("Click trên bản đồ để chọn điểm đến");
                onOpenChange(false);
              }}
              className="w-full justify-start"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Từ đây đến điểm khác
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}