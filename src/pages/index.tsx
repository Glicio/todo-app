import { Tabs } from "@mantine/core";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Categories from "~/components/content/categories";
import UserNotAuthed from "~/components/content/not_authed";
import Todos from "~/components/content/todos";
import MainLayout from "~/components/layouts/main_layout";

const Home: NextPage = () => {

    const { data: session } = useSession();

    if (!session || !session.user) {

        return (
            <MainLayout >
                <UserNotAuthed />
            </MainLayout>
        )
    }

    return (
        <>
            <MainLayout>
                <Tabs defaultValue="todos" color="secondary-color.0"
                    classNames={{
                        tabsList: "backdrop-blur",
                    }}
                    onTabChange={(value) => {
                        console.log(value)
                    }}
                >
                    <div className="relative h-[2.25rem] w-full">
                        <Tabs.List
                            className="fixed w-full"
                        >
                            <Tabs.Tab value="todos">Todos</Tabs.Tab>
                            <Tabs.Tab value="done">Done</Tabs.Tab>
                            <Tabs.Tab value="categories">Categories</Tabs.Tab>
                        </Tabs.List>
                    </div>
                    <Tabs.Panel value="todos">
                        <Todos done={false} />
                    </Tabs.Panel>
                    <Tabs.Panel value="done">
                        <Todos done />
                    </Tabs.Panel>
                    <Tabs.Panel value="categories">
                        <Categories />
                    </Tabs.Panel>


                </Tabs>
            </MainLayout>
        </>
    );
};

export default Home;

