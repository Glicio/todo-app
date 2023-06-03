import { Loader } from "@mantine/core";
import React from "react";


export default function LoadingIcon({color}: {color: string}) {
    return (
        <Loader color={color ? color : "var(--tertiary-color)"} size="sm"/>
    )
}
