// supabase functions deploy disable-user --no-verify-jwt
// supabase/functions/disable-user/index.ts
// @ts-ignore
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  // @ts-ignore
  Deno.env.get('SUPABASE_URL')!,
  // @ts-ignore
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth token' }), { status: 401 })
    }

    // Supabase client bound to the user's JWT
    const supabaseUser = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL')!,
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: `Bearer ${authHeader}` } } }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // Check if this user is in role_users
    const { data: role } = await supabaseUser
      .from('role_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!role) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    }

    // Parse request body
    const { user_id, disable } = await req.json()
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400 })
    }

    // Disable or enable the account using the admin client
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      banned_until: disable ? '2099-01-01T00:00:00Z' : null
    })

    if (error) throw error

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
