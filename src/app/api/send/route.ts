import { EmailVerification } from "@/components/email-templates/email_verification";
import { PasswordReset } from "@/components/email-templates/password_reset";
import { PasswordResetConfirmation } from "@/components/email-templates/password_reset_confirmation";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      to,
      subject,
      firstName,
      resetUrl,
      verificationUrl,
      template,
    } = body;

    if (!to || !subject || !template) {
      return Response.json(
        { error: "Missing required fields 'to', 'subject', and 'template'." },
        { status: 400 }
      );
    }

    const reactTemplate = (() => {
      switch (template) {
        case "reset": {
          if (!resetUrl) {
            throw new Error("resetUrl is required for password reset emails");
          }

          return PasswordReset({
            firstName: firstName ?? "there",
            resetUrl,
          });
        }
        case "reset-confirmation": {
          return PasswordResetConfirmation({
            firstName: firstName ?? "there",
          });
        }
        case "email-verification": {
          if (!verificationUrl) {
            throw new Error(
              "verificationUrl is required for email verification emails"
            );
          }

          return EmailVerification({
            firstName: firstName ?? "there",
            verificationUrl,
          });
        }
        default: {
          throw new Error("Unsupported email template");
        }
      }
    })();

    const { data, error } = await resend.emails.send({
      from: "Bloom Rent <contact@bloomrent.com>",
      to: [to],
      subject,
      react: reactTemplate,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send email";
    const status =
      error instanceof Error &&
      (error.message.includes("required") ||
        error.message.includes("Unsupported"))
        ? 400
        : 500;

    return Response.json({ error: message }, { status });
  }
}
