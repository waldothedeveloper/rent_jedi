import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components";

interface TenantInvitationEmailProps {
  inviteeName?: string;
  propertyName?: string;
  propertyAddress?: string;
  unitNumber?: string;
  ownerName?: string;
  inviteUrl?: string;
  expiresInDays?: number;
}

export const TenantInvitation = ({
  inviteeName,
  propertyName,
  propertyAddress,
  unitNumber,
  ownerName,
  inviteUrl,
  expiresInDays = 14,
}: TenantInvitationEmailProps) => {
  // Build property location string with unit number if available
  const propertyLocation = unitNumber
    ? `${propertyName ?? "your new rental"} (Unit ${unitNumber})`
    : (propertyName ?? "your new rental");

  const fullLocation = propertyAddress
    ? `${propertyLocation} at ${propertyAddress}`
    : propertyLocation;

  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: "#007291",
              },
            },
          },
        }}
      >
        <Body className="bg-[#f6f9fc] py-2.5">
          <Preview>
            Action Required:{" "}
            {ownerName ? `${ownerName} has invited you to` : ""} set up your
            rental at {propertyName ?? "your property"}
          </Preview>
          <Container className="bg-white border border-solid border-[#f0f0f0] p-[45px]">
            <Img
              src="https://www.bloomrent.com/_next/static/media/bloom_rent_logo.c177ee65.svg"
              width="16"
              height="26"
              alt="Bloom Rent Logo"
            />
            <Section>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                Hi {inviteeName ?? "there: "},
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                Your landlord, <strong>{ownerName ?? "your landlord"}</strong>,
                has invited you to join Bloom Rent to manage your new rental
                home at <strong>{fullLocation}</strong>.
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                We&apos;ve made the &quot;boring stuff&quot; easy. By setting up
                your account, you can:
              </Text>
              <ul className="text-base font-dropbox font-light text-[#404040] leading-[26px] pl-4 my-0">
                <li className="mb-1">Sign your lease digitally.</li>
                <li className="mb-1">
                  Pay rent securely via your preferred method.
                </li>
                <li className="mb-1">
                  Submit maintenance requests in seconds.
                </li>
                <li className="mb-1">
                  Message {ownerName ?? "your landlord"} directly through the
                  app.
                </li>
              </ul>
              <Button
                className="bg-[#007ee6] rounded text-white text-[15px] no-underline text-center font-dropbox-sans block w-[250px] py-3.5 px-[7px] mt-6"
                href={inviteUrl}
              >
                Accept Invitation & Get Started
              </Button>
              <Text className="text-sm font-dropbox font-light text-[#666666] leading-[22px] mt-6">
                Note: This link expires in {expiresInDays} days. If you have
                questions about your lease terms, please reach out to{" "}
                {ownerName ?? "your landlord"} directly.
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px] mt-6">
                Welcome home,
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                The Bloom Rent Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
