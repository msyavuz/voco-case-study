import { RestaurantModel } from "../models/restaurant";

export async function getRestaurantsByAverageRating(
    page: number,
    pageSize: number,
) {
    const totalEntries = await RestaurantModel.countDocuments();
    const totalPages = Math.ceil(totalEntries / pageSize);

    if (page < 1 || page > totalPages) {
        return -1;
    }

    const restaurants = await RestaurantModel.aggregate([
        {
            $lookup: {
                from: "Comments",
                localField: "_id",
                foreignField: "restaurantId",
                as: "Comments",
            },
        },
        {
            $addFields: {
                averageRating: {
                    $avg: "$Comments.rating",
                },
            },
        },
        {
            $sort: {
                averageRating: -1,
            },
        },
        {
            $skip: (page - 1) * pageSize,
        },
        {
            $limit: pageSize,
        },
    ]);
    return { totalPages, restaurants };
}
