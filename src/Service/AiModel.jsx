/* eslint-disable no-unused-vars */
import { GoogleGenerativeAI } from "@google/generative-ai";

// Import your JSON data from src/Service
import tripData from "../Service/temp.json"; // adjust relative path if needed

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Use a valid model name
const model = genAI.getGenerativeModel({
  model: "gemini-1.5",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export const chatSession = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [
        {
          text: `Create an optimal trip itinerary based on the following data: ${JSON.stringify(
            tripData
          )}. Generate hotels, itinerary, places, pricing, timings, and images. Return the result in JSON format.`,
        },
      ],
    },
  ],
});

