CREATE TABLE "rpg_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"genre" varchar(100) NOT NULL,
	"system" varchar(100) NOT NULL,
	"nivel" varchar(20) NOT NULL,
	"max_players" integer NOT NULL,
	"current_players" integer NOT NULL,
	"schedule" varchar(255) NOT NULL,
	"platform" varchar(20) NOT NULL,
	"location" varchar(255),
	"image" varchar(255) NOT NULL,
	"master_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rpg_group_tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "tag_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "rpg_group_tag" ADD CONSTRAINT "rpg_group_tag_group_id_rpg_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."rpg_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rpg_group_tag" ADD CONSTRAINT "rpg_group_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE no action ON UPDATE no action;