import { ObjectId, SortDirection } from "mongodb";

import { blogCollection, postCollection } from "../db/mongodb";
import { BlogQueryType, BlogType } from "./types";
import { PostQueryType } from "../posts/types";

export const blogsRepository = {
    _clearDB: async () => {
        return blogCollection.drop();
    },
    _getAllBlogs: async (parsedQuery: BlogQueryType) => {
        const {searchNameTerm, sortBy, sortDirection, pageSize, pageNumber} = parsedQuery;
        const filter: any = {};

        if (searchNameTerm) {
            filter.name = {$regex: searchNameTerm, $options: "i"};
        }

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
    _getBlogById: async (id: string): Promise<BlogType | undefined> => {
        try {
            const result = await blogCollection.findOne({_id: new ObjectId(id)});
            if (!result) {
                return;
            }

            return result;
        } catch (e) {
            console.log(e);
            return;
        }
    },
    _getPostsByBlogId: async (
        {
            blogId,
            parsedQuery
        }: {
            blogId: string,
            parsedQuery: PostQueryType
        }) => {
        const {sortBy, sortDirection, pageSize, pageNumber} = parsedQuery;
        const filter = {
            blogId,
        };

        return postCollection
            .find(filter)
            .sort({[sortBy as string]: sortDirection as SortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
    },
    _getPostsByBlogIdCount: async (blogId: string) => {
        const filter = {
            blogId,
        };

        return postCollection.countDocuments(filter);
    },
    _addNewBlog: async (newBlog: BlogType): Promise<string> => {
        try {
            const createdBlog = await blogCollection.insertOne(newBlog);
            return createdBlog?.insertedId?.toString();
        } catch {
            return ""
        }
    },
    _updateBlog: async (
        {
            id,
            updatedBlog
        }: {
            id: string;
            updatedBlog: BlogType
        }): Promise<boolean> => {
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
    _deleteBlogById: async (id: string): Promise<boolean> => {
        try {
            const result = await blogCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
}