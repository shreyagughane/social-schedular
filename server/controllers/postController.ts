import {Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {cloudinary} from "../config/cloudinary.js";
import { Generation } from "../models/Generation.js";
import { Post } from "../models/Post.js";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const generateImage = (prompt: string) => {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}`;
};


// ======================================================
// 1️⃣ GENERATE POST
// POST /api/posts/generate
// ======================================================
export const generatePost = async (req: AuthRequest, res: Response):Promise<void> => {
  try {
    const { prompt, tone,generateImage: shouldGenerateImage} = req.body;
    const apiKey =process.env.GEMINI_API_KEY;
    if(!apiKey){
      res.status(400).json({message:"Gemini API key is missing.Please add it to your server/.env fileURLToPath."});
      return;
    }

    const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const result = await model.generateContent(`
Generate a social media post based on this prompt: "${prompt}".

Tone: ${tone}

Include relevant hashtags.

Return the response as JSON with this format:
{
  "content": "...",
  "imagePrompt": "..."
}
`);

const textResponse = result.response;

    
    let content="";
    let imagePrompt=prompt;
    try {
  const rawText = textResponse.text() || "";

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);

  const data = jsonMatch
    ? JSON.parse(jsonMatch[0])
    : {
        content: rawText,
        imagePrompt: prompt,
      };

  content = data.content;
  imagePrompt = data.imagePrompt;

} catch (e) {
  content = textResponse.text();
  imagePrompt = prompt;
}
let mediaUrl = "";

if (shouldGenerateImage) {
  try {
    const tempUrl = generateImage(imagePrompt);

    const uploadResult = await cloudinary.uploader.upload(tempUrl, {
      folder: "ai-generations",
    });

    mediaUrl = uploadResult.secure_url;
  } catch (err: any) {
    console.error("Image generation failed:", err);
  }
}

//save generation to DB
const generation =await Generation.create({
  user:req.user._id,
  prompt,
  content,
  mediaUrl,
  mediaType:mediaUrl?"image":undefined,
  tone
})
res.json(generation)
  } catch (error: any) {
     res.status(500).json({
      message:error?.message || "server error"
    });
  }
}



// ======================================================
// 2️⃣ GET GENERATIONS (HISTORY)
// GET /api/posts/generations
// ======================================================
export const getGenerations = async (req: AuthRequest, res: Response):Promise<void>=> {
  try{
    const generations =await Generation.find({user:req.user._id}).sort({createdAt: -1})
    res.json(generations)
  }catch(error:any){
    res.status(500).json({message:error?.message || "server error"});

  }
}



// ======================================================
// 3️⃣ GET POSTS
// GET /api/posts
// ======================================================
export const getPosts = async (req: AuthRequest, res: Response):Promise<void>=> {
  try {
    const posts =await Post.find({user:req.user._id})
    res.json(posts)
  } catch (error: any) {
     res.status(500).json({message:error?.message || "server error"});
  }
}



// ======================================================
// 4️⃣ SCHEDULE POST
// POST /api/posts
// ======================================================
export const schedulePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, platforms, scheduledFor,status} = req.body;

   // Parse platforms if it comes as a stringified array from FormData
let parsedPlatforms = platforms;

if (typeof platforms === "string") {
  try {
    parsedPlatforms = JSON.parse(platforms);
  } catch (e) {
    parsedPlatforms = platforms.split(",");
  }
}

let mediaUrl: string | undefined = req.body.mediaUrl;
let mediaType: "image" | "video" | undefined = req.body.mediaType;

if (req.file) {
  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "social-scheduler",
        resource_type: "auto",
      },(error,result)=>{
        if(error) reject(error);
        else resolve(result)
      });
      stream.end(req.file!.buffer);
    });
    mediaUrl=result.secure_urll;
    mediaType=result.resource_type==="video" ? "video":"image";
  }
  const post=await Post.create({
    user:req.user._id,
    content,
    platforms:parsedPlatforms,
    mediaUrl,
    mediaType,
    scheduledFor,
    status,
  })
  res.status(201).json(post)
  } catch (error: any) {
     res.status(500).json({message:error?.message || "server error"});
  }
}