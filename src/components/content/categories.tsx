import React from 'react'
import { userContext } from '~/contexts/UserProvider';
import { api } from '~/utils/api';
import CategoryComponent from './category_component';
import AddBtn from '../input/add_btn';
import AddCategory from '../forms/add_category';
import { useDisclosure } from '@mantine/hooks';
import { Category } from '@prisma/client';



export default function Categories() {
    const { agent, agentType } = React.useContext(userContext);
    const [addCategory, {open: openAddCategory, close: closeAddCategory}] = useDisclosure();

    const categoriesMutation = api.category.getAgentCategories.useQuery(
        {
            agentId: agent?.id as string,
            agentType: agentType,
            prisma: false,
        },
        {
            enabled: !!agent?.id && !!agentType,
            cacheTime: 0,
        }
    );

    const [categories, setCategories] = React.useState<Category[]>([]);
    
    React.useEffect(() => {
        if (categoriesMutation.data) {
            setCategories(categoriesMutation.data);
        }
    }, [categoriesMutation.data]);


    return (
        <div>
            <AddCategory opened={addCategory} onClose={closeAddCategory} onAdd={(category) => {
                setCategories((prev) => [...prev, category]);
            }}/>
            <AddBtn onClick={openAddCategory}/> 
            {categories.map((category) => (
                <CategoryComponent key={category.id} category={category}/>
            ))}
        </div>
    )
}
