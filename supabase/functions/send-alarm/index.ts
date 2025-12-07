//
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Handlebars from "npm:handlebars";
//import Handlebars from "npm:handlebars@4/lib/handlebars.js";
import mjml2html from 'npm:mjml';
//import mjml2html from "https://esm.sh/mjml@4.14.1";
import { corsHeaders } from '../_shared/cors.ts';
import { capitalize, getTimeStr } from '../_shared/func.ts';
import tpl from "./alarm.mjml.hbs.ts";
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
      .from('view_alarm')
      .select('*')
      .order('t_start', { ascending: true });

    console.log("data", data);
    console.log("error", error);

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

    type Task = {
      groupId: string;
      groupName: string;
      groupNameUp: string;
      groupNameCap: string;
      comment: string|null;
      dateStr: string;
      timeStart: string;
      timeEnd: string;
      minUsers: number|null;
      maxUsers: number|null;
    };

    type Receiver = {
      email: string;
      name: string;
      user_id: string;
    };

    const tasksMap = new Map<string, Task>();
    const tasksReceiversMap = new Map<string, Receiver[]>();
    const tasksToMap = new Map();

    for (const d of data){
      const user_id = d.user_id;
      if (!user_id){
        continue;
      }
      const name = d.username;
      const email = d.email;
      const task_id = d.task_id;
      const recip = new Recipient(email, name);
      const rcvr = {email, name, user_id};
      const tm = tasksToMap.get(task_id);
      if (tm){
        tasksToMap.set(task_id, [...tm, recip]);
      } else {
        tasksToMap.set(task_id, [recip]);
      }
      const rc = tasksReceiversMap.get(task_id);
      if (rc){
        tasksReceiversMap.set(task_id, [...rc, rcvr]);
      } else {
        tasksReceiversMap.set(task_id, [rcvr]);
      }
      if (tasksMap.has(task_id)){
        continue;
      }
      const groupName = <string>d.group_name;
      const groupNameUp = groupName.toUpperCase();
      const groupNameCap = capitalize(groupName);
      const dStart = new Date(d.t_start + 'Z');
      const dateStr = dF.format(dStart);
      const timeStart = getTimeStr(d.t_start);
      const timeEnd = getTimeStr(d.t_end);
      const minUsers = d.min_users ?? null;
      const maxUsers = d.max_users ?? null;
      const comment = d.comment ?? null;
      const task = <Task>{
        groupName, groupNameCap, groupNameUp,
        dateStr, timeStart, timeEnd,
        minUsers, maxUsers, comment
      };
      tasksMap.set(task_id, task);
    }

    for (const [task_id, params] of tasksMap){
      const to = tasksToMap.get(task_id);
      if (!to){
        continue;
      }
      const mj = ctpl(params);
      if (typeof mj !== "string") {
        throw new Error("Template did not return a string");
      }
      const {html, errors} = mjml2html(mj, {
        keepComments: false,
        filePath: '',
      });
      if (errors.length){
        throw 'mjml err: ' + errors.join(', ');
      }
      for (const t of to){
        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo([t])
          .setSubject('ALarm ' + params.groupNameUp)
          .setHtml(html);
        //replaces bulk send
        await mailerSend.email.send(emailParams);
        bulkEmails.push(emailParams);
      }
      const receivers = tasksReceiversMap.get(task_id);
      if (!receivers){
        throw 'Error: no receivers (logic error)';
      }
      sendAry.push({task_id, params, receivers});
    }

    for (const s of sendAry){
      const { error } = await supabase
        .from('email_alarm_sent')
        .insert(s);

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
    if (bulkEmails.length){
      await mailerSend.email.sendBulk(bulkEmails);
    }
    */

    return new Response(
      JSON.stringify({
        "message": bulkEmails.length + ' emails sent',
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
