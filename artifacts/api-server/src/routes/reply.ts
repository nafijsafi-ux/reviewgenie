import { Router, type IRouter } from "express";
import Groq from "groq-sdk";
import { GenerateReplyBody, DetectSentimentBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TONE_DESCRIPTIONS: Record<string, string> = {
  Apologetic: "sincerely apologetic, empathetic and focused on making things right",
  Grateful: "warm, appreciative and thankful for the customer's feedback",
  Professional: "professional, balanced and courteous",
  Friendly: "friendly, personable and conversational",
  Formal: "formal, polished and respectful",
};

router.post("/replies/generate", async (req, res): Promise<void> => {
  const parsed = GenerateReplyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { reviewText, tone, businessName, platform, starRating } = parsed.data;
  const toneDesc = TONE_DESCRIPTIONS[tone] ?? "professional";
  const bizContext = businessName ? `for ${businessName}` : "";
  const platformContext = platform ? ` posted on ${platform}` : "";
  const ratingContext = starRating ? ` (${starRating}-star rating)` : "";

  const systemPrompt = `You are an expert business review responder. Write a concise, genuine reply from a business owner/manager responding to a customer review. Be ${toneDesc}. Keep the reply under 120 words. Do not use placeholders like [Your Name]. Sign off with the business name if provided. Never be defensive or sarcastic.`;

  const userPrompt = `Write a reply to this customer review${bizContext}${platformContext}${ratingContext}:

"${reviewText}"

Tone: ${tone}
${businessName ? `Business: ${businessName}` : ""}

Reply:`;

  try {
    req.log.info({ tone, platform }, "Generating reply");
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "";

    const sentimentResult = await detectSentimentFromText(reviewText);

    res.json({
      reply,
      tone,
      sentiment: sentimentResult.sentiment,
      starRating: starRating ?? sentimentResult.starRating,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate reply");
    res.status(500).json({ error: "Failed to generate reply. Please try again." });
  }
});

router.post("/replies/detect-sentiment", async (req, res): Promise<void> => {
  const parsed = DetectSentimentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { reviewText } = parsed.data;

  try {
    req.log.info("Detecting sentiment");
    const result = await detectSentimentFromText(reviewText);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to detect sentiment");
    res.status(500).json({ error: "Failed to detect sentiment. Please try again." });
  }
});

async function detectSentimentFromText(reviewText: string): Promise<{
  sentiment: "positive" | "neutral" | "negative";
  suggestedTone: "Apologetic" | "Grateful" | "Professional" | "Friendly" | "Formal";
  starRating: number;
}> {
  const systemPrompt = `You are a sentiment analysis expert. Analyze the customer review and respond ONLY with valid JSON in this exact format:
{"sentiment": "positive"|"neutral"|"negative", "suggestedTone": "Apologetic"|"Grateful"|"Professional"|"Friendly"|"Formal", "starRating": 1-5}

Rules:
- sentiment: positive (happy, satisfied, praising), neutral (mixed/average), negative (unhappy, complaining, angry)
- suggestedTone: Apologetic for negative, Grateful for positive, Professional/Friendly/Formal for neutral or mixed
- starRating: estimate 1-5 stars based on content (5=very positive, 1=very negative)`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Analyze this review: "${reviewText}"` },
    ],
    max_tokens: 100,
    temperature: 0.1,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
  try {
    const jsonMatch = raw.match(/\{[^}]+\}/);
    const parsed = JSON.parse(jsonMatch?.[0] ?? raw);
    const sentiment = ["positive", "neutral", "negative"].includes(parsed.sentiment)
      ? parsed.sentiment
      : "neutral";
    const suggestedTone = ["Apologetic", "Grateful", "Professional", "Friendly", "Formal"].includes(parsed.suggestedTone)
      ? parsed.suggestedTone
      : "Professional";
    const starRating = Math.min(5, Math.max(1, Math.round(Number(parsed.starRating) || 3)));
    return { sentiment, suggestedTone, starRating };
  } catch {
    logger.warn({ raw }, "Failed to parse sentiment JSON, using defaults");
    return { sentiment: "neutral", suggestedTone: "Professional", starRating: 3 };
  }
}

export default router;
