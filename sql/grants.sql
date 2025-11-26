-- Create API user for agent-time-tracker
CREATE USER IF NOT EXISTS 'agents_api_user'@'%' IDENTIFIED BY '<PASSWORD>';

-- Restrict global permissions
GRANT USAGE ON *.* TO 'agents_api_user'@'%';

-- Grant only needed table priveleges
GRANT SELECT, INSERT, UPDATE ON `<DB_NAME>`.`agent_time_entries` TO 'agent_api_user'@'%';
