import { fetchNews } from "./newsService.js";
import { analyzeText } from "./sentiment.js";
import saveToSupabase from "./output.js";
import { generateContent } from "./claudeApi.js";

(async function main() {
  try {
    const data = await fetchNews({ pageSize: process.env.PAGE_SIZE });
    const articles = data.articles || [];

    for (const art of articles) {
      const text = `${art.title || ""} ${art.description || ""} ${
        art.content || ""
      }`.trim();
      const analysis = analyzeText(text);
      if (analysis.label === "positive") {
        art.content = await generateContent(art.title);
        const regex = /(cannot|unable to)\s+(find|locate)/i

        if(regex.test(art.content)){
          continue;
        }
        delete art.source;
        art["publishedat"] = art.publishedAt;
        art["urltoimage"] = art.urlToImage;
        delete art.urlToImage;
        delete art.publishedAt;

        saveToSupabase({ ...art, ...analysis });
      }
    }
  } catch (err) {
    console.error("Error:", err);
    process.exitCode = 1;
  }
})();
