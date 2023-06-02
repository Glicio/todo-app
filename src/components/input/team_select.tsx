import React from "react";
import ChevronUpDown from "../icons/chevron_up_down";
import { useSession } from "next-auth/react";
import UserProfilePic from "../user/UserProfilePic";
import AddIcon from "../icons/add";

const SelectButton = ({
    name,
    imageUrl,
    color,
}: {
    name: string;
    imageUrl?: string;
    color?: string;
}) => {
    return (
        <button className="flex w-full items-center gap-2">
            {imageUrl && <UserProfilePic image={imageUrl} />}
            {!imageUrl && color ? (
                <div
                    className={`h-8 w-8 rounded-full`}
                    style={{ backgroundColor: color }}
                ></div>
            ) : null}
            {name}
        </button>
    );
};

export default function TeamSelect() {
    const { data: session } = useSession();
    const [showMenu, setShowMenu] = React.useState(false);

    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const listener = (e: MouseEvent) => {
            if (e.target && ref.current && !ref.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("click", listener);
        return () => {
            document.removeEventListener("click", listener);
        };
    }, []);





    if (!session?.user) {
        return null;
    }

    return (
        <div className="relative " ref={ref}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex w-[8rem] justify-between gap-2 rounded-md border border-[var(--tertiary-color)] p-2"
            >
                <span className="w-2/3 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                    {session.user.name?.split(" ")[0] || "User"}
                </span>
                <ChevronUpDown />
            </button>

            {showMenu && (
                <div className="absolute left-0 top-12 w-[12rem] rounded-md border border-[var(--tertiary-color)] bg-[var(--primary-color)]">
                    <div className="flex flex-col gap-2 p-2">
                        <span className="text-sm font-thin">
                            Personal account
                        </span>
                        <SelectButton
                            name={session.user.name || "User"}
                            imageUrl={session.user.image || undefined}
                        />
                        <div className="border-b border-[var(--tertiary-color)]"></div>
                        <span className="text-sm font-thin">Your teams</span>
                        <div className="flex flex-col gap-1 max-h-[10rem] overflow-y-auto thin-scroll">
                            <SelectButton
                                name="Team 1"
                                color="var(--secondary-color)"
                            />
                            <SelectButton name="Team 2" color="#156215" />
                            <SelectButton name="Team 3" color="#696969" />
                        </div>
                        <button className="flex w-full items-center gap-2 text-left">
                            <div className="h-8 w-8 rounded-full">
                                <AddIcon />
                            </div>
                            Add new team
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
