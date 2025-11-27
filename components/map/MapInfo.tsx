interface IProps {
  numberOfLocation: number;
  numberOfFilteredLocation: number;
}

const MapInfo = ({ numberOfLocation, numberOfFilteredLocation }: IProps) => {
  return (
    <div className="absolute bottom-6 right-2 z-[1000] bg-white backdrop-blur-sm px-2 py-1 rounded-xl shadow-[8px] max-w-sm">
      <div className="flex items-center gap-2">
        <img src="/assets/cg-logo.png" width={24} height={24} alt="Logo" />
        <p className="text-xs text-gray-600 font-bold">
          Bản đồ Đại học Cần Thơ (Khu II)
        </p>
      </div>
    </div>
  );
};

export default MapInfo;
