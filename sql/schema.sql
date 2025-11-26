-- Create the database (optional, depending on environment)
CREATE DATABASE IF NOT EXISTS `<DB_NAME>`;
USE `agent_tracker`;

-- Table for storing agent time entries
CREATE TABLE IF NOT EXISTS `agent_time_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `agent` VARCHAR(100) NOT NULL,
  `repository` VARCHAR(255) NOT NULL,
  `branch` VARCHAR(255) DEFAULT NULL,
  `seconds` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
