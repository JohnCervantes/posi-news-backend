import express from "express";
import supabase from "./supabaseClient.js";
import cors from 'cors';
const app = express();
const port = 3000;

app.use(cors());

app.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("articles")
    .select("author, title, urltoimage, publishedat, description")
    .order("publishedat", { ascending: false });
  if (error) {
    res.status(400).send({ error: error.message });
  }
  res.send(data);
});

app.get("/article", async (req, res) => {
  const article_id = req.query.article_id;
  const { data, error } = await supabase
    .from("articles")
    .select("author, title, urltoimage, publishedat, content")
    .eq("article_id", article_id).single();
  if (error) {
    res.status(400).send({ error: error.message });
  }
  res.send(data);
});

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});
