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

interface EmailVerificationEmailProps {
  firstName?: string;
  verificationUrl?: string;
}

const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://${process.env.VERCEL_URL}";

export const EmailVerification = ({
  firstName,
  verificationUrl,
}: EmailVerificationEmailProps) => {
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
          <Preview>Verify your email to finish setting up Rent Jedi</Preview>
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
                Welcome to Rent Jedi! Confirm your email address to activate
                your account and start exploring your dashboard.
              </Text>
              <Button
                className="bg-[#007ee6] rounded text-white text-[15px] no-underline text-center font-dropbox-sans block w-[210px] py-3.5 px-[7px]"
                href={verificationUrl}
              >
                Verify email
              </Button>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                If you didn&apos;t create this account, you can safely ignore this
                email.
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                Thanks,
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
