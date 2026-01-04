import express from "express";
import supabase from "../supabaseClient.js";
import cors from "cors";
import { generateChat } from "../claudeApi.js";
const app = express();
const port = 3000;

app.use(cors());

app.get("/api", async (req, res) => {
  const { data, error } = await supabase
    .from("articles")
    .select(
      "creator, title, image_url, publishedat, description, article_id, country, category"
    )
    .order("publishedat", { ascending: false });
  if (error) {
    res.status(400).send({ error: error.message });
  }
  res.send(data);
});

app.get("/api/article", async (req, res) => {
  const article_id = req.query.article_id;
  const { data, error } = await supabase
    .from("articles")
    .select("creator, title, image_url, publishedat, content, url, country")
    .eq("article_id", article_id)
    .single();
  if (error) {
    res.status(400).send({ error: error.message });
  }
  res.send(data);
});

app.get("/api/chat", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.status(200);
  const article_id = req.query.article_id;
  const userPrompt = req.query.userPrompt;

  const { data, error } = await supabase
    .from("articles")
    .select("content")
    .eq("article_id", article_id)
    .single();
  if (error) {
    res.status(400).send({ error: error.message });
  }

  const response = await generateChat(
    res,
    { role: "assistant", content: data.content },
    userPrompt
  );

  res.send({ role: "assistant", content: response });
});

export default app;
