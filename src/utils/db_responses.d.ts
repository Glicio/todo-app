
export interface CategoryResponse {
    id: string;
    name: string;
    description: string;
    userId: string;
    color: string;
}

export interface TodoResponse {
    id: string;
    title: string;
    description: string;
    userId: string;
    categoryId: string;
    createdAt: string;
    done: string;
    dueDate: string;
    updatedAt: string;
}
