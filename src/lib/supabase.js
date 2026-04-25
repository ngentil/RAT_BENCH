import { createClient } from '@supabase/supabase-js';

const SUPA_URL = "https://aovqyeowrwlctrcqptdj.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdnF5ZW93cndsY3RyY3FwdGRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NTM5MzQsImV4cCI6MjA5MTEyOTkzNH0.ctVQPI-Sm8PTzHAyDciwGDzj3x-fm29F9jrBHj5NLIk";

export const supabase = createClient(SUPA_URL, SUPA_KEY);
