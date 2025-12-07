
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Handlebars from 'npm:handlebars';
import mjml2html from 'npm:mjml';
import { capitalize, dateToISOWeek, getTimeStr } from '../_shared/func.ts';
import { MailerSend, EmailParams, Sender, Recipient } from 'npm:mailersend';
import tpl from './overview.mjml.hbs.ts';

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
      .from('view_overview')
      .select('*');

    if (error) {
      throw error;
    }

    if (!data){
      return new Response(
        JSON.stringify({}),
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

    type Task = {
      min_users: null|number;
      max_users: null|number;
      comment: null|string;
      t_start: string;
      t_end: string;
      volunteers: string[];
    }

    type RTask = {
      volunteers: string[];
      complete: boolean;
      startStr: string;
      endStr: string;
      comment: string|null;
      countStr: string;
    };

    type DayData = {
      dateStr: string;
      complete: boolean;
      tasks: RTask[];
    };

    const groupsMap = new Map<string, string>();
    const groupsRecipientsSet = new Set<string>();
    const groupsRecipientsMap = new Map<string, typeof Recipient[]>();
    const dayWkMap = new Map<string, number>();
    const grpDayTaskMap = new Map<string, string[]>();
    const tasksMap = new Map<string, Task>();

    for (const d of data){
      const group_id = d.group_id;
      const group_name = d.group_name;
      const email = d.email;
      const username = d.username;
      const task_id = d.task_id;
      const min_users = d.min_users;
      const max_users = d.max_users;
      const comment = d.comment;
      const t_start = d.t_start;
      const t_end = d.t_end;
      const volunteers = d.volunteers;
      if (!groupsMap.has(group_id)){
        groupsMap.set(group_id, group_name);
      }
      const reciId = group_id + ':' + email;
      if (!groupsRecipientsSet.has(reciId)){
        const reci = new Recipient(email, username);
        const rAry = groupsRecipientsMap.get(group_id) ?? [];
        groupsRecipientsMap.set(group_id, [...rAry, reci]);
        groupsRecipientsSet.add(reciId);
      }
      if (tasksMap.has(task_id)){
        continue;
      }
      const startDate = new Date(t_start + 'Z');
      const dateStr = dF.format(startDate);
      const wk = dateToISOWeek(startDate);
      dayWkMap.set(dateStr, wk);
      const grpDayId = group_id + ':' + dateStr;
      const tAry = grpDayTaskMap.get(grpDayId);
      if (!tAry){
        grpDayTaskMap.set(grpDayId, [task_id]);
      } else {
        grpDayTaskMap.set(grpDayId, [...tAry, task_id]);
      }
      tasksMap.set(task_id, {
        min_users,
        max_users,
        comment,
        t_start,
        t_end,
        volunteers
      });
    }

    for (const [groupId, groupName] of groupsMap){
      const groupNameUp = groupName.toUpperCase();
      const groupNameCap = capitalize(groupName);
      const params = {
        groupName,
        groupNameUp,
        groupNameCap,
        week: 0,
        days: <DayData[]>[],
        complete: true,
      };
      for (const [dateStr, wk] of dayWkMap){
        const grpDayId = groupId + ':' + dateStr;
        const tAry = grpDayTaskMap.get(grpDayId);
        if (!tAry){
          continue;
        }
        if (!params.week){
          params.week = wk;
        }
        const dayData = <DayData>{
          dateStr,
          complete: true,
          tasks: <RTask[]>[],
        };
        for (const taskId of tAry){
          const t = tasksMap.get(taskId);
          if (!t){
            continue;
          }
          const volunteers = t.volunteers;
          const min_users = t.min_users;
          const max_users = t.max_users;
          const t_start = t.t_start;
          const t_end = t.t_end;
          const comment = t.comment;
          const complete = volunteers.length >= (min_users ?? 0);
          let countStr = volunteers.length.toString();
          if (min_users){
            if (volunteers.length < min_users){
              dayData.complete = false;
              params.complete = false;
            }
            countStr += '/';
            countStr += min_users.toString();
            if (max_users){
              countStr += '->';
              countStr += max_users.toString();
            }
          } else if (max_users) {
            countStr += '/->';
            countStr += max_users.toString();
          }
          const task = <RTask>{
            volunteers,
            complete,
            startStr: getTimeStr(t_start),
            endStr: getTimeStr(t_end),
            comment,
            countStr,
          };
          dayData.tasks.push(task);
        }
        params.days.push(dayData);
      }

      if (params.days.length && params.week){
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
        const to = groupsRecipientsMap.get(groupId) ?? [];
        const to_users = [];
        for (const t of to){
          const email = t.email;
          const username = t.name;
          to_users.push({email, username});
          const week = params.week;
          const subject = 'Week ' + week + ' ' + groupNameUp;
          const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo([t])
            .setSubject(subject)
            .setHtml(html);
          // replaces bulk send.
          await mailerSend.email.send(emailParams);
          bulkEmails.push(emailParams);
        }

        const { error } = await supabase
          .from('email_overview_sent')
          .insert({params,
            group_id: groupId,
            to_users
          });

        if (error) {
          throw error;
        }
      }
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
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 400, headers: corsHeaders }
    );
  }
});
