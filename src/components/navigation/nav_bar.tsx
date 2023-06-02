import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import TeamSelect from "../input/team_select";
import UserIcon from "../user/user_icon";

const UserMenu = () => {
    const { data: session } = useSession();

    return (
        <div className="absolute right-2 top-10 flex w-40 flex-col gap-2 rounded bg-gray-800 p-4">
            <span>Hi, {session?.user?.name || "User"}</span>
            <div className="border-b"></div>
            <button
                className="primary-button"
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
                {session?.user?.image ? (
                    <Image
                        alt="user profile pick"
                        width="200"
                        height="200"
                        src={session?.user?.image}
                        className="h-6 w-6 rounded-full"
                    />
                ) : (
                    <UserIcon />
                )}
            </button>
        </div>
    );
};

export default function NavBar() {
    return (
        <div className="bg-primary flex h-12 w-full items-center border-b border-[var(--tertiary-color)] p-4">
            <span className="font-bold text-[var(--secondary-color)]">JET</span>
            <TeamSelect />
            <div className="ml-auto">
                <UserButton />
            </div>
        </div>
    );
}
