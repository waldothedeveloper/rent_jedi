import Image from "next/image";
import Link from "next/link";
import logo from "@/app/images/rj_logo.svg";

export function SharedAuthHeader() {
  return (
    <Link href="/" className="flex items-center self-center font-bold">
      <div className="text-primary-background flex size-12 items-center justify-center rounded-md">
        <Image src={logo} alt="Rent Jedi Logo" unoptimized />
      </div>
      RENT JEDI
    </Link>
  );
}
