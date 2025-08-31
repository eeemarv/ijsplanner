import { derived } from 'svelte/store';
import { session } from './session';

export const user = derived(session, ($s) => $s?.user ?? null);
