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

interface PasswordResetConfirmationEmailProps {
  firstName?: string;
}

const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://${process.env.VERCEL_URL}";

export const PasswordResetConfirmation = ({
  firstName,
}: PasswordResetConfirmationEmailProps) => {
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
          <Preview>Your Rent Jedi password was reset</Preview>
          <Container className="bg-white border border-solid border-[#f0f0f0] p-[45px]">
            <Img
              src={`${baseUrl}/images/rj_logo.svg`}
              width="40"
              height="33"
              alt="Rent Jedi Logo"
            />
            <Section>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                Hi {firstName ?? "there"},
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                Your Rent Jedi password was just changed. If this was you, no
                action is needed.
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                If you didn&apos;t make this change, contact support right away.
              </Text>
              <Button
                className="bg-[#007ee6] rounded text-white text-[15px] no-underline text-center font-dropbox-sans block w-[210px] py-3.5 px-[7px]"
                href={baseUrl}
              >
                Contact Rent Jedi Support
              </Button>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                Stay secure,
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                The Rent Jedi Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
