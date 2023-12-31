import { Model, Schema, Types, model } from "mongoose";

interface Order {
    userId: Types.ObjectId;
    restaurantId: Types.ObjectId;
    addressId: Types.ObjectId;
    date: Date;
    items: [Types.ObjectId];
}
const orderSchema = new Schema<Order>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    addressId: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    date: { type: Date, default: Date.now },
    items: [{ type: Schema.Types.ObjectId, ref: "Item" }],
});

export const OrderModel = model<Order, Model<Order>>("Order", orderSchema);
