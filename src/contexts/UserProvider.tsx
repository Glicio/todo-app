import { Team } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";
import { api } from "~/utils/api";

type AgentType = "user" | "team";

interface Agent {
    id: string;
    name?: string | null;
    image?: string | null;
    color?: string | null;
    ownerId?: string | null;
}

const agentInitialState: Agent = {
    id: "",
    name: "",
};

    

export const userContext = React.createContext<{
    agentType: AgentType;
    agent: Agent | null;
    teams: Team[];
    setTeams: (teamDispatch: (teams: Team[]) => Team[]) => void;
    setAgent: (agentType: AgentType, agent: Agent) => void;
    refresh: () => void;
}>({
    agentType: "user",
    agent: agentInitialState,
    setAgent: () => {
        console.log("setAgent not implemented");
    },
    teams: [],
    setTeams: () => {return},
    refresh: () => {return},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session } = useSession();

    const [agentType, setAgentType] = React.useState<AgentType>("user");
    const [agent, setAgent] = React.useState<Agent | null>(null);
    const [teams, setTeams] = React.useState<Team[]>([]);
    React.useEffect(() => {
        if (session?.user && session.user.id && !agent) {
            setAgentType("user");
            setAgent(session.user);
        }
    }, [session]);
    
    const teamsQuery = api.teams.getUserTeams.useQuery(undefined, {
        enabled: !!agent?.id && !!agentType,
        refetchOnWindowFocus: false,
    })

    const setNewAgent = (agentType: AgentType, agent: Agent) => {
        setAgentType(agentType);
        setAgent(agent);
    };

    React.useEffect(() => {
        if(teamsQuery.data){
            setTeams(teamsQuery.data)
        }
    }, [teamsQuery.data])

    return (
        <userContext.Provider
            value={{
                agentType,
                agent,
                setAgent: setNewAgent,
                teams: teams ?? [],
                setTeams: (teamDispatch: (teams: Team[]) => Team[]) => {
                        setTeams(teamDispatch)
                        },
                refresh: () => {void teamsQuery.refetch()},
            }}
        >
            {children}
        </userContext.Provider>
    );
};
