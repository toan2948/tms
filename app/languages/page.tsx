import { createClient } from "@/utils/supabase/server";

export default async function Instruments() {
  const supabase = await createClient();
  const { data: languages } = await supabase.from("language").select("*");

  return <pre>{JSON.stringify(languages, null, 2)}</pre>;
}
