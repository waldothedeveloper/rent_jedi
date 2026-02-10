import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components";

interface PasswordResetEmailProps {
  firstName?: string;
  resetUrl?: string;
}

const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

export const PasswordReset = ({
  firstName,
  resetUrl,
}: PasswordResetEmailProps) => {
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
          <Preview>Bloom Rent. Reset your password</Preview>
          <Container className="bg-white border border-solid border-[#f0f0f0] p-[45px]">
            <Img
              src={`${baseUrl}/images/rj_logo.svg`}
              width="40"
              height="33"
              alt="Bloom Rent Logo"
            />
            <Section>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                Hi {firstName},
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                Someone recently requested a password change for your Bloom Rent
                account. If this was you, you can set a new password here:
              </Text>
              <Button
                className="bg-[#007ee6] rounded text-white text-[15px] no-underline text-center font-dropbox-sans block w-[210px] py-3.5 px-[7px]"
                href={resetUrl}
              >
                Reset password
              </Button>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                If you don&apos;t want to change your password or didn&apos;t
                request this, just ignore and delete this message.
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                To keep your account secure, please don&apos;t forward this
                email to anyone. See our Help Center for{" "}
                <Link className="underline" href={resetUrl}>
                  more security tips.
                </Link>
              </Text>
              <Text className="text-base font-dropbox font-light text-[#404040] leading-[26px]">
                Stay secure,
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
