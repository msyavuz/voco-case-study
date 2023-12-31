# Voco Case Study
*Mehmet Salih Yavuz*

>Kullanıcılar sisteme kullanıcı adı ve parolayla giriş yapmaktadır. Kullanıcı adı, parola, email adresi , yaş,
>cinsiyet, profil resmi tanımlayabilmektedir. Sipariş için birden fazla adres bilgisi girebilmelidir.
>Restorandan yemek sipariş edebilmeli, restorana her sipariş için yalnız bir yorum yapabilmeli ve
>sadece bir kere puan verebilmelidir. Siparişlere ait tarih, saat bilgileri tutulmalıdır.
>Restoranlar için ad, açıklama, logo ve adres bilgisi olmalıdır. Adres bilgisi il, ilçe ve açık adres içermeli,
>restoranın lokasyon bilgileri tutulmalıdır. Restoranın birden fazla şubesi olabilmektedir. Restorana ait
>menü tanımı yapılabilmelidir. Menünün fiyatı, içeriği, kapak resmi gibi bilgiler tutulmalıdır. Birden
>fazla restoran tipi tanımlanabilmelidir. (Türk mutfağı, fast food v.b.)

This repo contains the relevant code for the case study. 
You can run: 

    npm install

    npm run ts-node

to install and run the server. /restaurants endpoint should be available by then.

## Problem 1

>Yukarıda yer alan bilgiler doğrultusunda MongoDB üzerinde veri tabanı tasarımı yapılması
>istenmektedir.

All documents and subdocuments should have id fields.

- Users Collection

```json
    {
        "username": String,
        "encryptedPassword": String,
        "email": String,
        "age": Number,
        "gender": String,
        "profileImage": String,
        "addresses": [
            {
                "name": String,
                "city": String,
                "district": String,
                "fullAdress": String,
                "location": [Number<lat>, Number<lon>]
            }
        ]
    }
```

- Restaurants Collection

```json
    {
        "name": String,
        "description": String,
        "logo": String,
        "address": {
            "city":String,
            "district": String,
            "fullAddress": String,
            "location": [Number<lat>, Number<lon>]
        },
        "branches": [
            {
                "name": String,
                "city":String,
                "district": String,
                "fullAddress": String,
                "location": [Number<lat>, Number<lon>]
            }
        ],
        "menu": [
            {
                "name": String,
                "price": Number,
                "ingredients": [String],
                "image": String
            }
        ],
        "type": String
    }
```
- Orders Collection

```json
    {
        "userId": ObjectId,
        "restaurantId": ObjectId,
        "addressId": ObjectId,
        "date": Date,
        "items": [ObjectId]
    }
```

- Comments Collection

```json
    {
        "userId": ObjectId,
        "restaurantId": ObjectId,
        "orderId": ObjectId,
        "comment": String,
        "rating": Number,
        "date": Date
    }
```

## Problem 2

> Açıklamasında lahmacun içeren, (39.93, 32.85) koordinatlara en yakın 5 restoranı listeleyiniz.

The query with typescript and mongoose:

```ts
    const closestRestaurants = await RestaurantModel.find(
        {
            description: {
                $regex: /lahmacun/i,
            },
            "address.location": {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lon, lat],
                    },
                },
            },
        },
        null,
        { limit: 5 },
    );
```

## Problem 3

> Küçük boy peynirli pizza 50TL, Orta boy mantarlı pizza 100TL, Hamburger 120Tl olarak belirtilen
> yiyecekler Voco Fast Food restoranının menüsüne yeni eklencektir. Bütün kayıtları tek bir transaction
> içerisinde ekleyen sorguyu yazınız.

This is a query with mongoose for a single transaction.

```ts
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await RestaurantModel.findOneAndUpdate(
            {
                name: "Voco",
            },
            {
                $push: {
                    menu: {
                        $each: newItems,
                    },
                },
            },
        );
        await session.commitTransaction();
        session.endSession();
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
```
## Problem 4

> Restoranlara yapılan yorumlar baz alınarak, son yorum yapan 20 erkek kullanıcıyı yaşa göre sıralayınız.
> (Bir sonraki sorguda sonraki 20 erkek listelenecek şeklinde yorumlayıp sorguyu yazmanız
> beklenmektedir)

This is a query for getting last 20 male commenters. restaurantId field can be omitted to get comments on all restaurants.

```ts
    const lastMaleCommentedUsers = await CommentModel.find({
        restaurantId: restaurantId,
    })
        .sort({ date: -1 })
        .limit(20)
        .populate({
            path: "userId",
            model: UserModel,
            match: { gender: "male" },
            select: "_id username name profileImage",
            options: { sort: { age: 1 } },
        })
        .exec();
```

## Problem 5

>Restoranlara yapılan puanlar baz alınarak, kategorilerinden en az 1 i fast food veya ev yemekleri olan
>veya restoran açıklamasında fast içeren, 4 puan üstü restoranların sadece adlarını, kategorilerini ve
>açıklamasını veren sorguyu yazınız.

```ts
    const result = await RestaurantModel.find({
        $or: [
            { description: { $regex: /fast/i } }, 
            { categories: { $in: ["fast food", "ev yemekleri"] } }, 
        ],
        rating: { $gte: 4 }, 
    })
        .select("name categories description") 
        .exec();
```

## Problem 6

> Oluşturduğunuz veritabanına NodeJS içinde Mongoose ile bağlanıp restoranları pagination olacak
> şekilde client tarafına servis eden endpointi yazınız ve restorana verilen puanların ortalaması yüksek
> olandan düşük olana göre sıralayınız.

I created a service for getting restaurants by average rating which then used it in the main server file. As i commented on the code a separate router layer can be usedto further structure the code but for one endpoint it seemed overkill.

*restaurant.service.ts*

```ts
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
```

*server.ts*

```ts
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
```
