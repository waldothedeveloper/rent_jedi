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

interface TenantInviteAcceptedLandlordEmailProps {
  tenantName?: string;
  propertyName?: string;
  unitNumber?: string;
  acceptedAt?: string;
}

export const TenantInviteAcceptedLandlord = ({
  tenantName,
  propertyName,
  unitNumber,
  acceptedAt,
}: TenantInviteAcceptedLandlordEmailProps) => {
  const propertyLocation = unitNumber
    ? `${propertyName ?? "your property"} (Unit ${unitNumber})`
    : (propertyName ?? "your property");

  const formattedDate = acceptedAt
    ? new Date(acceptedAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "recently";

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
            {tenantName ?? "Your tenant"} accepted your invitation to{" "}
            {propertyLocation}
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
                Good news!
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                <strong>{tenantName ?? "Your tenant"}</strong> has accepted
                your invitation and created their Bloom Rent account for{" "}
                <strong>{propertyLocation}</strong>.
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                Accepted on: <strong>{formattedDate}</strong>
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                Your tenant can now:
              </Text>
              <ul className="text-base font-dropbox font-light text-[#404040] leading-[26px] pl-4 my-0">
                <li className="mb-1">View their lease information</li>
                <li className="mb-1">Submit rent payments online</li>
                <li className="mb-1">Create maintenance requests</li>
                <li className="mb-1">Communicate with you through the app</li>
              </ul>
              <Button
                className="bg-[#007ee6] rounded text-white text-[15px] no-underline text-center font-dropbox-sans block w-[200px] py-3.5 px-[7px] mt-6"
                href={
                  process.env.NODE_ENV === "development"
                    ? "http://localhost:3000/owners/tenants"
                    : "https://bloomrent.com/owners/tenants"
                }
              >
                View Tenant Details
              </Button>
              <Text className="text-sm font-dropbox font-light text-[#666666] leading-[22px] mt-6">
                You can now manage this tenant&apos;s lease, track payments,
                and handle maintenance requests all in one place.
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px] mt-6">
                Best regards,
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
