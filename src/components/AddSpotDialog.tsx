import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, MapPin, Locate } from "lucide-react";
import { supabase, type IftarSpot } from "@/lib/supabase";
import { toast } from "sonner";

interface AddSpotDialogProps {
  onSpotAdded: (spot: IftarSpot) => void;
  pendingLocation: { lat: number; lng: number } | null;
  onRequestMapClick: () => void;
  onClearPending: () => void;
}

const AddSpotDialog = ({
  onSpotAdded,
  pendingLocation,
  onRequestMapClick,
  onClearPending,
}: AddSpotDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mosqueName, setMosqueName] = useState("");
  const [area, setArea] = useState("");
  const [menu, setMenu] = useState("");
  const [hasSpecial, setHasSpecial] = useState(false);
  const [specialType, setSpecialType] = useState("");
  const [lat, setLat] = useState<number | null>(pendingLocation?.lat ?? null);
  const [lng, setLng] = useState<number | null>(pendingLocation?.lng ?? null);

  const resetForm = () => {
    setMosqueName("");
    setArea("");
    setMenu("");
    setHasSpecial(false);
    setSpecialType("");
    setLat(null);
    setLng(null);
    onClearPending();
  };

  // Auto-open when pending location is set from map click
  useEffect(() => {
    if (pendingLocation) {
      setLat(pendingLocation.lat);
      setLng(pendingLocation.lng);
      setOpen(true);
    }
  }, [pendingLocation]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      toast.error("আপনার ব্রাউজার GPS সাপোর্ট করে না");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        toast.success("লোকেশন পাওয়া গেছে!");
      },
      () => toast.error("লোকেশন পাওয়া যায়নি")
    );
  };

  const handleMapClick = () => {
    onRequestMapClick();
    setOpen(false);
    toast.info("ম্যাপে ক্লিক করে লোকেশন সেট করুন");
  };

  const handleSubmit = async () => {
    if (!mosqueName.trim() || !area.trim() || lat === null || lng === null) {
      toast.error("মসজিদের নাম, এলাকা এবং লোকেশন আবশ্যক");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("iftar_spots")
      .insert({
        mosque_name: mosqueName.trim(),
        area: area.trim(),
        menu: menu.trim() || null,
        has_special: hasSpecial,
        special_type: hasSpecial ? specialType.trim() || null : null,
        lat,
        lng,
      })
      .select()
      .single();

    setLoading(false);
    if (error) {
      toast.error("সেভ করা যায়নি। আবার চেষ্টা করুন।");
      return;
    }
    toast.success("ইফতার স্পট যোগ করা হয়েছে! 🎉");
    onSpotAdded(data as IftarSpot);
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-36 right-4 z-[1001] rounded-full h-14 w-14 shadow-2xl bg-primary hover:bg-primary/90 p-0"
        >
          <Plus className="h-7 w-7" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl max-w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            🕌 নতুন ইফতার স্পট যোগ করুন
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>মসজিদের নাম *</Label>
            <Input
              placeholder="যেমন: বায়তুল মুকাররম"
              value={mosqueName}
              onChange={(e) => setMosqueName(e.target.value)}
              className="rounded-xl mt-1"
            />
          </div>
          <div>
            <Label>এলাকা *</Label>
            <Input
              placeholder="যেমন: ধানমন্ডি"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="rounded-xl mt-1"
            />
          </div>
          <div>
            <Label>আজকের ইফতার মেনু</Label>
            <Textarea
              placeholder="যেমন: খেজুর, পিয়াজু, বেগুনি, জিলাপি..."
              value={menu}
              onChange={(e) => setMenu(e.target.value)}
              className="rounded-xl mt-1 resize-none"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
            <Checkbox
              id="special"
              checked={hasSpecial}
              onCheckedChange={(c) => setHasSpecial(!!c)}
            />
            <Label htmlFor="special" className="cursor-pointer font-medium">
              🍛 স্পেশাল আয়োজন আছে
            </Label>
          </div>
          {hasSpecial && (
            <Input
              placeholder="যেমন: বিরিয়ানি, তেহারি, কাচ্চি..."
              value={specialType}
              onChange={(e) => setSpecialType(e.target.value)}
              className="rounded-xl"
            />
          )}
          <div>
            <Label>লোকেশন *</Label>
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleGPS}
                className="flex-1 rounded-xl"
              >
                <Locate className="h-4 w-4 mr-2" />
                GPS ব্যবহার করুন
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleMapClick}
                className="flex-1 rounded-xl"
              >
                <MapPin className="h-4 w-4 mr-2" />
                ম্যাপে ক্লিক করুন
              </Button>
            </div>
            {lat !== null && lng !== null && (
              <p className="text-sm text-primary mt-2 font-medium">
                📍 {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl py-6 text-base font-bold"
          >
            {loading ? "সেভ হচ্ছে..." : "✅ স্পট যোগ করুন"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSpotDialog;
