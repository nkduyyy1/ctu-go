"use client";

import { Button } from "@/components/ui/button";
import { X, Navigation, Share2 } from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";

interface Props {
    name: string;
    image?: string;
    latlng: [number, number];
    onClose: () => void;
    onDirections: () => void;
}

export default function MapFloatingPlaceCard({
    name,
    image,
    latlng,
    onClose,
    onDirections,
}: Props) {

    const handleShare = () => {
        const url = `https://maps.google.com/?q=${latlng[0]},${latlng[1]}`;
        navigator.clipboard.writeText(url);
        alert("Đã sao chép link vị trí!");
    };


    return (
        createPortal(<div className="fixed inset-x-4 bottom-6 z-[10001] pointer-events-auto">
            <div className="w-fit mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in slide-in-from-bottom duration-300">
                <div className="flex">
                    <div className="w-32 relative shrink-0 bg-gray-100">
                        {image ? (
                            <Image
                                src={image}
                                alt={name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-gray-400 text-4xl">CGo</div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 px-4 py-3 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="font-medium text-lg">{name}</h3>
                        <p className="text-sm text-gray-500">Khu II ĐH Cần Thơ</p>
                        <p className="mt-3 font-mono text-xs bg-gray-100 px-3 py-2 rounded-lg">
                            {latlng[0].toFixed(6)}, {latlng[1].toFixed(6)}
                        </p>

                        <div className="flex gap-2 mt-3">
                            <Button onClick={onDirections} className="flex-1 h-7 bg-blue-600 hover:bg-blue-700">
                                <Navigation className="w-4 h-4 mr-2" />
                                <span className="text-xs">Chỉ đường</span>
                            </Button>
                            <Button onClick={handleShare} variant="outline" className="flex-1 h-7 hover:none">
                                <Share2 className="w-4 h-4 mr-2" />
                                <span className="text-xs">Chia sẻ</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>, document.body)
    );
}