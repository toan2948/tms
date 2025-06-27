import TranslationPage from "@/components/TranslationManagerSystem";
import { getTreeDataKey } from "@/utils/languages/dataFunctions";
import React from "react";

async function HomePage() {
  const treeData = await getTreeDataKey();

  console.log("Data from EN_kv 3:", treeData);

  return (
    <div>
      <TranslationPage data={treeData} />
    </div>
  );
}

export default HomePage;
