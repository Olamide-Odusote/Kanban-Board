SET SQL_SAFE_UPDATES = 0;

DELETE FROM taskmanagementapp.users;
ALTER TABLE taskmanagementapp.users AUTO_INCREMENT = 1;
ALTER TABLE taskmanagementapp.boards AUTO_INCREMENT = 1;

SET SQL_SAFE_UPDATES = 1;