export const generateImage = (prompt: string) => {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}`;
};