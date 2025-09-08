import { user } from "$lib/stores/user";
import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";

/*
export async function load() {
  const u = get(user);
  if (!u) {
    throw redirect(303, '/');
  }
}
  */