import { useSession } from "next-auth/react";
import React from "react";

type AgentType = "user" | "team";

interface Agent {
    id: string;
    name?: string | null;
    image?: string | null;
    color?: string | null;
}

const agentInitialState: Agent = {
    id: "",
    name: "",
};

    

export const userContext = React.createContext<{
    agentType: AgentType;
    agent: Agent | null;
    setAgent: (agentType: AgentType, agent: Agent) => void;
}>({
    agentType: "user",
    agent: agentInitialState,
    setAgent: () => {
        console.log("setAgent not implemented");
    },
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session } = useSession();

    const [agentType, setAgentType] = React.useState<AgentType>("user");
    const [agent, setAgent] = React.useState<Agent | null>(null);

    React.useEffect(() => {
        if (session?.user && session.user.id && !agent) {
            setAgentType("user");
            setAgent(session.user);
        }
    }, [session]);
    

    const setNewAgent = (agentType: AgentType, agent: Agent) => {
        setAgentType(agentType);
        setAgent(agent);
    };

    return (
        <userContext.Provider
            value={{
                agentType,
                agent,
                setAgent: setNewAgent,
            }}
        >
            {children}
        </userContext.Provider>
    );
};
