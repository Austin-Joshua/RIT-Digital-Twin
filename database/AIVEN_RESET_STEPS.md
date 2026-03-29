# Start from Scratch: Wipe and Restore Remote MySQL (Aiven)

Do **all** steps in **Command Prompt**. Do **not** run the wipe/schema/seed commands when you see `mysql>` — only when you see `C:\...>`.

---

## Step 1: Open a new Command Prompt

- Close any existing Command Prompt or MySQL window.
- Press **Win + R**, type **cmd**, press **Enter**.

You should see something like:

```text
C:\Users\austi>
```

There is **no** `mysql>` here. You will run all following commands in this window.

---

## Step 2: Go to your project folder

Copy-paste this and press **Enter**:

```cmd
cd /d "c:\Users\austi\OneDrive\Desktop\RIT Digital Twin\RIT-Digital-Twin"
```

Your prompt should now show this folder (e.g. `...\RIT-Digital-Twin>`). You must be in this folder for the next steps.

---

## Step 3: Wipe all tables (delete everything)

Run **one** of the two options below.

**Option A — If `mysql` is in your PATH** (you can run `mysql --version` successfully):

```cmd
mysql -h <REMOTE_MYSQL_HOST> -P <REMOTE_MYSQL_PORT> -u <REMOTE_MYSQL_USER> -p --ssl-mode=REQUIRED <REMOTE_MYSQL_DB> < database\reset-aiven.sql
```

**Option B — Use full path** (use this if you get "mysql is not recognized"):

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -h <REMOTE_MYSQL_HOST> -P <REMOTE_MYSQL_PORT> -u <REMOTE_MYSQL_USER> -p --ssl-mode=REQUIRED <REMOTE_MYSQL_DB> < database\reset-aiven.sql
```

- When prompted, type your **database password** and press **Enter** (nothing will show as you type).
- If it succeeds, you may see no output. That is normal. All tables are dropped.

**Important:** You must run this in the same Command Prompt window where you see `C:\...\RIT-Digital-Twin>`, **not** inside a `mysql>` session.

---

## Step 4: Recreate tables (schema)

**Option A:**

```cmd
mysql -h <REMOTE_MYSQL_HOST> -P <REMOTE_MYSQL_PORT> -u <REMOTE_MYSQL_USER> -p --ssl-mode=REQUIRED <REMOTE_MYSQL_DB> < database\schema.sql
```

**Option B (full path):**

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -h <REMOTE_MYSQL_HOST> -P <REMOTE_MYSQL_PORT> -u <REMOTE_MYSQL_USER> -p --ssl-mode=REQUIRED <REMOTE_MYSQL_DB> < database\schema.sql
```

Enter your database password when prompted.

---

## Step 5: Load seed data

**Option A:**

```cmd
mysql -h <REMOTE_MYSQL_HOST> -P <REMOTE_MYSQL_PORT> -u <REMOTE_MYSQL_USER> -p --ssl-mode=REQUIRED <REMOTE_MYSQL_DB> < database\seed-data.sql
```

**Option B (full path):**

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -h <REMOTE_MYSQL_HOST> -P <REMOTE_MYSQL_PORT> -u <REMOTE_MYSQL_USER> -p --ssl-mode=REQUIRED <REMOTE_MYSQL_DB> < database\seed-data.sql
```

Enter your database password when prompted.

---

## Step 6: Check that it worked

Run this (from the same prompt `C:\...\RIT-Digital-Twin>`, not inside `mysql>`):

**Option A:**

```cmd
mysql -h <REMOTE_MYSQL_HOST> -P <REMOTE_MYSQL_PORT> -u <REMOTE_MYSQL_USER> -p --ssl-mode=REQUIRED <REMOTE_MYSQL_DB> -e "SHOW TABLES;"
```

**Option B (full path):**

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -h <REMOTE_MYSQL_HOST> -P <REMOTE_MYSQL_PORT> -u <REMOTE_MYSQL_USER> -p --ssl-mode=REQUIRED <REMOTE_MYSQL_DB> -e "SHOW TABLES;"
```

Enter your password. You should see a list of table names. Then you’re done.

---

## Reminder

| Where you are        | What you can do                                                                 |
|----------------------|----------------------------------------------------------------------------------|
| `C:\...\RIT-Digital-Twin>` | Run the **full** `mysql ... < database\reset-aiven.sql` (and schema/seed) commands. |
| `mysql>`             | Only type **SQL** (e.g. `SHOW TABLES;`) or `exit`. Do **not** run the wipe/schema/seed commands here. |

If you ever see `mysql>`, type **exit** and press **Enter** to get back to `C:\...>`, then run the wipe/schema/seed commands again.

---

## Quick copy-paste list (full path, from project folder)

After Step 2, run these **one by one** (same window, prompt `C:\...\RIT-Digital-Twin>`):

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -h <REMOTE_MYSQL_HOST> -P <REMOTE_MYSQL_PORT> -u <REMOTE_MYSQL_USER> -p --ssl-mode=REQUIRED <REMOTE_MYSQL_DB> < database\reset-aiven.sql
```

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -h <REMOTE_MYSQL_HOST> -P <REMOTE_MYSQL_PORT> -u <REMOTE_MYSQL_USER> -p --ssl-mode=REQUIRED <REMOTE_MYSQL_DB> < database\schema.sql
```

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -h <REMOTE_MYSQL_HOST> -P <REMOTE_MYSQL_PORT> -u <REMOTE_MYSQL_USER> -p --ssl-mode=REQUIRED <REMOTE_MYSQL_DB> < database\seed-data.sql
```

Type your database password when each command asks for it (4 times total if you also run the check command below):

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -h <REMOTE_MYSQL_HOST> -P <REMOTE_MYSQL_PORT> -u <REMOTE_MYSQL_USER> -p --ssl-mode=REQUIRED <REMOTE_MYSQL_DB> -e "SHOW TABLES;"
```
