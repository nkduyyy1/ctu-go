"use client";

import { Button } from "@/components/ui/button";
import { X, Navigation, Share2, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Location } from "@/types";
import { useDrawRoute } from "@/hooks/useDrawRoute";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Props {
  location: Location;
  locations?: Location[];
  onClose: () => void;
}

export default function MapLocationDetailSidebar({ location, locations = [], onClose }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = Array.isArray(location.image_url) && location.image_url.length > 0 ? location.image_url : null;

  const userLocation = useUserLocation();
  const { drawRoute, clearRoute } = useDrawRoute();

  const [from, setFrom] = useState<Location | null>(null);
  const [searchFrom, setSearchFrom] = useState("");
  const [openFrom, setOpenFrom] = useState(false);

  const isNamedLocation = !!location.id && location.id !== "temp";

  const fromOptions = useMemo(() => {
    const list: Location[] = [];

    if (userLocation) {
      list.push({
        id: "current-location",
        name: "Vị trí hiện tại",
        lat: userLocation[0],
        lng: userLocation[1],
      } as Location);
    }

    const validLocations = Array.isArray(locations) ? locations : [];
    return [...list, ...validLocations];
  }, [userLocation, locations]);

  const filteredFrom = useMemo(() => {
    if (!searchFrom.trim()) return fromOptions;
    return fromOptions.filter(loc =>
      loc.name.toLowerCase().includes(searchFrom.toLowerCase())
    );
  }, [searchFrom, fromOptions]);

  const handleDirections = () => {
    if (!from) {
      toast.error("Vui lòng chọn điểm đi");
      return;
    }

    clearRoute();
    drawRoute([from.lat, from.lng], [location.lat, location.lng]);

    toast.success("Đường đi đã được vẽ!", {
      description: `${from.name} → ${location.name || "Điểm này"}`,
    });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/?lat=${location.lat}&lng=${location.lng}&name=${encodeURIComponent(location.name || "Điểm trên bản đồ")}`;
    navigator.clipboard.writeText(url);
    toast.success("Đã sao chép link!");
  };

  const nextImage = () => images && setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => images && setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  // Nếu là điểm tạm (không có id hoặc id === "temp") → chỉ hiện thông tin cơ bản + nút chia sẻ
  if (!isNamedLocation) {
    return (
      <div className="fixed z-[100001] inset-y-0 left-0 w-96 bg-white shadow-2xl z-[1000] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Điểm trên bản đồ</h2>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-500">Tọa độ</p>
            <p className="font-mono text-sm bg-gray-100 px-4 py-3 rounded-lg mt-2">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-lg font-semibold mb-4">Chia sẻ vị trí này</p>
            <Button onClick={handleShare} className="w-full" variant="outline">
              <Share2 className="w-5 h-5 mr-3" />
              Sao chép link vị trí
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Location có tên (đã định danh) → hiện đầy đủ ảnh + mô tả + chỉ đường
  return (
    <div className="fixed z-[100001] inset-y-0 left-0 w-96 bg-white shadow-2xl z-[1000] flex flex-col">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-bold line-clamp-2 pr-4">{location.name}</h2>
        <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative h-64 bg-gray-100 overflow-hidden">
        {images ? (
          <>
            <Image src={images[currentImageIndex]} alt={location.name} fill className="object-cover" priority />
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
            <MapPin className="w-32 h-32 text-white opacity-90" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-7">
        <div>
          <p className="text-sm text-gray-500">Tọa độ</p>
          <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded mt-1">
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>

        {location.description && (
          <div>
            <p className="text-sm text-gray-500">Mô tả</p>
            <p className="mt-2 text-gray-700">{location.description}</p>
          </div>
        )}

        {location.category && (
          <div>
            <p className="text-sm text-gray-500">Loại địa điểm</p>
            <span className="inline-block mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {location.category.name}
            </span>
          </div>
        )}

        <div className="pt-6 border-t">
          <p className="font-semibold text-lg mb-4">Chỉ đường đến đây</p>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-500 z-10" />
            <Command className="border rounded-lg">
              <CommandInput
                placeholder="Chọn điểm đi..."
                value={from ? from.name : searchFrom}
                onValueChange={(v) => {
                  setSearchFrom(v);
                  setOpenFrom(true);
                }}
                onFocus={() => setOpenFrom(true)}
                className="pl-10 h-12"
              />
              {openFrom && (
                <CommandList className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                  <CommandGroup>
                    {filteredFrom.length === 0 ? (
                      <CommandEmpty>Không tìm thấy</CommandEmpty>
                    ) : (
                      filteredFrom.map((loc) => (
                        <CommandItem
                          key={loc.id || `loc-${loc.lat}-${loc.lng}`}
                          onSelect={() => {
                            setFrom(loc);
                            setOpenFrom(false);
                            setSearchFrom("");
                          }}
                        >
                          <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                          <span className={loc.id === "current-location" ? "font-medium text-green-600" : ""}>
                            {loc.name}
                          </span>
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              )}
            </Command>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Điểm đến</p>
              <p className="font-medium">{location.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t space-y-3">
        <Button
          onClick={handleDirections}
          disabled={!from}
          className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <Navigation className="w-5 h-5 mr-3" />
          Bắt đầu chỉ đường
        </Button>

        <Button onClick={handleShare} variant="outline" className="w-full">
          <Share2 className="w-5 h-5 mr-3" />
          Chia sẻ vị trí
        </Button>
      </div>
    </div>
  );
}