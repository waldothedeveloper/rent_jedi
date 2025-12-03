import Image from "next/image";
import Link from "next/link";
import logo from "@/app/images/bloom_rent_logo.svg";

export function SharedAuthHeader() {
  return (
    <Link href="/" className="flex items-center self-center font-bold">
      <div className="text-primary-background flex size-6 items-center justify-center rounded-md">
        <Image src={logo} alt="Bloom Rent Logo" unoptimized />
      </div>
      <span className="ml-2 text-xl">Bloom Rent</span>
    </Link>
  );
}
