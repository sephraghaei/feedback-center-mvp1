ALTER TABLE "posts" DROP CONSTRAINT "posts_shape_check";--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_shape_check" CHECK ((
        "posts"."type" = 'feedback'
        and "posts"."status" in ('new', 'planned', 'in_progress', 'shipped')
      ) or (
        "posts"."type" = 'support'
        and "posts"."category" is null
        and "posts"."status" in ('open', 'answered', 'closed')
      ));