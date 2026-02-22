import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { IftarSpot } from "@/lib/supabase";
import SpotCard from "./SpotCard";

interface BottomSheetProps {
  spots: IftarSpot[];
  onSpotClick: (spot: IftarSpot) => void;
}

const BottomSheet = ({ spots, onSpotClick }: BottomSheetProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[1000] bg-background/95 backdrop-blur-xl border-t border-border rounded-t-3xl shadow-2xl transition-all duration-300 ${
        expanded ? "h-[60vh]" : "h-[140px]"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-col items-center pt-2 pb-1"
      >
        <div className="w-10 h-1.5 bg-muted-foreground/30 rounded-full mb-1" />
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          <span className="font-medium">
            {spots.length}টি ইফতার স্পট পাওয়া গেছে
          </span>
        </div>
      </button>
      <div className="overflow-y-auto px-4 pb-6 space-y-2" style={{ maxHeight: expanded ? "calc(60vh - 50px)" : "80px" }}>
        {spots.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">
            কোনো স্পট পাওয়া যায়নি। নতুন স্পট যোগ করুন! ➕
          </p>
        ) : (
          spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} onClick={() => onSpotClick(spot)} />
          ))
        )}
      </div>
    </div>
  );
};

export default BottomSheet;
