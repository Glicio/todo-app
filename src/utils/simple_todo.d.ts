import type { Todo } from "@prisma/client";
import type SimpleUser from "./simple_user";
import type SimpleCategory from "./simple_category";

export default interface SimpleTodo extends Todo {
    category:  SimpleCategory | null | undefined;
    createdBy: SimpleUser, 
    updatedBy: SimpleUser | null;
    assignedTo: SimpleUser[] | null;
}
