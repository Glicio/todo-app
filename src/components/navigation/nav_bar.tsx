import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import TeamSelect from "../input/team_select";
import UserProfilePic from "../user/UserProfilePic";

const UserMenu = () => {
    const { data: session } = useSession();

    return (
        <div className="absolute right-2 top-10 flex w-40 flex-col gap-2 rounded bg-[var(--primary-color)] border border-[var(--tertiary-color)] p-4">
            <span>Hi, {session?.user?.name || "User"}</span>
            <div className="border-b border-[var(--tertiary-color)]"></div>
            <button
                className="secondary-button"
                onClick={() => {
                    void signOut();
                }}
            >
                Logout
            </button>
        </div>
    );
};

const UserButton = () => {
    const { data: session } = useSession();
    const [showMenu, setShowMenu] = React.useState(false);

    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const listener = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("click", listener);
        return () => {
            document.removeEventListener("click", listener);
        };
    }, []);

    return (
        <div className="relative flex items-center" ref={ref}>
            {showMenu && <UserMenu />}
            <button
                onClick={() => {
                    if (!session?.user) {
                        return void signIn();
                    }
                    setShowMenu(!showMenu);
                }}
            >
            <UserProfilePic image={session?.user.image || undefined} />
            </button>
        </div>
    );
};

export default function NavBar() {
    const {data: session} = useSession()
    return (
    <>
        <div className="h-12 w-full"></div>
        <div className="fixed z-20 bg-[var(--primary-color)] top-0 left-0 bg-primary flex h-12 w-full items-center border-b border-[var(--tertiary-color)] p-4">
            <div className="flex gap-4 items-center">
                <span className="font-bold text-[var(--secondary-color)]">JET</span>
                {session?.user ? <TeamSelect /> : null}
            </div>
            <div className="ml-auto">
                <UserButton />
            </div>
        </div>
        </>
    );
}
