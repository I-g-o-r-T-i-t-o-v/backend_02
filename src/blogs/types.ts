import { Request } from "express";
import { ObjectId } from "mongodb";
import { PostType } from "../posts/types";

export type BlogType = {
    id?: string; // deprecated
    _id?: ObjectId; // new from mongodb
    name: string;
    description: string;
    websiteUrl: string;
    createdAt?: string;
    isMembership: boolean;
}

export type BlogQueryType = {
    searchNameTerm: string | null;
    sortBy: string;
    sortDirection: string | number;
    pageNumber: number;
    pageSize: number;
}

export const BlogsAvailableSortBy = ["id", "createdAt", "name", "description", "websiteUrl", "isMembership"];

export type GetAllBlogsReqType = Request<{}, {}, {}, BlogQueryType>;

export type GetAllPostsByBlogIdReqType = Request<{ blogId: string }, {}, {}, Omit<BlogQueryType, "searchNameTerm">>;

export type CreateBlogReqType = Request<{}, {}, Omit<BlogType, "id">>;

export type CreatePostByBlogIdReqType = Request<{ blogId: string }, {}, Omit<PostType, "id" | "blogName" | "blogId">, {}>;

export type UpdateBlogReqType = Request<{id: string}, {}, Omit<BlogType, "id">>;


