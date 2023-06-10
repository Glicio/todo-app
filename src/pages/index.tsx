import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Todos from "~/components/content/todos";
import MainLayout from "~/components/layouts/main_layout";

const Home: NextPage = () => {

    const { data: session } = useSession();

  return (
    <>
        <MainLayout>
            {session?.user ? <Todos done={false}/> : <>NOT AUTHED</>}
        </MainLayout>
    </>
  );
};

export default Home;

