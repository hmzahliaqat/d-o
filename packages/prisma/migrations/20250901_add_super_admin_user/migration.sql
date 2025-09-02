-- Create super-admin user with email Emailmarkethosting@gmail.com and password 11111111
-- First, we need to hash the password
-- Since we can't hash passwords in SQL, we'll insert a pre-hashed version of "11111111"
-- The actual hash would be generated using bcrypt with appropriate salt
-- For this example, we're using a placeholder that should be replaced with a proper hash

-- Insert the super-admin user if it doesn't exist
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Check if user already exists
    SELECT EXISTS(SELECT 1 FROM "User" WHERE "email" = 'Emailmarkethosting@gmail.com') INTO user_exists;

    IF NOT user_exists THEN
        -- Insert the user with SUPER_ADMIN role
        -- Note: The password hash below is a placeholder and should be replaced with a proper bcrypt hash of "11111111"
        INSERT INTO "User" ("name", "email", "password", "createdAt", "updatedAt", "lastSignedIn", "roles", "identityProvider", "disabled")
        VALUES (
            'Super Admin',
            'Emailmarkethosting@gmail.com',
            '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm', -- Hash for "11111111"
            NOW(),
            NOW(),
            NOW(),
            ARRAY['SUPER_ADMIN']::"Role"[],
            'DOCUMENSO',
            false
        );
    ELSE
        -- If user exists, update their roles to include SUPER_ADMIN
        UPDATE "User"
        SET "roles" = array_append("roles", 'SUPER_ADMIN'::"Role")
        WHERE "email" = 'Emailmarkethosting@gmail.com'
        AND NOT ('SUPER_ADMIN'::"Role" = ANY("roles"));
    END IF;
END
$$;
