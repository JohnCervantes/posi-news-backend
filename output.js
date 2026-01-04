import supabase from "./supabaseClient.js";

export const deleteAllArticles = async () => {
  const { data, error } = await supabase
    .from("articles")
    .delete()
    .neq("article_id", 0);

  if (error) {
    console.error("Error inserting data:", error.message);
  }
};

export const duplicateCheck = async (link) => {
  const { data, error } = await supabase
    .from("articles")
    .select("article_id")
    .eq("url", link);
  if (!error) {
    return data;
  }
};

export const saveToSupabase = async (article) => {
  const {
    title,
    link,
    description,
    content,
    country,
    pubdate,
    image_url,
    creator,
    label,
    score,
    publishedat,
    category,
  } = article;
  const { data, error } = await supabase.from("articles").upsert({
    image_url,
    pubdate,
    url: link,
    label,
    score,
    creator: creator && creator[0],
    content,
    country: country && country[0],
    title,
    description,
    publishedat,
    category,
  });

  if (error) {
    console.error("Error inserting data:", error.message);
  }
};
