import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	displayUsername: text("display_username"),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	id: text("id").primaryKey(),
	image: text("image"),
	name: text("name").notNull(),
	twoFactorEnabled: boolean("two_factor_enabled").default(false),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	username: text("username").unique(),
});

export const session = pgTable(
	"session",
	{
		activeOrganizationId: text("active_organization_id"),
		activeTeamId: text("active_team_id"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		id: text("id").primaryKey(),
		ipAddress: text("ip_address"),
		token: text("token").notNull().unique(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
	"account",
	{
		accessToken: text("access_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		accountId: text("account_id").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		id: text("id").primaryKey(),
		idToken: text("id_token"),
		password: text("password"),
		providerId: text("provider_id").notNull(),
		refreshToken: text("refresh_token"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
	"verification",
	{
		createdAt: timestamp("created_at").defaultNow().notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		value: text("value").notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const twoFactor = pgTable(
	"two_factor",
	{
		backupCodes: text("backup_codes").notNull(),
		failedVerificationCount: integer("failed_verification_count").default(0),
		id: text("id").primaryKey(),
		lockedUntil: timestamp("locked_until"),
		secret: text("secret").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		verified: boolean("verified").default(true),
	},
	(table) => [
		index("twoFactor_secret_idx").on(table.secret),
		index("twoFactor_userId_idx").on(table.userId),
	]
);

export const workspace = pgTable(
	"workspace",
	{
		createdAt: timestamp("created_at").notNull(),
		id: text("id").primaryKey(),
		logo: text("logo"),
		metadata: text("metadata"),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),
	},
	(table) => [uniqueIndex("workspace_slug_uidx").on(table.slug)]
);

export const team = pgTable(
	"team",
	{
		createdAt: timestamp("created_at").notNull(),
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		updatedAt: timestamp("updated_at").$onUpdate(
			() => /* @__PURE__ */ new Date()
		),
	},
	(table) => [index("team_organizationId_idx").on(table.organizationId)]
);

export const teamMember = pgTable(
	"team_member",
	{
		createdAt: timestamp("created_at"),
		id: text("id").primaryKey(),
		teamId: text("team_id")
			.notNull()
			.references(() => team.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("teamMember_teamId_idx").on(table.teamId),
		index("teamMember_userId_idx").on(table.userId),
	]
);

export const member = pgTable(
	"member",
	{
		createdAt: timestamp("created_at").notNull(),
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		role: text("role").default("member").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("member_organizationId_idx").on(table.organizationId),
		index("member_userId_idx").on(table.userId),
	]
);

export const invitation = pgTable(
	"invitation",
	{
		createdAt: timestamp("created_at").defaultNow().notNull(),
		email: text("email").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		id: text("id").primaryKey(),
		inviterId: text("inviter_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		role: text("role"),
		status: text("status").default("pending").notNull(),
		teamId: text("team_id"),
	},
	(table) => [
		index("invitation_organizationId_idx").on(table.organizationId),
		index("invitation_email_idx").on(table.email),
	]
);

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	invitations: many(invitation),
	members: many(member),
	sessions: many(session),
	teamMembers: many(teamMember),
	twoFactor: many(twoFactor),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const workspaceRelations = relations(workspace, ({ many }) => ({
	invitations: many(invitation),
	members: many(member),
	teams: many(team),
}));

export const teamRelations = relations(team, ({ one, many }) => ({
	teamMembers: many(teamMember),
	workspace: one(workspace, {
		fields: [team.organizationId],
		references: [workspace.id],
	}),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
	team: one(team, {
		fields: [teamMember.teamId],
		references: [team.id],
	}),
	user: one(user, {
		fields: [teamMember.userId],
		references: [user.id],
	}),
}));

export const memberRelations = relations(member, ({ one }) => ({
	user: one(user, {
		fields: [member.userId],
		references: [user.id],
	}),
	workspace: one(workspace, {
		fields: [member.organizationId],
		references: [workspace.id],
	}),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
	user: one(user, {
		fields: [invitation.inviterId],
		references: [user.id],
	}),
	workspace: one(workspace, {
		fields: [invitation.organizationId],
		references: [workspace.id],
	}),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
	user: one(user, {
		fields: [twoFactor.userId],
		references: [user.id],
	}),
}));
