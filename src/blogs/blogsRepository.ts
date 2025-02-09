import { ObjectId, SortDirection } from "mongodb";

import { BlogType } from "./types";
import { blogCollection } from "../db/mongodb";
import { replaceMongo_idByid } from "../utils/mapDbResult";
import { QueryType } from "../types";

export const blogsRepository = {
    clearDB: async () => {
        return blogCollection.drop();
    },
    _getAllBlogs: async (parsedQuery: QueryType) => {
        const {searchNameTerm, sortBy, sortDirection, pageSize, pageNumber} = parsedQuery;
        const filter: any = {};

        if (searchNameTerm) {
            filter.name = {$regex: searchNameTerm, $options: "i"};
        }
        console.log("filter")
        console.log(filter)

        return blogCollection
            .find(filter)
            .sort({[sortBy as string]: sortDirection as SortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
    },
    _getBlogsCount: async (searchNameTerm: string | null) => {
        const filter: any = {};

        if (searchNameTerm) {
            filter.name = {$regex: searchNameTerm, $options: "i"};
        }

        return blogCollection.countDocuments(filter);
    },
    getBlogById: async (id: string): Promise<BlogType | undefined> => {
        try {
            const result = await blogCollection.findOne({_id: new ObjectId(id)});
            if (!result) {
                return;
            }

            return replaceMongo_idByid(result);
        } catch (e) {
            console.log(e);
            return;
        }
    },
    _addNewBlog: async (
        {
            name,
            description,
            websiteUrl,
            isMembership,
        }:
            {
                name: string;
                description: string;
                websiteUrl: string;
                isMembership?: boolean;
            }): Promise<string> => {
        const newBlog: BlogType = {
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
            isMembership: typeof isMembership === "boolean" ? isMembership : false,
            createdAt: (new Date()).toISOString(),
        };

        const createdBlog = await blogCollection.insertOne(newBlog);
        return createdBlog?.insertedId?.toString();
    },
    updateBlog: async (
        {
            id,
            name,
            description,
            websiteUrl,
            isMembership,
        }: {
            id: string;
            name: string;
            description: string;
            websiteUrl: string;
            isMembership?: boolean;
        }): Promise<boolean> => {
        const updatedBlog: Omit<BlogType, "createdAt"> = {
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
            isMembership: typeof isMembership === "boolean" ? isMembership : false,
        }

        try {
            const result = await blogCollection.updateOne(
                {_id: new ObjectId(id)},
                {$set: updatedBlog}
            );

            return result.matchedCount === 1;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    deleteBlogById: async (id: string): Promise<boolean> => {
        try {
            const result = await blogCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
}