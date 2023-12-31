import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import { getRestaurantsByAverageRating } from "./services/restaurant.service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// A seperate router can be implemented for different resources such as restaurant.router etc. but it seemed overkill for a single api route.
app.get("/restaurants", async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/test");
        const result = await getRestaurantsByAverageRating(page, pageSize);
        if (result === -1) {
            return res.status(400).json({ message: "Invalid page number" });
        }
        res.json({
            totalPages: result.totalPages,
            currentPage: page,
            restaurants: result.restaurants,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});
