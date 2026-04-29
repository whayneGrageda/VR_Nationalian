-- Function to update password by email
-- This function updates a user's password using their email address
-- The password will be automatically hashed by the trigger

CREATE OR REPLACE FUNCTION fn_update_password_by_email(
  p_email TEXT,
  p_new_password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the password for the user with the given email
  UPDATE tblusers
  SET password = p_new_password,
      updated_at = NOW()
  WHERE email = p_email
    AND is_active = true;

  -- Check if any row was updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found or inactive';
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION fn_update_password_by_email(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_update_password_by_email(TEXT, TEXT) TO anon;
