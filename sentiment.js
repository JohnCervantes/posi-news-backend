import vader from "vader-sentiment";

export function analyzeText(text, country) {
  let threshold;
  if (country === "Colombia") {
    threshold = 0.25;
  } else if (country === "Turkey") {
    threshold = 0.1;
  } else if (country === "Vietnam") {
    threshold = 0.1;
  } else if (country === "UAE") {
    threshold = 0.3;
  } else {
    threshold = process.env.VADER_THRESHOLD;
  }

  const input = String(text || "");
  const scores = vader.SentimentIntensityAnalyzer.polarity_scores(input);
  const compound = scores.compound;
  let label = "neutral";
  if (compound >= threshold) label = "positive";
  else if (compound <= -threshold) label = "negative";
  return { label, score: compound };
}
