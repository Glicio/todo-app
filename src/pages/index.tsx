import { Tabs } from "@mantine/core";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useContext } from "react";
import Categories from "~/components/content/categories";
import UserNotAuthed from "~/components/content/not_authed";
import Teams from "~/components/content/teams";
import Todos from "~/components/content/todos";
import MainLayout from "~/components/layouts/main_layout";
import { userContext } from "~/contexts/UserProvider";

const Home: NextPage = () => {

    const { data: session } = useSession();
    const { agentType } = useContext(userContext)
    const router = useRouter();
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
                        if (value === "team") {
//                            void router.push("/team")
                        }
                    }}
                >
                    <div className="relative h-[2.25rem] w-full">
                        <Tabs.List
                            className="fixed w-full"
                        >
                            <Tabs.Tab value="todos">Todos</Tabs.Tab>
                            <Tabs.Tab value="done">Done</Tabs.Tab>
                            <Tabs.Tab value="categories">Categories</Tabs.Tab>

                            {agentType === "team" ? (
                                <Tabs.Tab value="team">Team</Tabs.Tab>
                            ) : null}
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
                    {agentType === "team" ? (
                        <Tabs.Panel value="team">
                            <Teams />
                        </Tabs.Panel>
                    ) : null}


                </Tabs>
            </MainLayout>
        </>
    );
};

export default Home;

