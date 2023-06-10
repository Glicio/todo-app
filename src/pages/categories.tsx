import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Categories from "~/components/content/categories";
import MainLayout from "~/components/layouts/main_layout";

const CategoriesPage: NextPage = () => {
    const { data: session } = useSession();
    
    return (
        <>
            <MainLayout>
                {session?.user ? <Categories /> : <div>loading...</div>}
            </MainLayout>
        </>
    );
};

export default CategoriesPage;
