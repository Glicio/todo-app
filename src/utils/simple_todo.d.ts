import type { Todo } from "@prisma/client";
import type SimpleUser from "./simple_user";
import type SimpleCategory from "./simple_category";

export interface SimpleStep {
    id?: string;
    title: string;
    done: boolean;
}

export default interface SimpleTodo extends Todo {
    categories:  SimpleCategory[];
    createdBy: SimpleUser, 
    updatedBy: SimpleUser | null;
    assignedTo: SimpleUser[] | null;
    steps: SimpleStep[] | null;
}
