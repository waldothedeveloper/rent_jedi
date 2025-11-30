import { PasswordReset } from "@/components/email-templates/password_reset";
import { PasswordResetConfirmation } from "@/components/email-templates/password_reset_confirmation";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, firstName, resetUrl, template } = body;

    if (!to || !subject) {
      return Response.json(
        { error: "Missing required fields 'to' and 'subject'." },
        { status: 400 }
      );
    }

    const whichTemplate =
      template === "reset-confirmation" ? "reset-confirmation" : "reset";

    const reactTemplate =
      whichTemplate === "reset-confirmation"
        ? PasswordResetConfirmation({ firstName: firstName ?? "there" })
        : PasswordReset({
            firstName: firstName ?? "there",
            resetUrl,
          });

    const { data, error } = await resend.emails.send({
      from: "Rent Jedi <contact@rentjedi.com>",
      to: [to],
      subject,
      react: reactTemplate,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.log("error trynna send password reset email : ", error);
    return Response.json({ error }, { status: 500 });
  }
}
