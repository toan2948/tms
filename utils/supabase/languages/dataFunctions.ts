import { createClient } from "@/utils/supabase/server";

export async function Instruments() {
  const supabase = await createClient();
  const { data: languages } = await supabase.from("languages").select("*");

  return JSON.stringify(languages, null, 2);
}
export async function TreeData() {
  const supabase = await createClient();
  const { data } = await supabase.from("EN_kv").select("*");

  return JSON.stringify(data, null, 2);
}
