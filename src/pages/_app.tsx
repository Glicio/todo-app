import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { UserProvider } from "~/contexts/UserProvider";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { TodoProvider } from "~/contexts/TodoContext";

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <SessionProvider session={session}>
            <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'dark'}}>
                <Notifications />
                <UserProvider>
                    <TodoProvider>
                    <Component {...pageProps} />
                    </TodoProvider>
                </UserProvider>
            </MantineProvider>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
