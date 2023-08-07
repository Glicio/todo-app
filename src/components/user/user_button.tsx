import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import UserProfilePic from "./UserProfilePic";

function UserMenu() {
    const { data: session } = useSession();

    return (
        <div className="absolute right-2 top-10 flex w-40 flex-col gap-2 rounded border border-[var(--tertiary-color)] bg-[var(--primary-color)] p-4">
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
}

export default function UserButton() {
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
}
