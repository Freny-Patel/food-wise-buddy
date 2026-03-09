export interface FoodRecord {
  date: string;
  food_item: string;
  prepared: number;
  wasted: number;
}

export const foodData: FoodRecord[] = [
  { date: "2026-03-01", food_item: "Rice", prepared: 50, wasted: 8 },
  { date: "2026-03-01", food_item: "Bread", prepared: 30, wasted: 12 },
  { date: "2026-03-02", food_item: "Rice", prepared: 45, wasted: 5 },
  { date: "2026-03-02", food_item: "Vegetables", prepared: 40, wasted: 10 },
  { date: "2026-03-03", food_item: "Pasta", prepared: 35, wasted: 7 },
  { date: "2026-03-03", food_item: "Fruit", prepared: 25, wasted: 6 },
  { date: "2026-03-04", food_item: "Rice", prepared: 55, wasted: 4 },
  { date: "2026-03-04", food_item: "Soup", prepared: 20, wasted: 3 },
  { date: "2026-03-05", food_item: "Bread", prepared: 28, wasted: 9 },
  { date: "2026-03-05", food_item: "Salad", prepared: 22, wasted: 11 },
];
