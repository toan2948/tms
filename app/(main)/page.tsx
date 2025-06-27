import TranslationPage from "@/components/TranslationManagerSystem";
import { fetchTranslationKeysByFilenameAndLanguage } from "@/utils/languages/dataFunctions";
import { buildKeyTreeFromFlatList } from "@/utils/languages/processData";
import React from "react";

async function HomePage() {
  const keys = await fetchTranslationKeysByFilenameAndLanguage("common", "en");
  const treeKeys = buildKeyTreeFromFlatList(keys);
  console.log("treeKeys:", treeKeys);

  return (
    <div>
      <TranslationPage data={treeKeys} />
    </div>
  );
}

export default HomePage;
