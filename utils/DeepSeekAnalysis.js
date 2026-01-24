import Constants from 'expo-constants';
import axios from "axios";
import { API_BASE_URL } from './apiConfig';

const deepSeekKey = Constants.expoConfig?.extra?.deepSeekApiKey;
const modelId = "deepseek/deepseek-r1-0528:free";

export async function deepSeekRecommendation(product) {
  const productToString = JSON.stringify(product, null, 2);

  const prompt = `
You are an expert Environmental Impact Analyst. 
Given the following structured product data: ${productToString}, 
generate one short, clean, and factual paragraph (max 50 words, no titles, no bullet points, no line breaks, no styling, no numbering of points). 
Include accurate disposal tips (recyclable, compostable, etc.) and 
suggest 2 real-world eco-friendly alternatives with justifications.
`;


  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: modelId,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepSeekKey}`,
          "HTTP-Referer": "https://green-iq.app", // Optional, for OpenRouter rankings
          "X-Title": "Green IQ", // Optional, for OpenRouter rankings
        },
        timeout: 15000, // 15 second timeout
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response format from DeepSeek API');
    }
  } catch (error) {
    console.log('DeepSeek API error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });

    // Return user-friendly fallback message instead of throwing
    if (error.message?.includes('timeout')) {
      return "Environmental analysis is taking longer than expected. This product should be disposed of according to local recycling guidelines. Consider choosing products with minimal packaging and recyclable materials.";
    } else if (error.message?.includes('Network')) {
      return "Unable to connect to analysis service. Please check your internet connection. In general, reduce waste by choosing reusable products and recycling when possible.";
    } else if (error.response?.status === 429) {
      return "Analysis service is busy. This item can likely be recycled - check your local recycling guidelines. Choose products made from sustainable materials when possible.";
    } else {
      return "Detailed environmental analysis is temporarily unavailable. Follow the 3 R's: Reduce consumption, Reuse items when possible, and Recycle according to local guidelines.";
    }
  }
}
