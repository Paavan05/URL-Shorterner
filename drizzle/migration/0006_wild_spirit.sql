ALTER TABLE `sessions` MODIFY COLUMN `created_at` cal::local_datetime NOT NULL DEFAULT now();--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `updated_at` cal::local_datetime NOT NULL DEFAULT now();--> statement-breakpoint
ALTER TABLE `short_link` MODIFY COLUMN `created_at` cal::local_datetime NOT NULL DEFAULT now();--> statement-breakpoint
ALTER TABLE `short_link` MODIFY COLUMN `updated_at` cal::local_datetime NOT NULL DEFAULT now();--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `created_at` cal::local_datetime NOT NULL DEFAULT now();--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `updated_at` cal::local_datetime NOT NULL DEFAULT now();