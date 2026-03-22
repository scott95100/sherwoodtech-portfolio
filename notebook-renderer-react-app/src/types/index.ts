export interface Notebook {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

export type Nullable<T> = T | null;