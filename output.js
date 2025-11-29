import supabase from "./supabaseClient.js";

const saveToSupabase = async (article) => {
  const { data, error } = await supabase.from("articles").insert(article);

  if (error) {
    console.error("Error inserting data:", error.message);
  }
};

export default saveToSupabase;
