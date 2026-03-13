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
export const donations: FoodDonation[] = [];

let nextId = 1;

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
