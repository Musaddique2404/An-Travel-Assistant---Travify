/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import { Input } from "@/components/ui/input";
import React, { useContext, useEffect, useState, useRef } from "react";
import {
  PROMPT,
  SelectBudgetOptions,
  SelectNoOfPersons,
} from "../../constants/Options";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { chatSession } from "@/Service/AiModel";

import { LogInContext } from "@/Context/LogInContext/Login";

import { db } from "@/Service/Firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { getPlaceDetails } from "@/Service/globalApi";

function CreateTrip() {
  const [place, setPlace] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { user, loginWithPopup, isAuthenticated } =
    useContext(LogInContext);

  const debounceRef = useRef(null);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const SignIn = async () => {
    loginWithPopup();
  };

  const SaveUser = async () => {
    const User = JSON.parse(localStorage.getItem("User"));
    if (!User?.email) return;

    await setDoc(doc(db, "Users", User.email), {
      userName: User?.name,
      userEmail: User?.email,
      userPicture: User?.picture,
      userNickname: User?.nickname,
    });
  };

  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem("User", JSON.stringify(user));
      SaveUser();
    }
  }, [user]);

  const SaveTrip = async (TripData) => {
    const User = JSON.parse(localStorage.getItem("User"));
    const id = Date.now().toString();

    setIsLoading(true);
    await setDoc(doc(db, "Trips", id), {
      tripId: id,
      userSelection: formData,
      tripData: TripData,
      userName: User?.name,
      userEmail: User?.email,
    });
    setIsLoading(false);
    localStorage.setItem("Trip", JSON.stringify(TripData));
    navigate("/my-trips/" + id);
  };

  // 🔹 FETCH AUTOCOMPLETE SUGGESTIONS
  const fetchPlaceSuggestions = (value) => {
    setPlace(value);
    handleInputChange("location", value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!value) {
        setSuggestions([]);
        return;
      }

      try {
        const requestData = {
          query: value,
          pageSize: 5, // limit suggestions
        };

        const response = await getPlaceDetails(requestData);
        const places = response.data?.places || [];
        setSuggestions(places);
      } catch (error) {
        console.error("Places API error:", error);
      }
    }, 300);
  };

  const generateTrip = async () => {
    if (!isAuthenticated) {
      toast("Sign In to continue", { icon: "⚠️" });
      return setIsDialogOpen(true);
    }

    if (
      !formData?.noOfDays ||
      !formData?.location ||
      !formData?.People ||
      !formData?.Budget
    ) {
      return toast.error("Please fill out every field.");
    }

    if (formData.noOfDays > 5)
      return toast.error("Trip days must be less than 5");
    if (formData.noOfDays < 1) return toast.error("Invalid number of days");

    const FINAL_PROMPT = PROMPT.replace(/{location}/g, formData.location)
      .replace(/{noOfDays}/g, formData.noOfDays)
      .replace(/{People}/g, formData.People)
      .replace(/{Budget}/g, formData.Budget);

    try {
      const toastId = toast.loading("Generating Trip ✈️");
      setIsLoading(true);

      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const trip = JSON.parse(result.response.text());

      setIsLoading(false);
      SaveTrip(trip);
      toast.dismiss(toastId);
      toast.success("Trip Generated Successfully");
    } catch (error) {
      setIsLoading(false);
      toast.dismiss();
      toast.error("Failed to generate trip");
      console.error(error);
    }
  };

  return (
    <div className="mt-10">
      <div className="text text-center md:text-left">
        <h2 className="text-2xl md:text-4xl font-bold">
          Share Your Travel Preferences 🌟🚀
        </h2>
        <p className="text-sm text-gray-600 font-medium mt-3">
          Help us craft your perfect adventure with just a few details.
        </p>
      </div>

      <div className="form mt-10 flex flex-col gap-10 md:gap-20">
        {/* LOCATION */}
        <div className="place">
          <h2 className="font-semibold mb-3">
            Where do you want to Explore? 🏖️
          </h2>

          <div className="relative">
            <Input
              placeholder="Search destination"
              value={place}
              onChange={(e) => fetchPlaceSuggestions(e.target.value)}
            />

            {suggestions.length > 0 && (
              <ul className="absolute z-50 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
                {suggestions.map((item, index) => (
                  <li
                    key={index}
                    className="p-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      const text = item.displayName || item.name;
                      setPlace(text);
                      handleInputChange("location", text);
                      setSuggestions([]);
                    }}
                  >
                    {item.displayName || item.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* DAYS */}
        <div className="day">
          <h2 className="font-semibold mb-3">How long is your Trip? 🕜</h2>
          <Input
            type="number"
            placeholder="Ex: 2"
            onChange={(e) =>
              handleInputChange("noOfDays", e.target.value)
            }
          />
        </div>

        {/* BUDGET */}
        <div className="budget">
          <h2 className="font-semibold mb-3">What is your Budget? 💳</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SelectBudgetOptions.map((item) => (
              <div
                key={item.id}
                onClick={() => handleInputChange("Budget", item.title)}
                className={`p-4 h-32 border rounded-lg cursor-pointer hover:scale-105 transition ${
                  formData.Budget === item.title ? "border-black shadow-xl" : ""
                }`}
              >
                <h3 className="font-bold">
                  {item.icon} {item.title}
                </h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PEOPLE */}
        <div className="people">
          <h2 className="font-semibold mb-3">Who are you traveling with? 🚗</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SelectNoOfPersons.map((item) => (
              <div
                key={item.id}
                onClick={() => handleInputChange("People", item.no)}
                className={`p-4 h-32 border rounded-lg cursor-pointer hover:scale-105 transition ${
                  formData.People === item.no ? "border-black shadow-xl" : ""
                }`}
              >
                <h3 className="font-bold">
                  {item.icon} {item.title}
                </h3>
                <p className="text-gray-500">{item.desc}</p>
                <p className="text-sm text-gray-400">{item.no}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <div className="flex justify-center mt-10">
        <Button disabled={isLoading} onClick={generateTrip}>
          {isLoading ? (
            <AiOutlineLoading3Quarters className="animate-spin h-6 w-6" />
          ) : (
            "Plan A Trip"
          )}
        </Button>
      </div>

      {/* LOGIN DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {user ? "Logged In" : "Sign In to Continue"}
            </DialogTitle>
            <DialogDescription>
              {!user && (
                <Button
                  onClick={SignIn}
                  className="w-full mt-5 flex gap-2"
                >
                  Sign In with <FcGoogle />
                </Button>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateTrip;
