import { Avatar, Badge, Skeleton, Tabs } from '@mantine/core';
import { useRouter } from 'next/router';
import React from 'react';
import { userContext } from '~/contexts/UserProvider';
import InfoIcon from '../icons/info';
import UserGroup from '../icons/user_group';
import SelectColor from '../input/select_color';
import { api } from '~/utils/api';
import { notifications } from '@mantine/notifications';
import ErrorIcon from '../icons/erro_icon';
import UserProfilePic from '../user/UserProfilePic';
import { useDisclosure } from '@mantine/hooks';
import ModalContainer from '../containers/modal_container';
import LoadingIcon from '../misc/loading_icon';




interface TeamState {
    id: string;
    name: string;
    color: string;
    image?: string;
    ownerId?: string;
}

const CreateInvite = ({
    opened,
    onClose,
}: {
    opened: boolean;
    onClose: () => void;
}) => {
    const [email, setEmail] = React.useState<string>("");
    const [link, setLink] = React.useState("");
    const { agent } = React.useContext(userContext);
    const inviteMutation = api.teams.createInvitation.useMutation({
        onError: (err) => {
            console.error(err)
            if (err.data?.zodError) {
                return notifications.show({
                    title: "Error",
                    message: "The email you entered is invalid.",
                    icon: <ErrorIcon />,
                    color: "red",
                })
            }
            notifications.show({
                title: "Error",
                message: err.message,
                icon: <ErrorIcon />,
                color: "red",
            })
        },
        onSuccess: (data) => {
            if (data.type === "link") {
                return setLink(data.invitationLink)
            }
            notifications.show({
                title: "Email sent!",
                color: "green",
                message: "we sent an email to the user",
            })

        }
    })

    return (
        <ModalContainer opened={opened} onClose={onClose} title='Invite user'>
            <div className='flex flex-col'>
                <div>
                    <label htmlFor="link">Create a Invitation Link</label>
                    <div className="flex gap-2 w-full ">
                        <div className="primary-text-input items-center flex gap-2 w-full whitespace-nowrap overflow-hidden "
                        >
                            <span className="overflow-hidden text-ellipsis">
                                {link ? link : "Invitation link"}
                            </span>
                            {link && <button className="text-blue-600"
                                onClick={() => {
                                    navigator.clipboard.writeText(link).then(() => {
                                        notifications.show({
                                            title: "Copied!",
                                            color: "blue",
                                            message: "The link was copied to your clipboard",
                                        })
                                    }).catch(() => {
                                        notifications.show({
                                            title: "Error",
                                            color: "red",
                                            message: "Error copying link"
                                        })
                                    })
                                }}
                            >copy</button>}
                        </div>
                        <button className="primary-button w-[10rem]"
                            disabled={inviteMutation.isLoading}
                            onClick={() => {
                                if (!agent?.id) return
                                inviteMutation.mutate({
                                    teamId: agent.id,
                                })
                            }}
                        >{inviteMutation.isLoading ? <LoadingIcon /> : "Get link"}</button>
                    </div>
                </div>
                <div className="flex gap-2 items-center py-2">
                    <div className="w-full border-b"></div>
                    OR
                    <div className="w-full border-b"></div>
                </div>
                <div>
                    <label htmlFor="link">Send email invitation</label>
                    <div className="flex gap-2 w-full ">
                        <input type="email" name="email" id="email" className="primary-text-input w-full" placeholder="the user's email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button className="primary-button w-[10rem]"
                            disabled={inviteMutation.isLoading}
                            onClick={() => {
                                if (!agent?.id || email.length < 5) return
                                inviteMutation.mutate({
                                    teamId: agent.id,
                                    email: email,
                                })
                            }}
                        >{inviteMutation.isLoading ? <LoadingIcon /> : "Send email"}</button>
                    </div>
                </div>
            </div>
        </ModalContainer>
    )

}

const Member = ({ member, isOwner }: {
    member: {
        id: string;
        name: string | null;
        email: string | null;
        image?: string | null;
    },
    isOwner: boolean;
}) => {
    return (

        <div className="flex flex-row w-full gap-2 items-center border p-2 rounded-md">
            <Avatar src={member.image} alt="User profile pic" radius="xl" />
            <div className="flex flex-col">
                <div className="flex gap-2 items-center">
                    <span>
                        {member.name || "Name not provided"}
                    </span>
                    {isOwner ? <Badge>Owner</Badge> : null}
                </div>
                <span className="text-xs text-gray-400">{member.email || "Email not provided"}</span>
            </div>
        </div>
    )
}

const TeamMembers = ({ team }: {
    team: TeamState
}) => {
    const teamMembersMutation = api.teams.getTeamUsers.useQuery({
        teamId: team.id,
    }, {
        onError: (err) => {
            console.error(err)
        },
    });
    const [teamMembers, setTeamMembers] = React.useState<typeof teamMembersMutation.data | undefined>(undefined);
    const [createInvite, { open: openCreateInvite, close: closeCreateInvite }] = useDisclosure();
    React.useEffect(() => {
        if (!teamMembersMutation.data) { return }
        setTeamMembers(teamMembersMutation.data)
    }, [teamMembersMutation.data])
    return (
        <div className="flex flex-col w-full flex-grow gap-2 p-2 items-center">
            <CreateInvite opened={createInvite} onClose={closeCreateInvite} />
            <SectionHeader title="Team Members" subtitle="Manage your team members" />
            <div className="flex flex-col w-full gap-2">
                <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-400">Members: {teamMembers ? teamMembers.length : "loading..."}</span>
                    <div className="flex gap-2">
                        <button className="secondary-button w-[8rem]">Manage invites</button>
                        <button className="secondary-button w-[8rem]"
                            onClick={openCreateInvite}
                        >Invite user</button>
                    </div>
                </div>
                {teamMembers && !teamMembersMutation.isLoading ? teamMembers.map((member) => {
                    return (
                        <Member key={member.id} member={member} isOwner={member.id === team.ownerId} />
                    )
                }
                ) : null}
                {teamMembersMutation.isLoading ?
                    <div className="flex gap-2 p-2 border rounded-md">
                        <Skeleton circle height={50} width={200} />
                        <div className="flex flex-col h-full flex-grow gap-2 p-2">
                            <Skeleton height={15} width={"90%"}/>
                            <Skeleton height={10} width={"75%"}/>
                        </div>
                    </div>
                    : null}
            </div>
        </div>
    )
}
const UpdateInfoForm = ({ team, setTeam }: {
    team: TeamState;
    setTeam: (team: TeamState) => void;
}) => {
    const [newTeam, setNewTeam] = React.useState<TeamState>(team);
    const { setTeams } = React.useContext(userContext);

    const updateTeamMutation = api.teams.updateTeam.useMutation({
        onSuccess: (data) => {
            if (!data.color) { return }
            setTeams(old => old.map(curr => {
                if (curr.id === data.id) {
                    return {
                        ...curr,
                        color: data.color,
                        name: data.name,
                    }
                }
                return curr;
            }))
            setTeam({
                name: data.name,
                color: data.color,
                id: data.id,
                image: data.image || undefined,
            })
        },
        onError: (error) => {
            console.log(error)
            if (error.data?.zodError) {
                const errors = error.data.zodError.fieldErrors;
                if (errors.name) {
                    return notifications.show({
                        title: "Error",
                        message: "The team name is too long or short",
                        color: "red",
                        icon: <ErrorIcon />
                    })
                }
                if (errors.color) {
                    return notifications.show({
                        title: "Error",
                        message: "The team color is invalid",
                        color: "red",
                        icon: <ErrorIcon />
                    })
                }
            }
            notifications.show({
                title: "Error",
                message: "An error occurred while updating your team's information.",
                color: "red",
                icon: <ErrorIcon />
            })
        }
    });

    React.useEffect(() => {
        if (team) {
            setNewTeam(team)
        }
    }, [team])

    return (
        <form className="flex flex-col w-full flex-grow gap-2 p-2 items-center"

            onSubmit={(e) => {
                e.preventDefault();
                updateTeamMutation.mutate({
                    teamId: newTeam.id,
                    name: newTeam.name,
                    color: newTeam.color,
                });
            }}
        >
            <SectionHeader title="Team Profile" subtitle="Update your team's information" />
            <div className="form-item max-w-md w-full">
                <label htmlFor="name">Team Name</label>
                <input type="text" className="primary-text-input" required value={newTeam.name} onChange={(e) => {
                    setNewTeam({
                        ...newTeam,
                        name: e.target.value,
                    })
                }} />
            </div>
            <div className="max-w-md w-full">
                <SelectColor color={newTeam.color} setColor={(color) => {
                    setNewTeam({
                        ...newTeam,
                        color,
                    })
                }} />
            </div>
            <button className="primary-button w-full">Save</button>
        </form>
    )
}
const SectionHeader = ({ title, subtitle }: {
    title: string;
    subtitle: string;
}) => {
    return (
        <div className="flex flex-col items-center justify-center w-full ">
            <h1 className="text-2xl font-bold text-center text-gray-200">
                {title}
            </h1>
            <p className="text-gray-400 text-sm">
                {subtitle}
            </p>
        </div>
    )
}

export default function Teams() {

    const { agent, agentType, setAgent } = React.useContext(userContext);
    const router = useRouter();
    const [team, setTeam] = React.useState<TeamState>({
        id: agent?.id || "",
        name: agent?.name || "",
        color: agent?.color || "",
        image: agent?.image || "",
        ownerId: "",
    });

    React.useEffect(() => {
        if (agentType === "user") {
            void router.push("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agentType])

    React.useEffect(() => {
        if (agent) {
            setTeam({
                id: agent.id,
                name: agent.name || "",
                color: agent.color || "",
                image: agent.image || "",
                ownerId: agent.ownerId || "",
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useEffect(() => {
        if (agent) {
            setTeam({
                id: agent.id,
                name: agent.name || "",
                color: agent.color || "",
                image: agent.image || "",
                ownerId: agent.ownerId || "",
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agent])

    if (agentType === "user" || !agent) {
        void router.push("/");
        return null
    }

    return (
        <div className="flex flex-col w-full ">
            <Tabs defaultValue="info"
                color="secondary-color.0"
                classNames={{
                    tabsList: "backdrop-blur",
                    panel: "md:max-w-3xl md:mx-auto",
                }}>
                <Tabs.List >
                    <Tabs.Tab value="info" title="Info" icon={<InfoIcon />}>
                        Team
                    </Tabs.Tab>
                    <Tabs.Tab value="members" title="Members" icon={<UserGroup />}>
                        Members
                    </Tabs.Tab>
                    <Tabs.Tab value="settings" title="Settings" icon={<UserGroup />}>
                        Settings
                    </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="info">
                    <UpdateInfoForm team={team} setTeam={(team) => {
                        setAgent("team", team)
                    }} />
                </Tabs.Panel>
                <Tabs.Panel value="members">
                    <TeamMembers team={team} />
                </Tabs.Panel>
                <Tabs.Panel value="settings">
                    <TeamMembers team={team} />
                </Tabs.Panel>
            </Tabs>
        </div>
    )
}
