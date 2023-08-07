import React from 'react';
import UserIcon from '../icons/user_icon';
import Image from 'next/image';


export default function UserProfilePic ({image}: {image?: string}) {
    

    if(!image) {
          return (
            <UserIcon/>
          )
    }
    return (
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
            <Image src={image} alt="user profile pic" width="32" height="32" />
        </div>
    )

}
