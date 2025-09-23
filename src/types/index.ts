// types/index.ts
export type Contest = {
    id: string;
    title: string;
    description: string;
    category: string;
    isActive: boolean;
    contestants: Contestant[];
    createdAt: Date;
    endDate?: Date;
    prize?: string;
    rules?: string[];
    
};

export type Contestant = {
    id: string;
    name: string;
    bio: string;
    image: string;
    votes: number;
    amountGained: number;
    comments: Comment[];
    category?: string;
    isActive?: boolean;
    cloudinaryPublicId?: string;
};

export type Comment = {
    id: string;
    text: string;
    createdAt: Date;
};

export type Event = {
    id: string;
    title: string;
    date: string;
    location: string;
    image: string;
    isActive: boolean;
    tickets: { type: string; price: number; available: number }[];
};

export type ContentItem = {
    id: number;
    title: string;
    type: string;
    image: string;
    featured?: boolean;
};

export interface AppComment {
    id: string;
    text: string;
    createdAt: Date;
}