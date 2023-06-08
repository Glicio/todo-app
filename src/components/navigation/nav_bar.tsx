import { useSession } from "next-auth/react";
import React from "react";
import TeamSelect from "../input/team_select";
import UserButton from "../user/user_button";



export default function NavBar() {
    const {data: session} = useSession()
    return (
    <>
        <div className="h-12 w-full"></div>
        <div className="fixed z-20 bg-[var(--primary-color)] top-0 left-0 bg-primary flex h-12 w-full items-center border-b border-[var(--tertiary-color)] px-2 py-4">
                <span className="font-bold text-[var(--secondary-color)] mr-2">JET</span>
                {session?.user ? <TeamSelect /> : null}
                <div className="ml-auto">
                    <UserButton/>
                </div>
        </div>
        </>
    );
}
