-- RIT Digital Twin - Audit Query for ADMIN / FACULTY Accounts
-- Finding 3.1: Identifying existing admin/faculty accounts that may have been created
-- via the leaked invite-code privilege escalation vulnerability.

-- This query selects all users who currently possess the ADMIN or FACULTY role.
-- It excludes known legitimate administrative accounts (e.g., standard 'admin' or system accounts).
-- The project owner must manually review this list and revoke/delete any accounts 
-- that do not correspond to a legitimate, out-of-band provisioning event.

SELECT 
    u.user_id, 
    u.username, 
    u.email, 
    u.first_name, 
    u.last_name, 
    r.role_name, 
    u.account_status, 
    u.last_login 
FROM 
    users u
JOIN 
    roles r ON u.role_id = r.id
WHERE 
    r.role_name IN ('ADMIN', 'FACULTY')
    -- Add any known legitimate admin usernames here to filter them out of the audit results
    AND u.username NOT IN ('superadmin', 'system_admin')
ORDER BY 
    r.role_name, u.user_id;
