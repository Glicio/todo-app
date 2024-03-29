import React from 'react'
import { userContext } from '~/contexts/UserProvider';
import { api } from '~/utils/api';
import CategoryComponent from './category_component';
import AddBtn from '../input/add_btn';
import AddCategory from '../forms/add_category';
import { useDisclosure } from '@mantine/hooks';
import type { Category } from '@prisma/client';
import type SimpleUser from '~/utils/simple_user';



export default function Categories() {
    const { agent, agentType } = React.useContext(userContext);
    const [addCategory, {open: openAddCategory, close: closeAddCategory}] = useDisclosure();

    const categoriesMutation = api.category.getAgentCategories.useQuery(
        {
            agentId: agent?.id as string,
            agentType: agentType,
            includeUser: true,
        },
        {
            enabled: !!agent?.id && !!agentType,
            refetchOnWindowFocus: false,
            cacheTime: 50000,
        }
    );

    const [categories, setCategories] = React.useState<(Category & {createdBy: SimpleUser, updatedBy: SimpleUser | null})[]>([]);
    React.useEffect(() => {
        if (categoriesMutation.data) {
            setCategories(categoriesMutation.data);
        }
    }, [categoriesMutation.data]);
    
    const removeCategory = (id: string) => {
        setCategories((prev) => prev.filter((category) => category.id !== id));
    }
    const updateCategory = (category: Category & {createdBy: SimpleUser, updatedBy: SimpleUser | null}) => {
        setCategories((prev) => prev.map(
            (prevCategory) => prevCategory.id === category.id ? category : prevCategory
        ));
    }

    if (categoriesMutation.isLoading)
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
            </div>
        );

    return (
        <div>
            <AddCategory opened={addCategory} onClose={closeAddCategory} onAdd={(category) => {
                setCategories((prev) => [...prev, {...category, updatedBy: null}]);
            }}/>
            <AddBtn onClick={openAddCategory}/> 
            <div className="flex flex-col gap-2 p-2 md:grid justify-center"
                style={{
                    gridTemplateColumns: "repeat(auto-fill, 25rem)",
                }}
            >
                {categories.map((category) => (
                    <CategoryComponent key={category.id} category={category} onDelete={(id) => removeCategory(id)} onEdit={(category) => updateCategory(category)}/>
                ))}
            </div>
        </div>
    )
}
