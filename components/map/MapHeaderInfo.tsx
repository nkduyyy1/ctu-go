interface IProps {
  numberOfLocation: number;
  numberOfFilteredLocation: number;
}

const MapHeaderInfo = ({
  numberOfLocation,
  numberOfFilteredLocation,
}: IProps) => {
  return (
    <div className="absolute bottom-2 right-2 z-[1000] bg-white/90 backdrop-blur-sm px-2 py-1 rounded-xl shadow-[8px] max-w-sm">
      <p className="text-xs text-gray-600 font-bold">
        Bản đồ Đại học Cần Thơ (Khu II)
      </p>
    </div>
  );
};

export default MapHeaderInfo;
