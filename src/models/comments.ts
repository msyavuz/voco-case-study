import { Model, Schema, Types, model } from "mongoose";

interface Comment {
    userId: Types.ObjectId;
    restaurantId: Types.ObjectId;
    comment?: string;
    rating: number;
    date: Date;
}
const commentSchema = new Schema<Comment>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    comment: String,
    rating: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

export const CommentModel = model<Comment, Model<Comment>>(
    "Comment",
    commentSchema,
);
