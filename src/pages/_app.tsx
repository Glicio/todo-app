import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { UserProvider } from "~/contexts/UserProvider";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { TodoProvider } from "~/contexts/TodoContext";
import Head from "next/head";

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            void navigator.serviceWorker.register("/sw.js");
        }
        window.addEventListener("beforeinstallprompt", (e) => {
            console.log("BEFORE", e);
        });
    }, []);


    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <meta property="og:title" content="Just Enough To-do" />
                <meta property="og:description" content="A simple to-do app with teams support." />
                <meta property="og:url" content="https://todo.glicio.dev/" />
                <meta property="og:site_name" content="JET" />
                <link
                    rel="manifest"
                    href={"/site.webmanifest"}
                />
                <title>Just Enough To-do</title>
            </Head>
            <SessionProvider session={session}>
                <MantineProvider withGlobalStyles withNormalizeCSS
                    theme={{
                        colorScheme: 'dark',
                        colors: {
                            'secondary-color': ['#502FAC', '#ff0000'],
                        }

                    }}

                >
                    <Notifications />
                    <UserProvider>
                        <TodoProvider>
                            <Component {...pageProps} />
                        </TodoProvider>
                    </UserProvider>
                </MantineProvider>
            </SessionProvider>
        </>
    );
};

export default api.withTRPC(MyApp);
