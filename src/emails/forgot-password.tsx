import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Text,
} from "@react-email/components";
import * as React from "react";

interface ForgotPasswordEmailProps {
	resetLink: string;
}

export const ForgotPasswordEmail = ({
	resetLink,
}: ForgotPasswordEmailProps) => (
	<Html>
		<Head />
		<Preview>Reset your password for Kadai</Preview>
		<Body style={main}>
			<Container style={container}>
				<Heading style={h1}>Reset your password</Heading>
				<Text style={text}>
					Someone requested a password reset for your Kadai account. If this
					wasn't you, please ignore this email.
				</Text>
				<Text style={text}>Click the link below to reset your password:</Text>
				<Link href={resetLink} style={button}>
					Reset Password
				</Link>
				<Text style={footer}>
					If you're having trouble clicking the button, copy and paste this URL
					into your browser: {resetLink}
				</Text>
			</Container>
		</Body>
	</Html>
);

const main = {
	backgroundColor: "#ffffff",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
	margin: "0 auto",
	padding: "20px 0 48px",
	maxWidth: "560px",
};

const h1 = {
	color: "#1a1a1a",
	fontSize: "24px",
	fontWeight: "600",
	lineHeight: "32px",
	margin: "16px 0",
};

const text = {
	color: "#4a4a4a",
	fontSize: "16px",
	lineHeight: "24px",
	margin: "16px 0",
};

const button = {
	backgroundColor: "#000000",
	borderRadius: "4px",
	color: "#ffffff",
	display: "inline-block",
	fontSize: "16px",
	fontWeight: "600",
	lineHeight: "24px",
	margin: "16px 0",
	padding: "12px 24px",
	textDecoration: "none",
};

const footer = {
	color: "#898989",
	fontSize: "12px",
	lineHeight: "20px",
	margin: "16px 0",
	wordBreak: "break-all" as const,
};
