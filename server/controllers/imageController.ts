import { Request, Response } from "express";

export const generateImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({
        message: "Prompt is required",
      });
      return;
    }

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}`;

    res.json({
      success: true,
      imageUrl,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Server Error",
    });
  }
};