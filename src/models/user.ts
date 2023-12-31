import { Model, Schema, Types, model } from "mongoose";

export interface Address {
    _id: Types.ObjectId;
    city: string;
    district: string;
    fullAddress: string;
    location: typeof pointSchema;
}

interface User {
    username: string;
    name: string;
    encryptedPassword: string;
    email: string;
    age: number;
    gender: string;
    profileImage?: string;
    addresses: Address[];
}

export const pointSchema = new Schema({
    type: {
        type: String,
        enum: ["Point"],
        required: true,
    },
    coordinates: {
        type: [Number],
        required: true,
    },
});

const userSchema = new Schema<User>({
    username: { type: String, required: true },
    name: { type: String, required: true },
    encryptedPassword: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    profileImage: String,
    addresses: [
        new Schema<Address>({
            city: String,
            district: String,
            fullAddress: String,
            location: { type: pointSchema, index: "2dsphere" },
        }),
    ],
});

userSchema.index({ "addresses.location": "2dsphere" });

export const UserModel = model<User, Model<User>>("User", userSchema);
