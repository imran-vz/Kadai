import { Resend } from "resend";
import { env } from "~/env";

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailProps {
	to: string;
	subject: string;
	html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailProps) {
	try {
		const emailResponse = await resend.emails.send({
			from: "Kadai <noreply@kadai.site>",
			to,
			subject,
			html,
		});

		if (emailResponse.error) {
			console.error("Failed to send email:", emailResponse.error);
			throw new Error(emailResponse.error.message);
		}

		console.log("Email sent:", emailResponse);
	} catch (error) {
		console.error("Failed to send email:", error);
		throw error;
	}
}
