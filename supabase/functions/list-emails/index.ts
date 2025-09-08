import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async (req: Request) => {
  try {
    // 1. Get the JWT of the caller
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 })
    }
    const token = authHeader.replace("Bearer ", "")

    // 2. Verify the user
    const { data: { user }, error: userError } =
      await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // 3. Check if user is in role_manage_users
    const { data: role, error: roleError } = await supabase
      .from("role_manage_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(); // zero or one result gives no error

    if (roleError) {
      console.error(roleError)
      return new Response("Error checking role", { status: 500 })
    }
    if (!role) {
      return new Response("Forbidden", { status: 403 })
    }

    // 4. Get all users (using admin API)
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) {
      console.error(error)
      return new Response("Error fetching users", { status: 500 })
    }

    // 5. Return only id + email
    /*
    const users = data.users.map(u => ({
      id: u.id,
      email: u.email
    }));
    */

    const user_emails = {};

    for (const u of data.users) {
      user_emails[u.id] = u.email;
    };

    return new Response(JSON.stringify(user_emails), {
      headers: { "Content-Type": "application/json" }
    })

  } catch (e: any) {
    console.error(e)
    return new Response("Unexpected error", { status: 500 })
  }
}
