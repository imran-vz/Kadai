import { render } from "@react-email/render";
import argon2 from "argon2";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { ForgotPasswordEmail } from "~/emails/forgot-password";
import { env } from "~/env";
import { sendEmail } from "~/lib/email";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		},
	}),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.NEXT_PUBLIC_APP_URL,
	emailAndPassword: {
		enabled: true,
		password: {
			hash: async (password) => {
				return argon2.hash(password, {
					type: argon2.argon2id,
					memoryCost: 65536,
					timeCost: 3,
					parallelism: 1,
				});
			},
			verify: async ({ hash, password }) => {
				return argon2.verify(hash, password);
			},
		},
		sendResetPassword: async ({ user, url }) => {
			const emailHtml = await render(ForgotPasswordEmail({ resetLink: url }));
			void sendEmail({
				to: user.email,
				subject: "Reset your password",
				html: emailHtml,
			});
		},
	},
	socialProviders: {
		google: {
			clientId: env.AUTH_GOOGLE_ID,
			clientSecret: env.AUTH_GOOGLE_SECRET,
		},
	},
	session: {
		expiresIn: env.AUTH_SESSION_MAX_AGE,
		updateAge: 86400,
		cookieCache: {
			enabled: true,
			maxAge: 300,
		},
	},
	user: {
		additionalFields: {
			companyName: {
				type: "string",
				required: false,
			},
			companyAddress: {
				type: "string",
				required: false,
			},
			companyLogo: {
				type: "string",
				required: false,
			},
			gstNumber: {
				type: "string",
				required: false,
			},
			gstEnabled: {
				type: "boolean",
				required: false,
				defaultValue: false,
			},
			gstRate: {
				type: "string",
				required: false,
				defaultValue: "18.00",
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session;
