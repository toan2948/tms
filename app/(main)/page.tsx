import TranslationPage from "@/components/TranslationManagerSystem";
import {
  fetchTranslationKeysByFileId,
  getTreeDataKey,
} from "@/utils/languages/dataFunctions";
import React from "react";

async function HomePage() {
  const treeData = await getTreeDataKey();
  const keys = await fetchTranslationKeysByFileId("common", "en");
  console.log("Homepage Treedata:", treeData);
  console.log("keys:", keys);

  return (
    <div>
      <TranslationPage data={treeData} />
    </div>
  );
}

export default HomePage;
