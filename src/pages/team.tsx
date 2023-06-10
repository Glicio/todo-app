
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Teams from "~/components/content/teams";
import Todos from "~/components/content/todos";
import MainLayout from "~/components/layouts/main_layout";

const Team: NextPage = () => {

    const { data: session } = useSession();

  return (
    <>
       <MainLayout>
            {session?.user ? <Teams />: <>NOT AUTHED</>}
        </MainLayout>
    </>
  ); 
};

export default Team;

