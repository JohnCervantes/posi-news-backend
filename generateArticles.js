import { fetchNews } from "./newsService.js";
import { analyzeText } from "./sentiment.js";
import { deleteAllArticles, duplicateCheck, saveToSupabase } from "./output.js";
import { generateContent } from "./claudeApi.js";
import translate from "google-translate-api-next";

(async function main() {
  const targetCountries = [
    { name: "Vietnam", code: "vn", lang: "vi", langName: "Vietnamese" },
    { name: "Costa Rica", code: "cr", lang: "es", langName: "Spanish" },
    { name: "UAE", code: "ae", lang: "ar", langName: "Arabic" },
    { name: "Turkey", code: "tr", lang: "tr", langName: "Turkish" },
    { name: "Colombia", code: "co", lang: "es", langName: "Spanish" },
    { name: "USA", code: "us", lang: "en", langName: "English" },
    { name: "India", code: "in", lang: "hi", langName: "hindi" },
    { name: "Nigeria", code: "ng", lang: "en", langName: "English" },
  ];
  const MAX_REQ_PER_COUNTRY = 10; // 40 pages max per day
  let globalRequestCount = 0;

  for (const country of targetCountries) {
    let nextCursor = null;
    let countryRequests = 0;

    while (countryRequests < MAX_REQ_PER_COUNTRY) {
      await new Promise((resolve) => setTimeout(resolve, 1 * 60 * 1000));
      let data;
      try {
        console.log("fetching articles... " + country.name);
        data = await fetchNews(country.code, country.lang, nextCursor);
      } catch (error) {
        console.error(error.message);
        if (
          error.message.includes("RateLimitExceeded") ||
          error.message.includes("TooManyRequests")
        ) {
          console.error("Too many requests. Forcing 16 min cooldown...");
          await new Promise((r) => setTimeout(r, 16 * 60 * 1000));
          continue;
        } else {
          console.error("API Error:", error.message);
          continue;
        }
      }
      const articles = data.results || [];
      nextCursor = data.nextPage;
      countryRequests++;

      // if (globalRequestCount > 0 && globalRequestCount % 30 === 0) {
      //   console.log(
      //     "Rate limit reached (30/15mins). Sleeping for 15 minutes..."
      //   );
      //   await new Promise((r) => setTimeout(r, 15 * 60 * 1000 + 1000));
      // }

      for (const art of articles) {
        if (country.lang !== "en") {
          try {
            art.title = (await translate(art.title, { to: "en" })).text;
            await new Promise((r) => setTimeout(r, 500));
            art.description = (
              await translate(art.description, { to: "en" })
            ).text;
          } catch (error) {
            console.error("Translation failed.");
          }
        }
        const text = `${art.title || ""} ${art.description || ""}`.trim();
        const analysis = analyzeText(text, country.name);
        if (
          analysis.label === "positive" &&
          (await duplicateCheck(art.link)).length === 0
        ) {
          console.log("uplifting article found");
          art.content = await generateContent(
            art.title,
            art.source_name,
            country.langName
          );
          const ban = [
            "2026",
            "Aries",
            "Taurus",
            "Gemini",
            "Cancer",
            "Leo",
            "Virgo",
            "Libra",
            "Scorpio",
            "Sagittarius",
            "Capricorn",
            "Aquarius",
            "Pisces",
            "astrology"
          ];

          const hasMatch = ban.some((substring) =>
            art.title.toLowerCase().includes(substring.toLowerCase())
          );
          if (hasMatch) {
            continue;
          }

          const regex =
            /(cannot|unable to|ability to|don't have)\s+(find|locate|access|search)/i;

          if (regex.test(art.content)) {
            continue;
          }
          art["publishedat"] = art.pubDate;
          console.log("Saving to DB...");
          saveToSupabase({ ...art, ...analysis });
        }
        countryRequests++;
        globalRequestCount++;

        if (!nextCursor) {
          break;
        }
      }
    }
  }
})();
