
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { dateToISOWeek, getTimeStr } from '../_shared/func.ts';

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const decoder = new TextDecoder('utf-8');
    const rawTpl = Deno.readFileSync('overview.mjml.hbs');
    const tpl = decoder.decode(rawTpl);

    const now = new Date()
    const sixHoursLater = new Date(now.getTime() + 6 * 3600_000)
    const weekLater = new Date(sixHoursLater.getTime() + 7 * 24 * 3600_000)

    const { data, error } = await supabase
      .from('public.view_overview_with_users')
      .select('*')
      .gt('t_start', sixHoursLater.toISOString())
      .lt('t_start', weekLater.toISOString())
      .order('t_start', { ascending: true })

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
    }

    type RTask = {
      usernames: string[];
      complete: boolean;
      timeStr: string;
      comment: string;
      countStr: string;
    };

    type DayData = {
      dayStr: string;
      complete: boolean;
      tasks: RTask[];
    };

    const groupsMap = new Map<string, string>();
    const dayWkMap = new Map<string, number>();
    const grpDayTaskMap = new Map<string, string[]>();
    const tasksMap = new Map<string, Task>();
    const tasksUsersMap = new Map<string, string[]>();

    for (const d of data){
      groupsMap.set(d.group_id, d.group_name);
      const dayStr = dF.format(d.t_start);
      const wk = dateToISOWeek(d.t_start);
      dayWkMap.set(dayStr, wk);
      const grpDayId = d.group_id + ':' + dayStr;
      const tAry = grpDayTaskMap.get(grpDayId);
      if (!tAry){
        grpDayTaskMap.set(grpDayId, [d.task_id]);
      } else {
        grpDayTaskMap.set(grpDayId, [...tAry, d.task_id]);
      }
      const uAry = tasksUsersMap.get(d.task_id);
      if (!uAry){
        tasksUsersMap.set(d.task_id, [d.username]);
      } else {
        tasksUsersMap.set(d.task_id, [...uAry, d.username]);
      }
      const min_users = d.min_users;
      const max_users = d.max_users;
      const comment = d.comment;
      const t_start = d.t_start;
      const t_end = d.t_end;
      tasksMap.set(d.task_id, {
        min_users, max_users, comment, t_start, t_end
      });
    }

    for (const [groupId, groupName] of groupsMap){
      const params = {
        groupName,
        week: 0,
        days: <DayData[]>[],
        complete: true,
      };

      for (const [dayStr, wk] of dayWkMap){
        const grpDayId = groupId + ':' + dayStr;
        const tAry = grpDayTaskMap.get(grpDayId);
        if (!tAry){
          continue;
        }
        if (!params.week){
          params.week = wk;
        }
        const dayData = <DayData>{
          dayStr,
          complete: true,
          tasks: <RTask[]>[],
        };
        for (const taskId of tAry){
          const t = tasksMap.get(taskId);
          if (!t){
            continue;
          }
          const usernames = tasksUsersMap.get(taskId) ?? [];
          const task = <RTask>{
            usernames,
            complete: true,
            timeStr: '',
            comment: '',
            countStr: '',
          };
          let countStr = usernames.length.toString();
          if (t.min_users){
            if (usernames.length < t.min_users){
              task.complete = false;
              dayData.complete = false;
              params.complete = false;
            }
            countStr += '/';
            countStr += t.min_users.toString();
            if (t.max_users){
              countStr += '->';
              countStr += t.max_users.toString();
            }
          } else if (t.max_users) {
            countStr += '/->';
            countStr += t.max_users.toString();
          }
          let timeStr = getTimeStr(t.t_start);
          timeStr += ' - ';
          timeStr += getTimeStr(t.t_end);
          task.timeStr = timeStr;
          task.countStr = countStr;
          dayData.tasks.push(task);
        }
        params.days.push(dayData);
      }

      if (params.days.length && params.week){



      }
    }



    return new Response(
      JSON.stringify({}),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 400, headers: corsHeaders }
    );
  }
});
