import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="এলাকা খুঁজুন... (যেমন: ধানমন্ডি, মিরপুর)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-12 pr-4 py-6 bg-card/95 backdrop-blur-md border-border shadow-xl rounded-2xl text-base"
        />
      </div>
    </div>
  );
};

export default SearchBar;
