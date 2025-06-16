import TranslationPage from "@/components/TranslationManagerSystem";
import { convertToNestedObjects2 } from "@/utils/languages/dataFunctions";
import { createClient } from "@/utils/supabase/server";
import React from "react";

async function HomePage() {
  const supabase = await createClient();
  const data = await supabase
    .from("EN_kv")
    .select("value, full_path")
    .then((response) =>
      response.data?.map((item) => ({
        key: item.full_path as string, // Alias full_path as key
        value: item.value as string,
      }))
    );

  const treeData = convertToNestedObjects2(data || []);
  console.log("Data from EN_kv 3:", treeData);

  return (
    <div>
      <TranslationPage data={treeData} />
    </div>
  );
}

export default HomePage;
