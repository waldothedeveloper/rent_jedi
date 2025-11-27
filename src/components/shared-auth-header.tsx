import { Building2 } from "lucide-react";
import Link from "next/link";
export function SharedAuthHeader() {
  return (
    <Link href="/" className="flex items-center gap-2 self-center font-bold">
      <div className="text-primary-background flex size-6 items-center justify-center rounded-md">
        <Building2 className="size-5" />
      </div>
      RENT JEDI
    </Link>
  );
}
