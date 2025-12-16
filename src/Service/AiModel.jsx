/* eslint-disable no-unused-vars */
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Updated model name to a valid one
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
          text: "Create an optimal trip itinerary based on the specified location, duration, budget, and number of persons. Generate Travel Plan for Location: {Bhopal} for no of days: {3} Days with no of People or group: {4-5} with Budget: {Luxury}; give me list of hotels with hotel name, description, address, rating, price, location in map, coordinates, image url; also for the same create the itinerary for {4-5} days, suggest places, give name, details, pricing, timings, place images urls, location (coordinate or in map); Remember all have to cover in the {Luxury} level budget. Important: give the result in JSON Format",
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: '```json\n{\n  "location": "Bhopal",\n  "duration": 3,\n  "budget": "Luxury",\n  "people": 4,\n  "hotels": [\n    {\n      "name": "Jehan Numa Palace Hotel",\n      "description": "A heritage hotel with opulent rooms, a sprawling garden, and a rooftop pool offering panoramic views of the city.",\n      "address": "1, Shamla Hills, Near Van Vihar National Park, Bhopal, Madhya Pradesh 462003",\n      "rating": 4.5,\n      "price": "₹15,000 - ₹30,000 per night",\n      "location": "https://goo.gl/maps/j12Q3Z5g5aL9R7T9",\n      "coordinates": "23.2594, 77.4096",\n      "image_url": "https://images.thrillophilia.com/image/upload/s--7i8t9L4h--/c_fill,f_auto,fl_progressive,h_600,q_auto,w_900/v1/images/photos/000/009/817/original/jehan_numa_palace_hotel_bh_]()
