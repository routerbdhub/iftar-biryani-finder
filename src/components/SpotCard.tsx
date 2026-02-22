import type { IftarSpot } from "@/lib/supabase";

interface SpotCardProps {
  spot: IftarSpot;
  onClick: () => void;
}

const SpotCard = ({ spot, onClick }: SpotCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-card rounded-2xl border border-border hover:border-primary/40 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground truncate">{spot.mosque_name}</h3>
          <p className="text-sm text-muted-foreground">{spot.area}</p>
          {spot.menu && (
            <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{spot.menu}</p>
          )}
        </div>
        {spot.has_special && (
          <span className="shrink-0 bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full">
            🍛 {spot.special_type || "স্পেশাল"}
          </span>
        )}
      </div>
    </button>
  );
};

export default SpotCard;
