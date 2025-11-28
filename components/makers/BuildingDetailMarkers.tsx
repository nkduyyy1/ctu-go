"use client";

import { Marker, Popup } from "react-leaflet";
import { useRef } from "react";
import type { LatLngExpression } from "leaflet";
import type { Marker as LeafletMarker } from "leaflet";
import { MarkerFactory } from "./MarkerFactory";
import { LocationCategory, type Location } from "../../types";

const categoryLabels: Record<string, string> = {
    classroom: "Giảng đường",
    library: "Thư viện",
    cafeteria: "Căn tin",
    dormitory: "Ký túc xá",
    office: "Văn phòng",
    laboratory: "Phòng thí nghiệm",
    sports: "Thể thao",
    parking: "Bãi đỗ xe",
    other: "Khác",
};

const getBuildingDetails = (locationId: string) => {
    const detailsMap: Record<string, Location["details"]> = {
        "loc004": {
            address: "Khu vực trung tâm, Đại học Cần Thơ",
            phone: "0292.3832.xxx",
            email: "thuvien@ctu.edu.vn",
            hours: "7:00 - 21:00 (Thứ 2 - Chủ nhật)",
            floors: 5,
            capacity: 2000,
            facilities: [
                "Phòng đọc sách",
                "Khu vực học nhóm",
                "Phòng máy tính",
                "Kho sách điện tử",
                "Phòng hội thảo",
            ],
            history: "Thư viện được xây dựng năm 2005, là một trong những thư viện lớn nhất khu vực Đồng bằng sông Cửu Long với hơn 500,000 đầu sách và tài liệu.",
        },
        "loc005": {
            address: "Khu vực trung tâm, Đại học Cần Thơ",
            phone: "0292.3832.xxx",
            email: "info@ctu.edu.vn",
            hours: "7:30 - 17:00 (Thứ 2 - Thứ 6)",
            floors: 4,
            capacity: 500,
            facilities: [
                "Phòng họp",
                "Văn phòng Ban Giám hiệu",
                "Phòng tiếp khách",
                "Hội trường lớn",
                "Phòng truyền thống",
            ],
            history: "Tòa nhà điều hành là trung tâm quản lý và điều hành của Đại học Cần Thơ, được xây dựng từ những ngày đầu thành lập trường.",
        },
    };
    return detailsMap[locationId];
};


function AutoOpenMarker({
    position,
    icon,
    children
}: {
    position: LatLngExpression;
    icon: L.Icon | L.DivIcon;
    children: React.ReactNode;
}) {
    const markerRef = useRef<LeafletMarker | null>(null);

    return (
        <Marker
            position={position}
            icon={icon}
            ref={(ref) => {
                markerRef.current = ref;
            }}

        >
            {children}
        </Marker>
    );
}

export default function BuildingDetailMarkers({ locations }: { locations: Location[] }) {
    const detailLocations = locations

    return (
        <>
            {detailLocations.map((loc) => {
                const details = getBuildingDetails(loc?.id || "");
                const icon = MarkerFactory.create({ name: loc.name, category: loc.category?.slug as LocationCategory || "other" });
                const categoryLabel = loc.category ? categoryLabels[loc.category.slug] || "Khác" : "Khác";

                return (
                    <AutoOpenMarker
                        key={loc.id}
                        position={[loc.lat, loc.lng] as LatLngExpression}
                        icon={icon}
                    >
                        <Popup maxWidth={350} className="building-detail-popup">
                            <div style={{ minWidth: 300, padding: "4px" }}>
                                <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: "bold", color: "#1f2937" }}>
                                    {loc.name}
                                </h3>
                                {loc.category && (
                                    <div style={{
                                        display: "inline-block",
                                        padding: "4px 10px",
                                        background: "#f3f4f6",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        color: "#6b7280",
                                        marginBottom: "12px",
                                        fontWeight: "500",
                                    }}>
                                        {categoryLabel}
                                    </div>
                                )}

                                {/* {details && (
                                    <>
                                        <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" }}>
                                            <p style={{ margin: "4px 0", fontSize: 14, color: "#6b7280" }}>
                                                {loc.description}
                                            </p>
                                        </div>

                                        <div style={{ marginBottom: "12px" }}>
                                            <h4 style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: "600", color: "#374151" }}>
                                                📍 Thông tin liên hệ
                                            </h4>
                                            {details.address && (
                                                <p style={{ margin: "4px 0", fontSize: 13, color: "#4b5563" }}>
                                                    <strong>Địa chỉ:</strong> {details.address}
                                                </p>
                                            )}
                                            {details.phone && (
                                                <p style={{ margin: "4px 0", fontSize: 13, color: "#4b5563" }}>
                                                    <strong>Điện thoại:</strong> {details.phone}
                                                </p>
                                            )}
                                            {details.email && (
                                                <p style={{ margin: "4px 0", fontSize: 13, color: "#4b5563" }}>
                                                    <strong>Email:</strong> {details.email}
                                                </p>
                                            )}
                                            {details.hours && (
                                                <p style={{ margin: "4px 0", fontSize: 13, color: "#4b5563" }}>
                                                    <strong>Giờ mở cửa:</strong> {details.hours}
                                                </p>
                                            )}
                                        </div>

                                        <div style={{ marginBottom: "12px" }}>
                                            <h4 style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: "600", color: "#374151" }}>
                                                🏢 Thông tin tòa nhà
                                            </h4>
                                            {details.floors && (
                                                <p style={{ margin: "4px 0", fontSize: 13, color: "#4b5563" }}>
                                                    <strong>Số tầng:</strong> {details.floors} tầng
                                                </p>
                                            )}
                                            {details.capacity && (
                                                <p style={{ margin: "4px 0", fontSize: 13, color: "#4b5563" }}>
                                                    <strong>Sức chứa:</strong> {details.capacity.toLocaleString()} người
                                                </p>
                                            )}
                                        </div>

                                        {details.facilities && details.facilities.length > 0 && (
                                            <div style={{ marginBottom: "12px" }}>
                                                <h4 style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: "600", color: "#374151" }}>
                                                    🎯 Tiện ích
                                                </h4>
                                                <ul style={{ margin: "4px 0", paddingLeft: "20px", fontSize: 13, color: "#4b5563" }}>
                                                    {details.facilities.map((facility, idx) => (
                                                        <li key={idx} style={{ marginBottom: "4px" }}>{facility}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {details.history && (
                                            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e5e7eb" }}>
                                                <h4 style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: "600", color: "#374151" }}>
                                                    📖 Lịch sử
                                                </h4>
                                                <p style={{ margin: "4px 0", fontSize: 13, color: "#4b5563", lineHeight: "1.5" }}>
                                                    {details.history}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )} */}
                            </div>
                        </Popup>
                    </AutoOpenMarker>
                );
            })}
        </>
    );
}

