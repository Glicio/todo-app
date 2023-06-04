import { Category } from '@prisma/client';
import React from 'react';
import { api } from '~/utils/api';


export default function CategoryComponent({category}: {category: Category})  {
    return (
        <div>
            <h1>{category.name}</h1>
        </div>
    )
}

