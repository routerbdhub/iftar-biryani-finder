import { useState, useEffect } from "react";
import { supabase, type IftarSpot } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Lock, MapPin, Star, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ADMIN_PASS = "12312";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [spots, setSpots] = useState<IftarSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleLogin = () => {
    if (password === ADMIN_PASS) {
      setAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      toast.success("অ্যাডমিন প্যানেলে স্বাগতম!");
    } else {
      toast.error("ভুল পাসওয়ার্ড!");
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchSpots();
  }, [authenticated]);

  const fetchSpots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("iftar_spots")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (!error && data) setSpots(data as IftarSpot[]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই স্পটটি মুছে ফেলতে চান?")) return;
    setDeleting(id);
    const { error } = await supabase.from("iftar_spots").delete().eq("id", id);
    setDeleting(null);
    if (error) {
      toast.error("ডিলিট করা যায়নি। RLS পলিসি চেক করুন।");
      return;
    }
    setSpots((prev) => prev.filter((s) => s.id !== id));
    toast.success("স্পট মুছে ফেলা হয়েছে!");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">অ্যাডমিন প্যানেল</h1>
            <p className="text-muted-foreground text-sm">পাসওয়ার্ড দিয়ে লগইন করুন</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <Input
              type="password"
              placeholder="পাসওয়ার্ড লিখুন"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl text-center text-lg"
            />
            <Button type="submit" className="w-full rounded-xl py-6 font-bold text-base">
              🔓 লগইন
            </Button>
          </form>
          <Link to="/" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> হোমে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-foreground">🛡️ অ্যাডমিন প্যানেল</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{spots.length}টি স্পট</span>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={handleLogout}>
            লগআউট
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">লোড হচ্ছে...</p>
        ) : spots.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">কোনো স্পট নেই</p>
        ) : (
          spots.map((spot) => (
            <div
              key={spot.id}
              className="bg-card border border-border rounded-2xl p-4 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground truncate">{spot.mosque_name}</h3>
                  {spot.has_special && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
                      <Star className="h-3 w-3" /> স্পেশাল
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {spot.area}
                </p>
                {spot.menu && (
                  <p className="text-sm text-muted-foreground">🍽️ {spot.menu}</p>
                )}
                {spot.special_type && (
                  <p className="text-sm text-accent-foreground font-medium">🍛 {spot.special_type}</p>
                )}
                <p className="text-xs text-muted-foreground/60">
                  {new Date(spot.created_at).toLocaleString("bn-BD")}
                </p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="shrink-0 rounded-xl"
                disabled={deleting === spot.id}
                onClick={() => handleDelete(spot.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Admin;
