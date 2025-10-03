//
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Handlebars from "npm:handlebars";
import mjml2html from 'npm:mjml';
import { corsHeaders } from '../_shared/cors.ts';
import { capitalize, getTimeStr } from '../_shared/func.ts';
import tpl from "./reminder.mjml.hbs.ts";

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const ctpl = Handlebars.compile(tpl);

    const { data, error } = await supabase
      .from('view_reminder')
      .select('*')
      .order('t_start', { ascending: true });

    if (error) {
      throw error;
    }

    if (!data){
      return new Response(
        JSON.stringify({
          message: "no data, no emails sent"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    const dF = new Intl.DateTimeFormat("nl-NL",{
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC"
    });

    const messageVersions = [];
    const sendAry = [];

    for (const d of data){
      const user_id = d.user_id;
      const task_id = d.task_id;
      const username = d.username;
      const email = d.email;
      const comment = d.comment;
      const groupName = <string>d.group_name;
      const groupNameUp = groupName.toUpperCase();
      const groupNameCap = capitalize(groupName);
      const dStart = new Date(d.t_start + 'Z');
      const dateStr = dF.format(dStart);
      const timeStart = getTimeStr(d.t_start);
      const timeEnd = getTimeStr(d.t_end);
      const params = {
        groupName,
        groupNameUp,
        groupNameCap,
        username,
        dateStr,
        timeStart,
        timeEnd,
        email,
        comment
      };
      sendAry.push({user_id, task_id, params});
      const mj = ctpl(params);
      if (typeof mj !== "string") {
        throw new Error("Template did not return a string");
      }
      console.log('mjml', mj);
      const {html, errors} = mjml2html(mj, {
        keepComments: false,
        filePath: '',
      });
      console.log('html', html);
      if (errors.length){
        throw 'mjml err: ' + errors.join(', ');
      }
      const mVersion = {
        to: [{
          email,
          name: username
        }],
        htmlContent: html,
        subject: 'Herinnering ' + groupNameUp
      };
      messageVersions.push(mVersion);
    }

    for (const s of sendAry){
      const { error } = await supabase
        .from('email_reminder_sent')
        .insert(s);

      console.log('insert err', error);

      if (error) {
        throw error;
      }
    }

    if (!sendAry.length){
      return new Response(
        JSON.stringify({
          message: "no emails sent"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": Deno.env.get('BREVO_API_KEY'),
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "IJsplanner", email: "no-reply@ijsplanner.be" },
        subject: "Herinnering",
        htmlContent: "<html><body><p>Herinnering: je hebt morgen een taak.</p></body></html>",
        messageVersions
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Brevo API error: ${errText}`);
    }

    return new Response(
      JSON.stringify({
        "message": sendAry.length + ' emails sent',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  } catch (err) {
    console.error("Edge function error:", err);

    return new Response(
      JSON.stringify({
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      }),
      { status: 400, headers: corsHeaders }
    );
  }
});
