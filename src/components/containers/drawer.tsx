import { Drawer } from "@mantine/core"
import React from "react"


export default function DefaultDrawer({children, opened, onClose}: {children: React.ReactNode, opened: boolean, onClose: () => void}) {
    return (
        <Drawer opened={opened} onClose={onClose}>
            {children}
        </Drawer>
    )
}

