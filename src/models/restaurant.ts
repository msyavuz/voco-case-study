import { Model, Schema, Types, model } from "mongoose";
import { Address, pointSchema } from "./user";

export interface MenuItem {
    _id: Types.ObjectId;
    name: string;
    price: number;
    ingredients: string[];
    image: string;
}

interface Restaurant {
    name: string;
    description: string;
    logo: string;
    address: Address;
    branches: Address[];
    menu: MenuItem[];
    type: string;
}

const restaurantSchema = new Schema<Restaurant>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    logo: { type: String, required: true },
    address: new Schema<Address>({
        city: String,
        district: String,
        fullAddress: String,
        location: { type: pointSchema, index: "2dsphere" },
    }),
    branches: [
        new Schema<Address>({
            city: String,
            district: String,
            fullAddress: String,
            location: { type: pointSchema, index: "2dsphere" },
        }),
    ],
    type: { type: String, required: true },
});

export const RestaurantModel = model<Restaurant, Model<Restaurant>>(
    "Restaurant",
    restaurantSchema,
);
