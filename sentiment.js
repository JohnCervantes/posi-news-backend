import vader from 'vader-sentiment';

export function analyzeText(text, threshold = process.env.VADER_THRESHOLD) {
  const input = String(text || '');
  const scores = vader.SentimentIntensityAnalyzer.polarity_scores(input);
  const compound = scores.compound;
  let label = 'neutral';
  if (compound >= threshold) label = 'positive';
  else if (compound <= -threshold) label = 'negative';
  return { label, score: compound };
}
