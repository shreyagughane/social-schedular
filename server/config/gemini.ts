import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const generateCaption = async (prompt: string) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    
  });

  const result = await model.generateContent(
    `Write a social media post with hashtags based on this: ${prompt}`
  );

  const response = await result.response;
  return response.text();
};