import { Avatar, Badge } from '@mantine/core';
import React from 'react'



 export default function Member({ member, isOwner }: {
    member: {
        id: string;
        name: string | null;
        email: string | null;
        image?: string | null;
    },
    isOwner: boolean;
}) {
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
