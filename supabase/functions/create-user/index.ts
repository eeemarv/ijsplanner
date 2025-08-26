// supabase functions deploy create-user --no-verify-jwt

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      // URL + SERVICE KEY (safe here, not in browser)
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { email, username, groups } = await req.json();

    // 1. Verify the caller is an admin
    const authHeader = req.headers.get('Authorization')!;
    const jwt = authHeader.replace('Bearer ', '');

    const {
      data: { user: caller },
    } = await supabase.auth.getUser(jwt);

    const { data: isAllowed } = await supabase
      .from('role_manage_users')
      .select('user_id')
      .eq('user_id', caller?.id)
      .maybeSingle();

    if (!isAllowed) {
      return new Response('Forbidden', { status: 403 });
    }

    // 2. Create the user
    const { data: newUser, error: errCreate } = await supabase.auth.admin.createUser({
      email
    });

    if (errCreate) {
      throw errCreate;
    }

    if (username)
    {
      const {error: errName} = await supabase.from('usernames').insert({
        user_id: newUser.user.id,
        username
      });

      if (errName) {
        throw errName;
      }
    }

    // 3. Assign groups if provided + add subscriptions
    if (groups?.length) {
      const {error: errGroups} = await supabase.from('users_groups').insert(
        groups.map((groupId: string) => ({
          user_id: newUser.user.id,
          group_id: groupId,
        }))
      )

      if (errGroups) {
        throw errGroups;
      }

      const {error: errSubOverview} = await supabase.from('sub_tasks_overview').insert(
        groups.map((groupId: string) => ({
          user_id: newUser.user.id,
          group_id: groupId,
        }))
      );

      if (errSubOverview) {
        throw errSubOverview;
      }

      const {error: errSubReminder} = await supabase.from('sub_tasks_reminder').insert(
        groups.map((groupId: string) => ({
          user_id: newUser.user.id,
          group_id: groupId,
        }))
      );

      if (errSubReminder) {
        throw errSubReminder;
      }

      const {error: errSubAlarm} = await supabase.from('sub_tasks_alarm').insert(
        groups.map((groupId: string) => ({
          user_id: newUser.user.id,
          group_id: groupId,
        }))
      );

      if (errSubAlarm) {
        throw errSubAlarm;
      }
    }

    return new Response(JSON.stringify({ id: newUser.user.id }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
