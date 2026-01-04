import { fetchNews } from "./newsService.js";
import { analyzeText } from "./sentiment.js";
import { deleteAllArticles, duplicateCheck, saveToSupabase } from "./output.js";
import { generateContent } from "./claudeApi.js";
import translate from "google-translate-api-next";

(async function main() {
  const targetCountries = [
    { name: "India", code: "in", lang: "hi", langName: "hindi" }, // Asia #1
    { name: "Nigeria", code: "ng", lang: "en", langName: "english" }, // Africa #1
    { name: "Russia", code: "ru", lang: "ru", langName: "russian" }, // Europe #1
    { name: "USA", code: "us", lang: "en", langName: "english" }, // N. America #1
    { name: "Brazil", code: "br", lang: "pt", langName: "portuguese" }, // S. America #1
  ];
  const MAX_REQ_PER_COUNTRY = 2; // 40 pages max per day
  let globalRequestCount = 0;

  for (const country of targetCountries) {
    try {
      let nextCursor = null;
      let countryRequests = 0;

      while (countryRequests < MAX_REQ_PER_COUNTRY) {
        const data = await fetchNews(country.code, country.lang, nextCursor);
        const articles = data.results || [];
        nextCursor = data.nextPage;

        if (globalRequestCount > 0 && globalRequestCount % 30 === 0) {
          console.log(
            "Rate limit reached (30/15mins). Sleeping for 15 minutes..."
          );
          await new Promise((r) => setTimeout(r, 15 * 60 * 1000 + 1000));
        }

        for (const art of articles) {
          if (country.lang !== "en") {
            try {
              art.title = (await translate(art.title, { to: "en" })).text;
              art.description = (
                await translate(art.description, { to: "en" })
              ).text;
            } catch (error) {
              console.error("Translation failed.");
            }
          }
          const text = `${art.title || ""} ${art.description || ""}`.trim();
          const analysis = analyzeText(text);
          if (
            analysis.label === "positive" &&
            (await duplicateCheck(art.link)).length === 0
          ) {
            art.content = await generateContent(
              art.title,
              art.source_name,
              country.langName
            );

            const regex = /(cannot|unable to)\s+(find|locate)/i;

            if (regex.test(art.content)) {
              continue;
            }
            art["publishedat"] = art.pubDate;
            saveToSupabase({ ...art, ...analysis });
          }
          countryRequests++;
          globalRequestCount++;

          if (!nextCursor) {
            break;
          }
        }
      }
    } catch (error) {
      if (
        error.message.includes("RateLimitExceeded") ||
        error.message.includes("TooManyRequests")
      ) {
        console.error("Too many requests. Forcing 15 min cooldown...");
        await new Promise((r) => setTimeout(r, 15 * 60 * 1000));
      } else {
        console.error("API Error:", error.message);
        break;
      }
    }
  }
})();
