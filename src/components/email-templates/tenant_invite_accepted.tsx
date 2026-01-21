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

interface TenantInviteAcceptedEmailProps {
  firstName?: string;
  propertyName?: string;
  propertyAddress?: string;
  unitNumber?: string;
}

export const TenantInviteAccepted = ({
  firstName,
  propertyName,
  propertyAddress,
  unitNumber,
}: TenantInviteAcceptedEmailProps) => {
  const propertyLocation = unitNumber
    ? `${propertyName ?? "your rental"} (Unit ${unitNumber})`
    : (propertyName ?? "your rental");

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
            Welcome to {propertyName ?? "your new home"}! Your account is ready.
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
                Hi {firstName ?? "there"},
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                Welcome to Bloom Rent! Your account has been successfully
                created for <strong>{fullLocation}</strong>.
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                You can now log in to access your tenant dashboard and manage
                your rental:
              </Text>
              <ul className="text-base font-dropbox font-light text-[#404040] leading-[26px] pl-4 my-0">
                <li className="mb-1">View property and lease information</li>
                <li className="mb-1">Pay rent securely online</li>
                <li className="mb-1">Submit maintenance requests</li>
                <li className="mb-1">Message your landlord directly</li>
              </ul>
              <Button
                className="bg-[#007ee6] rounded text-white text-[15px] no-underline text-center font-dropbox-sans block w-[200px] py-3.5 px-[7px] mt-6"
                href={
                  process.env.NODE_ENV === "development"
                    ? "http://localhost:3000/login"
                    : "https://bloomrent.com/login"
                }
              >
                Log In to Your Account
              </Button>
              <Text className="text-sm font-dropbox font-light text-[#666666] leading-[22px] mt-6">
                If you have any questions about your lease or the platform,
                please reach out to your landlord or contact our support team.
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
