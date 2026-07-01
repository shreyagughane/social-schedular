import { model } from "../config/gemini.js";
import { Generation } from "../models/Generation.js";
export const generatePost = async (req, res) => {
    try {
        const { prompt, tone } = req.body;
        const result = await model.generateContent(`
Write an engaging social media post.

Topic: ${prompt}
Tone: ${tone}

Include:
- A catchy caption
- Relevant emojis
- 5-10 hashtags
`);
        const caption = result.response.text();
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
        const generation = await Generation.create({
            user: req.user._id,
            prompt,
            content: caption,
            mediaUrl: imageUrl,
            mediaType: "image",
            tone,
        });
        res.status(201).json(generation);
    }
    catch (error) {
        res.status(500).json({
            message: error?.message || "Server error",
        });
    }
};
