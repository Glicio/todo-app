
import { notifications } from "@mantine/notifications";
import { GetServerSideProps, type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useContext } from "react";
import ErrorIcon from "~/components/icons/erro_icon";
import MainLayout from "~/components/layouts/main_layout";
import { userContext } from "~/contexts/UserProvider";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";

interface InviteProps {
    id: string;
    email?: string;
    team: {
        name: string;
        color: string;
    },
    inviter: {
        name: string;
        email: string;
    },
}

const Home: NextPage<InviteProps> = ({ id, team, inviter }) => {
    const router = useRouter();
    const { data: session } = useSession();
    const { setTeams } = useContext(userContext);
    const acceptMutation = api.teams.acceptInvitation.useMutation({
        onSuccess: (team) => {
            setTeams((teams) => [...teams, team]);
            notifications.show({
                title: "Success",
                message: "You have successfully joined the team",
                color: "green",
            })
            void router.push("/")
        },
        onError: (error) => {
            console.log(error);
            notifications.show({
                title: "Error",
                message: "An error occured while accepting the invitation",
                color: "red",
                icon: <ErrorIcon/>
                })
        }
    });

    return (
        <>
            <MainLayout>
                <div className="max-w-3xl mx-auto w-full flex-grow flex flex-col gap-2 justify-center items-center p-4">
                    <h1 className="text-3xl font-bold flex flex-col items-center">
                        You have been invited to join <br /><span className="text-[var(--secondary-color)]">{team.name}</span>
                    </h1>
                    <p className="text-gray-400">
                        You have been invited by <span className="font-bold text-[var(--secondary-color)]">{inviter.name}</span> to join his team: <span className="font-bold text-[var(--secondary-color)]">{team.name} </span>
                    </p>
                    {session?.user ?
                        <div className="flex gap-4 w-full justify-center">
                            <button className="secondary-button w-[8rem]">
                                Decline
                            </button>
                            <button className="primary-button w-[8rem]"
                                onClick={() => {
                                    if (!session?.user) return;

                                    acceptMutation.mutate({
                                        invitationId: id,
                                    });
                                }}
                            >
                                Accept
                            </button>
                        </div> : <div className="w-full flex justify-center">
                            <button className="primary-button whitespace-nowrap" onClick={() => {
                                void signIn(undefined, { callbackUrl: `/join-team/${id}` });
                            }}>
                                Sign in to accept
                            </button>
                        </div>}
                </div>
            </MainLayout>
        </>
    );
};

export default Home;


export const getServerSideProps: GetServerSideProps<InviteProps> = async ({ query, req, res }) => {
    const { id } = query;
    const invite = await prisma.teamInvitation.findUnique({
        where: {
            id: id as string
        },
        include: {
            team: {
                select: {
                    name: true,
                    color: true,
                },
            },
            invitedBy: {
                select: {
                    name: true,
                    email: true,
                }
            }
        }
    });
    const session = await getServerAuthSession({ req, res });
    if (session) {
        if (invite?.email && session.user.email !== invite?.email) {
            return {
                redirect: {
                    destination: "/",
                    permanent: false,
                }
            }
        }
    }
    return {
        props: {
            id: id as string,
            email: invite?.email || "",
            team: {
                name: invite?.team.name || "",
                color: invite?.team.color || "",
            },
            inviter: {
                name: invite?.invitedBy.name || "",
                email: invite?.invitedBy.email || "",
            }
        }
    }
}

