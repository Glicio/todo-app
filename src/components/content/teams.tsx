import { Tabs } from '@mantine/core';
import { useRouter } from 'next/router';
import React from 'react';
import { userContext } from '~/contexts/UserProvider';
import InfoIcon from '../icons/info';
import UserGroup from '../icons/user_group';
import SelectColor from '../input/select_color';




interface TeamState {
    id: string;
    name: string;
    color: string;
    image?: string;
}

const UpdateInfoForm = ({team}: {
    team: TeamState;
}) => {
    const [newTeam, setNewTeam] = React.useState<TeamState>(team);
    return (
        <form className="flex flex-col w-full flex-grow gap-2 p-2 items-center">
            <div className="form-item max-w-md w-full">
                <label htmlFor="name">Team Name</label>
                <input type="text" className="primary-text-input" value={newTeam.name} onChange={(e) => {
                    setNewTeam({
                        ...team,
                        name: e.target.value,
                    })
                }} />
            </div>
            <div className="max-w-md w-full">
                <SelectColor color={newTeam.color} setColor={(color) => {
                    setNewTeam({
                        ...team,
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
        <div className="flex flex-col items-center justify-center w-full gap-2">
            <h1 className="text-2xl font-bold text-center text-gray-200">
                {title}
            </h1>
            <p className="text-gray-400">
                {subtitle}
            </p>
        </div>
    )
}

export default function Teams() {

    const { agent, agentType } = React.useContext(userContext);
    const router = useRouter();
    const [team, setTeam] = React.useState<TeamState>({
        id: agent?.id || "",
        name: agent?.name || "",
        color: agent?.color || "",
        image: agent?.image || "",
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
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useEffect(() => {
        if (team.id !== agent?.id) {
            void router.push(`/`);
       }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agent])
    if (agentType === "user" || !agent) {
        return void router.push("/");
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
                    <Tabs.Tab value="info" title="Info" icon={<InfoIcon/>}>
                        Team
                    </Tabs.Tab>
                    <Tabs.Tab value="members" title="Members" icon={<UserGroup/>}>
                        Members
                    </Tabs.Tab>
                    <Tabs.Tab value="settings" title="Settings" icon={<UserGroup/>}>
                        Settings
                    </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="info">
                    <SectionHeader title="Team Info" subtitle="Manage your team information" />
                        <UpdateInfoForm team={team} />
                </Tabs.Panel>
                <Tabs.Panel value="members">
                    <SectionHeader title="Team Members" subtitle="Manage your team members" />
                </Tabs.Panel>
                <Tabs.Panel value="settings">
                    <SectionHeader title="Team Settings" subtitle="Manage your team settings" />
                </Tabs.Panel>
            </Tabs>
        </div>
    )
}
