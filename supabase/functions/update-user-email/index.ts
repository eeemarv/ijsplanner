// supabase functions deploy update-user-email --no-verify-jwt
// supabase/functions/update-user-email/index.ts
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { user_id, new_email } = await req.json();

    if (!user_id || !new_email ) {
      return new Response(JSON.stringify({ error: 'user_id or new_email is missing' }), {
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
      .from('role_users')
      .select('user_id')
      .eq('user_id', caller?.id)
      .maybeSingle();

    if (!isAllowed) {
      return new Response('Forbidden', {
        ...corsHeaders,
        status: 403
      });
    }

    const { data, error } = await supabase.auth.admin.updateUserById(user_id, {
      email: new_email,
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, user: data.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 400, headers: corsHeaders }
    );
  }
});
