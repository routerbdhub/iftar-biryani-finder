import { useState, useEffect, useCallback } from "react";
import { supabase, type IftarSpot } from "@/lib/supabase";
import IftarMap from "@/components/IftarMap";
import SearchBar from "@/components/SearchBar";
import AddSpotDialog from "@/components/AddSpotDialog";
import BottomSheet from "@/components/BottomSheet";
import { toast } from "sonner";

const Index = () => {
  const [spots, setSpots] = useState<IftarSpot[]>([]);
  const [search, setSearch] = useState("");
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const [pickingLocation, setPickingLocation] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchSpots = async () => {
    const { data, error } = await supabase
      .from("iftar_spots")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setSpots(data as IftarSpot[]);
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const filtered = spots.filter(
    (s) =>
      s.mosque_name.toLowerCase().includes(search.toLowerCase()) ||
      s.area.toLowerCase().includes(search.toLowerCase())
  );

  const handleSpotClick = (spot: IftarSpot) => {
    setFlyTo({ lat: spot.lat, lng: spot.lng });
  };

  const handleSpotAdded = (spot: IftarSpot) => {
    setSpots((prev) => [spot, ...prev]);
    setFlyTo({ lat: spot.lat, lng: spot.lng });
  };

  const handleMapClick = useCallback(
    (latlng: { lat: number; lng: number }) => {
      if (pickingLocation) {
        setPendingLocation(latlng);
        setPickingLocation(false);
        toast.success("লোকেশন সেট হয়েছে! এখন ফর্ম পূরণ করুন।");
      }
    },
    [pickingLocation]
  );

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <IftarMap
        spots={filtered}
        flyTo={flyTo}
        onMapClick={pickingLocation ? handleMapClick : null}
      />
      <SearchBar value={search} onChange={setSearch} />

      {pickingLocation && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1001] bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
          📍 ম্যাপে ক্লিক করুন
        </div>
      )}

      <AddSpotDialog
        onSpotAdded={handleSpotAdded}
        pendingLocation={pendingLocation}
        onRequestMapClick={() => setPickingLocation(true)}
        onClearPending={() => setPendingLocation(null)}
      />
      <BottomSheet spots={filtered} onSpotClick={handleSpotClick} />
    </div>
  );
};

export default Index;
