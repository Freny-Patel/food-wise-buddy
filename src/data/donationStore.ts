export interface FoodDonation {
  id: string;
  restaurantName: string;
  restaurantEmail: string;
  foodItem: string;
  quantity: number;
  unit: string;
  location: string;
  pickupTime: string;
  postedAt: string;
  status: "available" | "claimed" | "picked_up";
  claimedBy?: string;
  claimedByName?: string;
}

// Shared in-memory store
export const donations: FoodDonation[] = [
  {
    id: "1",
    restaurantName: "Green Kitchen",
    restaurantEmail: "restaurant@test.com",
    foodItem: "Cooked Rice",
    quantity: 15,
    unit: "kg",
    location: "MG Road, Bangalore",
    pickupTime: "2026-03-09 18:00",
    postedAt: "2026-03-09 16:30",
    status: "available",
  },
  {
    id: "2",
    restaurantName: "Green Kitchen",
    restaurantEmail: "restaurant@test.com",
    foodItem: "Vegetable Curry",
    quantity: 8,
    unit: "kg",
    location: "MG Road, Bangalore",
    pickupTime: "2026-03-09 19:00",
    postedAt: "2026-03-09 16:45",
    status: "available",
  },
  {
    id: "3",
    restaurantName: "Spice Garden",
    restaurantEmail: "spice@test.com",
    foodItem: "Bread Rolls",
    quantity: 50,
    unit: "pieces",
    location: "Koramangala, Bangalore",
    pickupTime: "2026-03-09 20:00",
    postedAt: "2026-03-09 17:00",
    status: "available",
  },
];

let nextId = 4;

export const addDonation = (donation: Omit<FoodDonation, "id" | "status" | "postedAt">) => {
  const newDonation: FoodDonation = {
    ...donation,
    id: String(nextId++),
    status: "available",
    postedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
  };
  donations.unshift(newDonation);
  return newDonation;
};

export const claimDonation = (id: string, volunteerEmail: string, volunteerName: string) => {
  const donation = donations.find((d) => d.id === id);
  if (donation && donation.status === "available") {
    donation.status = "claimed";
    donation.claimedBy = volunteerEmail;
    donation.claimedByName = volunteerName;
    return true;
  }
  return false;
};

export const markPickedUp = (id: string) => {
  const donation = donations.find((d) => d.id === id);
  if (donation && donation.status === "claimed") {
    donation.status = "picked_up";
    return true;
  }
  return false;
};
