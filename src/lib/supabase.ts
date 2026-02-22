import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ouiaxqarnckjycxoghuu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aWF4cWFybmNranljeG9naHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NDU2NDcsImV4cCI6MjA4NzMyMTY0N30.n02fkQGUEcUeEyE4Fl5zETl8RMybTFd9TcXTiHOnwUA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface IftarSpot {
  id: string;
  mosque_name: string;
  area: string;
  menu: string | null;
  has_special: boolean;
  special_type: string | null;
  lat: number;
  lng: number;
  created_at: string;
}
