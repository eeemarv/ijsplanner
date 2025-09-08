// supabase functions deploy create-user --no-verify-jwt
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'
// import { createClient } from 'npm:supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { email, username } = await req.json();

    if (!email || !username) {
      return new Response(JSON.stringify({ error: 'Email and name are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user: caller }
    } = await supabase.auth.getUser(token);

    const { data: isAllowed } = await supabase
      .from('role_manage_users')
      .select('user_id')
      .eq('user_id', caller?.id)
      .maybeSingle();

    if (!isAllowed) {
      return new Response('Forbidden', {
        ...corsHeaders,
        status: 403
      });
    }

    const { data: newUser, error: errCreate } = await supabase.auth.admin.createUser({
      email,
      user_metadata: { username }
    });

    if (errCreate) {
      throw errCreate;
    }

    const {error: errName} = await supabase.from('usernames').insert({
      user_id: newUser.user.id,
      username
    });

    if (errName) {
      throw errName;
    }

    return new Response(JSON.stringify({ user_id: newUser.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
