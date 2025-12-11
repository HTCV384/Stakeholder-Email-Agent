CREATE TABLE `emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` int NOT NULL,
	`stakeholderId` int NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`qualityScore` int,
	`reflectionNotes` text,
	`generationMode` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` int NOT NULL,
	`level` enum('info','warning','error','debug') NOT NULL DEFAULT 'info',
	`agent` varchar(100),
	`message` text NOT NULL,
	`testId` varchar(100),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stakeholders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`title` varchar(255),
	`details` text,
	`selected` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stakeholders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reportUrl` text NOT NULL,
	`reportFilename` varchar(255) NOT NULL,
	`companySummary` text,
	`status` enum('uploading','extracting','ready','generating','completed','failed') NOT NULL DEFAULT 'uploading',
	`generationMode` enum('ai_style','template','custom'),
	`modeConfig` text,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflows_id` PRIMARY KEY(`id`)
);
