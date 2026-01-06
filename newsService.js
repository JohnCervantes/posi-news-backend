const positiveQueries = {
  en: '(positive OR uplifting OR inspiring OR "good news" OR heartwarming OR hopeful OR success OR growth)',
  hi: '(सकारात्मक OR प्रेरणादायक OR उत्साहवर्धक OR "अच्छी खबर" OR आशाजनक OR प्रगति OR सफलता)',
  zh: '(正面 OR 励志 OR 鼓舞人心 OR "正能量" OR "好消息" OR 温馨 OR 成功)',
  id: '(positif OR inspiratif OR "berita baik" OR menyentuh OR "kabar baik" OR penuh harapan OR sukses)',
  ur: '(مثبت OR متاثر کن OR "اچھی خبر" OR پرامید OR خوش آئند OR کامیابی)',
  tr: '(olumlu OR ilham verici OR "iyi haber" OR umut verici OR başarı OR gelişme OR sevindirici)', // तुर्की
  vi: '(tích cực OR truyền cảm hứng OR "tin tốt" OR hy vọng OR thành công OR phát triển)', // वियतनामी
  es: '(positivo OR inspirador OR "buenas noticias" OR alentador OR esperanza OR éxito OR crecimiento)', // स्पेनिश (Costa Rica/Colombia)
};

const categories = "science,technology,health,lifestyle,education";

export async function fetchNews(country, language, nextCursor) {
  if (!process.env.NEWSAPI_KEY)
    throw new Error("NEWSAPI_KEY not set in environment (set in .env)");

  const params = new URLSearchParams({
    apikey: process.env.NEWSAPI_KEY,
    q: positiveQueries[language],
    country: country,
    language: language,
    removeduplicate: 1,
    category: categories,
    //sort: relevancy
  });

  if (nextCursor) {
    params.page = nextCursor;
  }
  const url = `https://newsdata.io/api/1/latest?${params.toString()}`;

  const res = await fetch(url, {
    headers: { "X-Api-Key": process.env.NEWSAPI_KEY },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NewsAPI error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data;
}
