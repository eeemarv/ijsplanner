//
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Handlebars from "npm:handlebars";
import mjml2html from 'npm:mjml';
import { corsHeaders } from '../_shared/cors.ts';
import { capitalize, getTimeStr } from '../_shared/func.ts';
import tpl from "./alarm.mjml.hbs.ts";

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

    const messageVersions = [];
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

    type To = {
      email: string;
      name: string;
    };

    type Receiver = To & {
      user_id: string;
    };

    const tasksMap = new Map<string, Task>();
    const tasksReceiversMap = new Map<string, Receiver[]>();
    const tasksToMap = new Map<string, To[]>();
    let emailCount = 0;

    for (const d of data){
      const user_id = d.user_id;
      if (!user_id){
        continue;
      }
      const name = d.username;
      const email = d.email;
      const task_id = d.task_id;
      const tob = {email, name};
      const rcvr = {...tob, user_id};
      const tm = tasksToMap.get(task_id);
      if (tm){
        tasksToMap.set(task_id, [...tm, tob]);
      } else {
        tasksToMap.set(task_id, [tob]);
      }
      const rc = tasksReceiversMap.get(task_id);
      if (rc){
        tasksReceiversMap.set(task_id, [...rc, rcvr]);
      } else {
        tasksReceiversMap.set(task_id, [rcvr]);
      }
      emailCount++;
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
      const mVersion = {
        to,
        htmlContent: html,
        subject: 'Alarm ' + params.groupNameUp
      };
      messageVersions.push(mVersion);
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

    console.log('versions', messageVersions);

    const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": Deno.env.get('BREVO_API_KEY'),
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "IJsplanner", email: "no-reply@ijsplanner.be" },
        subject: "Alarm",
        htmlContent: "<html><body><p>Alarm: morgen staat nog een taak open.</p></body></html>",
        messageVersions
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Brevo API error: ${errText}`);
    }

    return new Response(
      JSON.stringify({
        "message": emailCount + ' emails sent',
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
