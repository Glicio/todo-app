import React from "react";
import ChevronUpDown from "../icons/chevron_up_down";
import { useSession } from "next-auth/react";
import UserProfilePic from "../user/UserProfilePic";
import AddIcon from "../icons/add";
import { useDisclosure } from "@mantine/hooks";
import ModalContainer from "../containers/modal_container";
import DefaultForm from "../forms/default_form";
import type { Team } from "@prisma/client";
import { api } from "~/utils/api";
import { ColorPicker } from "@mantine/core";
import { validColors } from "~/utils/valid_colors";
import LoadingIcon from "../misc/loading_icon";
import { userContext } from "~/contexts/UserProvider";
import Image from "next/image";
import { notifications } from "@mantine/notifications";
import ErrorIcon from "../icons/erro_icon";

type TeamState = Omit<Team, "createdAt" | "updatedAt" | "ownerId" | "id"| "todosCount" | "categoriesCount">;
type TeamAction = keyof TeamState | "reset";

const teamInitialState: TeamState = {
    name: "",
    color: "",
    image: "",
};

const teamReducer = (
    state: TeamState,
    action: { type: TeamAction; payload: string }
): TeamState => {
    if (action.type === "reset") {
        //bye bye pure function
        return teamInitialState;
    }
    return {
        ...state,
        [action.type]: action.payload,
    };
};

const AddTeam = ({
    opened,
    onClose,
    refetchTeams,
}: {
    opened: boolean;
    onClose: () => void;
    refetchTeams: () => void;
}) => {
    const [teamState, dispatch] = React.useReducer(
        teamReducer,
        teamInitialState
    );

    const createTeamMutation = api.teams.createTeam.useMutation({
        onSuccess: () => {
            refetchTeams();
            notifications.show({
                title: "Team created",
                message: "Team created successfully",
                color: "green",
                autoClose: 1000,
            });
            close();
        },
        onError: (error) => {
          notifications.show({ 
                title: "Error creating team",
                message: error.message,
                color: 'red',
                autoClose: 3000,
                icon: <ErrorIcon/>
                
            })
        },
    });

    const { data: session } = useSession();

    const close = () => {
        dispatch({ type: "reset", payload: "" });
        onClose();
    };

    React.useEffect(() => {
        if (session?.user.name) {
            dispatch({
                type: "name",
                payload:
                    (session.user.name.split(" ")[0] as string) + "'s team",
            });
        }
    }, []);

    return (
        <ModalContainer opened={opened} onClose={close}>
            <DefaultForm
                title="Create a new team"
                onSubmit={() => {
                    createTeamMutation.mutate({
                        name: teamState.name,
                        color: teamState.color || "#000000",
                    });
                }}
            >
                <div className="flex flex-grow flex-col justify-center gap-2">
                    <label htmlFor="name">Team name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        placeholder="The new team name"
                        className="primary-text-input"
                        value={teamState.name}
                        onChange={(e) =>
                            dispatch({ type: "name", payload: e.target.value })
                        }
                    />
                    <label htmlFor="color">Team color</label>
                    <button
                        type="button"
                        className="flex h-8 w-full items-center justify-center border border-[var(--tertiary-color)]"
                        onClick={() => {
                            dispatch({ type: "color", payload: "" });
                        }}
                        style={{
                            backgroundColor: teamState.color || "",
                        }}
                    >
                        {teamState.color ? "" : <span>No color</span>}
                    </button>
                    <ColorPicker
                        value={teamState.color || ""}
                        withPicker={false}
                        swatches={validColors}
                        onChange={(color) => {
                            dispatch({ type: "color", payload: color });
                        }}
                    />
                    <div className="flex gap-2 w-full">
                        <button
                            type="button"
                            className="secondary-button w-1/2"
                            onClick={close}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="primary-button w-1/2"
                            disabled={createTeamMutation.isLoading}
                        >
                            <div className="flex justify-center">
                                {createTeamMutation.isLoading ? (
                                    <LoadingIcon />
                                ) : (
                                    "Save"
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </DefaultForm>
        </ModalContainer>
    );
};

const SelectButton = ({
    name,
    imageUrl,
    color,
    onClick,
}: {
    name: string;
    imageUrl?: string;
    color?: string;
    onClick: () => void;
}) => {
    return (
        <button className="flex w-full items-center gap-2" onClick={onClick}>
            {imageUrl && <UserProfilePic image={imageUrl} />}
            {!imageUrl && color ? (
                <div
                    className={`h-8 w-8 rounded-full border border-[var(--tertiary-color)]`}
                    style={{ backgroundColor: color }}
                ></div>
            ) : null}
            {name}
        </button>
    );
};

export default function TeamSelect() {
    const { agent, setAgent } = React.useContext(userContext);
    const { data: session } = useSession();
    const [showMenu, setShowMenu] = React.useState(false);
    const [addMenuOpened, { open: openAddMenu, close: closeAddMenu }] =
        useDisclosure();

    const ref = React.useRef<HTMLDivElement>(null);

    const userTeams = api.teams.getUserTeams.useQuery(undefined);

    React.useEffect(() => {
        const listener = (e: MouseEvent) => {
            if (
                e.target &&
                ref.current &&
                !ref.current.contains(e.target as Node)
            ) {
                setShowMenu(false);
            }
        };
        document.addEventListener("click", listener);
        return () => {
            document.removeEventListener("click", listener);
        };
    }, []);

    if (!agent) {
        return <></>;
    }

    return (
        <>
            <AddTeam
                opened={addMenuOpened}
                onClose={closeAddMenu}
                refetchTeams={() => {
                    void userTeams.refetch();
                }}
            />
            <div className="relative max-w-[50%] " ref={ref}>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex w-full items-center justify-between gap-2 rounded-md border border-[var(--tertiary-color)] p-1"
                >
                    <div className="flex w-full items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                        {agent.image ? (
                            <Image
                                alt="the current agent's image"
                                src={agent.image}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full"
                            />
                        ) : (
                            <div
                                className="flex h-8 w-8 border border-[var(--tertiary-color)] rounded-full"
                                style={{
                                    backgroundColor: agent.color || "#000000",
                                }}
                            ></div>
                        )}
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {agent.name || "User"}
                        </span>
                    </div>
                    <ChevronUpDown />
                </button>

                {showMenu && (
                    <div className="absolute left-0 top-12 max-h-[calc(100vh-7.5rem)] w-[12rem] overflow-y-auto rounded-md border border-[var(--tertiary-color)] bg-[var(--primary-color)]">
                        <div className="flex flex-col gap-2 p-2">
                            <span className="text-sm font-thin">
                                Personal account
                            </span>
                            <SelectButton
                                onClick={() => {
                                    setShowMenu(false)
                                    setAgent("user", {
                                        id: session?.user.id || "",
                                        name: session?.user.name || "User",
                                        image: session?.user.image || "",
                                    });
                                }}
                                name={session?.user.name || "User"}
                                imageUrl={session?.user.image || undefined}
                            />
                            <div className="border-b border-[var(--tertiary-color)]"></div>
                            <span className="text-sm font-thin">
                                Your teams
                            </span>
                            <div className="thin-scroll flex max-h-[10rem] flex-col gap-1 overflow-y-auto">
                                {userTeams.data?.map((team) => (
                                    <SelectButton
                                        key={team.id}
                                        name={team.name}
                                        onClick={() => {
                                            setAgent("team", {
                                                id: team.id,
                                                name: team.name,
                                                color: team.color,
                                                image: team.image,
                                            });
                                            setShowMenu(false);
                                        }}
                                        color={
                                            team.color ||
                                            "var(--secondary-color)"
                                        }
                                    />
                                ))}
                            </div>
                            <button
                                className="flex w-full items-center gap-2 text-left"
                                onClick={() => {
                                    setShowMenu(false);
                                    openAddMenu();
                                }}
                            >
                                <div className="h-8 w-8 rounded-full">
                                    <AddIcon />
                                </div>
                                Add new team
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
