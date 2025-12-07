//
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Handlebars from "npm:handlebars";
import mjml2html from 'npm:mjml';
import { corsHeaders } from '../_shared/cors.ts';
import { capitalize, getTimeStr } from '../_shared/func.ts';
import tpl from "./reminder.mjml.hbs.ts";
import { MailerSend, EmailParams, Sender, Recipient } from "npm:mailersend";

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const mailerSend = new MailerSend({
      apiKey: Deno.env.get('MAILERSEND_API_TOKEN'),
    });
    const sentFrom = new Sender("no-reply@ijsplanner.be", "ijsplanner");
    const bulkEmails = [];

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
      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo([new Recipient(email, username)])
        .setSubject('Herinnering ' + groupNameUp)
        .setHtml(html);
      // replaces bulk send.
      await mailerSend.email.send(emailParams);
      bulkEmails.push(emailParams);
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

    /*
    await mailerSend.email.sendBulk(bulkEmails);
    */

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
