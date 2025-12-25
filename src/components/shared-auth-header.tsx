import Image from "next/image";
import Link from "next/link";
import logo from "@/app/images/bloom_rent_logo.svg";

export function SharedAuthHeader() {
  return (
    <Link href="/" className="ml-3 flex items-center self-center gap-2">
      <div className="text-primary-background flex size-4 items-center justify-center rounded-md">
        <Image src={logo} alt="Bloom Rent Logo" unoptimized />
      </div>
      <strong>Bloom Rent</strong>
    </Link>
  );
}
