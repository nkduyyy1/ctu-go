"use client";

import { Button } from "@/components/ui/button";
import { X, ArrowUpDown, MapPin } from "lucide-react";
import { useDrawRoute } from "@/hooks/useDrawRoute";
import { useEffect, useState, useMemo } from "react";
import { Location } from "@/types";
import { createPortal } from "react-dom";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

interface Props {
    selectedPoint: Location | null;
    locations: Location[];
    onClose: () => void;
}

export default function DirectionsPanel({ selectedPoint, locations, onClose }: Props) {
    const { drawRoute, clearRoute } = useDrawRoute();

    const [from, setFrom] = useState<Location | null>(null);
    const [to, setTo] = useState<Location | null>(null);
    const [searchFrom, setSearchFrom] = useState("");
    const [searchTo, setSearchTo] = useState("");
    const [openFrom, setOpenFrom] = useState(false);
    const [openTo, setOpenTo] = useState(false);

    useEffect(() => {
        if (selectedPoint) {
            setTo({
                name: selectedPoint.name || `${selectedPoint.lat}, ${selectedPoint.lng}`,
                lat: selectedPoint.lat,
                lng: selectedPoint.lng,
            });
        }
    }, [selectedPoint]);

    const filteredFrom = useMemo(() => {
        if (!searchFrom.trim()) return locations;
        return locations.filter(loc =>
            loc.name.toLowerCase().includes(searchFrom.toLowerCase()) ||
            loc.description?.toLowerCase().includes(searchFrom.toLowerCase())
        );
    }, [searchFrom, locations]);

    const filteredTo = useMemo(() => {
        if (!searchTo.trim()) return locations;
        return locations.filter(loc =>
            loc.name.toLowerCase().includes(searchTo.toLowerCase()) ||
            loc.description?.toLowerCase().includes(searchTo.toLowerCase())
        );
    }, [searchTo, locations]);

    const swapPoints = () => {
        const temp = from;
        setFrom(to);
        setTo(temp);
    };

    const handleDrawRoute = () => {
        if (!from || !to) {
            alert("Vui lòng chọn điểm đi và điểm đến");
            return;
        }
        clearRoute();
        drawRoute([from.lat, from.lng], [to.lat, to.lng]);
        onClose();
    };

    const displayText = (loc: Location | null): string => {
        if (!loc) return "";
        if (loc.id === "current-location") return "Vị trí hiện tại";
        if (loc.name && loc.name.trim() !== "") return loc.name;
        return `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`;
    };


    return createPortal(
        <div className="fixed inset-0 z-[100000] pointer-events-none">
            <div
                className="pointer-events-auto fixed top-[104px] left-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 animate-in slide-in-from-top duration-300"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">Chỉ đường</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    <div>
                        <div className="relative">
                            <MapPin className="absolute left-3 bg-white top-1.5 w-6 h-6 text-green-500 z-10" />
                            <Command>
                                <CommandInput
                                    placeholder="Nhập điểm xuất phát..."
                                    value={from ? displayText(from) : searchFrom}
                                    onValueChange={(value) => {
                                        if (!from || displayText(from) !== value) {
                                            setSearchFrom(value);
                                            setOpenFrom(true);
                                        }
                                    }}
                                    onFocus={() => setOpenFrom(true)}
                                    className="pl-4 h-12 text-base font-medium pb-2"
                                />
                                {openFrom && (
                                    <CommandList className="absolute top-full left-0 right-0 mt-1 bg-white shadow-xl z-50 max-h-64 overflow-auto">
                                        <CommandGroup heading="Gợi ý">
                                            {filteredFrom.length === 0 ? (
                                                <CommandEmpty>Không tìm thấy địa điểm</CommandEmpty>
                                            ) : (
                                                filteredFrom.map((loc) => (
                                                    <CommandItem
                                                        key={loc.id}
                                                        onSelect={() => {
                                                            setFrom(loc);
                                                            setOpenFrom(false);
                                                            setSearchFrom("");
                                                        }}
                                                    >
                                                        <MapPin className="mr-2 h-4 w-4 text-green-500" />
                                                        <div>
                                                            <div className="font-medium">{loc.name}</div>
                                                            {loc.description && (
                                                                <div className="text-xs text-gray-500">{loc.description}</div>
                                                            )}
                                                        </div>
                                                    </CommandItem>
                                                ))
                                            )}
                                        </CommandGroup>
                                    </CommandList>
                                )}
                            </Command>
                        </div>
                    </div>

                    <div className="flex justify-center -my-1 cursor-pointer">
                        <button
                            onClick={swapPoints}
                            className="p-2 hover:bg-gray-100 rounded-full transition-all hover:scale-110 bg-gray-100"
                        >
                            <ArrowUpDown className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    <div>
                        <div className="relative">
                            <MapPin className="absolute left-3 bg-white top-1.5 w-6 h-6 text-red-500 z-10" />
                            <Command>
                                <CommandInput
                                    placeholder="Nhập điểm đến..."
                                    value={to ? displayText(to) : searchTo}
                                    onValueChange={(value) => {
                                        if (!to || displayText(to) !== value) {
                                            setSearchTo(value);
                                            setOpenTo(true);
                                        }
                                    }}
                                    onFocus={() => setOpenTo(true)}
                                    className="pl-4 h-12 text-base font-medium pb-2"
                                />
                                {openTo && (
                                    <CommandList className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-50 max-h-64 overflow-auto">
                                        <CommandGroup heading="Gợi ý">
                                            {filteredTo.length === 0 ? (
                                                <CommandEmpty>Không tìm thấy địa điểm</CommandEmpty>
                                            ) : (
                                                filteredTo.map((loc) => (
                                                    <CommandItem
                                                        key={loc.id}
                                                        onSelect={() => {
                                                            setTo(loc);
                                                            setOpenTo(false);
                                                            setSearchTo("");
                                                        }}
                                                    >
                                                        <MapPin className="mr-2 h-4 w-4 text-red-500" />
                                                        <div>
                                                            <div className="font-medium">{loc.name}</div>
                                                            {loc.description && (
                                                                <div className="text-xs text-gray-500">{loc.description}</div>
                                                            )}
                                                        </div>
                                                    </CommandItem>
                                                ))
                                            )}
                                        </CommandGroup>
                                    </CommandList>
                                )}
                            </Command>
                        </div>
                    </div>

                    <Button
                        onClick={handleDrawRoute}
                        disabled={!from || !to}
                        size="lg"
                        className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {from && to ? "Xem đường đi" : "Chọn điểm đi và đến"}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}