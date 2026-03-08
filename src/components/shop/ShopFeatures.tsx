import { CoffeeShop } from "@/data/coffeeShops";
import {
  Coffee, Laptop, Users, Dog,
  UtensilsCrossed, Armchair, Sunrise, Moon,
} from "lucide-react";

const attributeConfig = [
  { key: "specialtyCoffee", label: "Specialty Coffee", icon: Coffee },
  { key: "laptopFriendly", label: "Laptop Friendly", icon: Laptop },
  { key: "kidsFriendly", label: "Kids Friendly", icon: Users },
  { key: "dogFriendly", label: "Dog Friendly", icon: Dog },
  { key: "foodMenu", label: "Food Menu", icon: UtensilsCrossed },
  { key: "sitIn", label: "Sit-in Space", icon: Armchair },
  { key: "opensEarly", label: "Opens Early", icon: Sunrise },
  { key: "opensLate", label: "Opens Late", icon: Moon },
];

interface ShopFeaturesProps {
  attributes: CoffeeShop["attributes"];
}

export function ShopFeatures({ attributes }: ShopFeaturesProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-xl">Shop Features</h2>
      <div className="grid grid-cols-2 gap-2">
        {attributeConfig.map(({ key, label, icon: Icon }) => {
          const has = attributes[key as keyof typeof attributes];
          return (
            <div
              key={key}
              className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm ${
                has
                  ? "border-success/30 bg-success/5 text-foreground"
                  : "border-border bg-muted/30 text-muted-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${has ? "text-success" : ""}`} />
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
