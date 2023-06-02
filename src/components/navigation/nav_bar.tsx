import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";


const UserMenu = () => {
    const {data: session} = useSession()

    return (
        <div className="absolute flex flex-col w-40 gap-2 top-10 right-2 bg-gray-800 p-4 rounded" >
            <span>Hi, {session?.user?.name || "User"}</span>
            <div className="border-b"></div>
            <button 
            className="primary-button"
            onClick={() => {
                void signOut()
            }}>Logout</button>
        </div>
    )
}

const UserIcon = () => {
    return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    )
}


const UserButton = () => {
    const { data: session } = useSession()
    const [showMenu, setShowMenu] = React.useState(false)

    const ref = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const listener = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setShowMenu(false)
            }
        }
        document.addEventListener("click", listener)
        return () => {
            document.removeEventListener("click", listener)
        }
    }, [])

    return (
        <div className="flex items-center relative" ref={ref}>
            {showMenu && <UserMenu  />}
            <button onClick={() => {
                if (!session?.user) {
                    return void signIn()
                }
                setShowMenu(!showMenu)
            }}>
                {session?.user?.image ? <Image alt="user profile pick" width="200" height="200" src={session?.user?.image} className="w-6 h-6 rounded-full" /> : <UserIcon />}
            </button>
        </div>
    )

}


export default function NavBar() {


    return (
        <div className="flex w-full h-12 bg-primary items-center p-4 border-b border-[var(--tertiary-color)]">
            <span className="font-bold text-[var(--secondary-color)]">JET</span>
            <div className="ml-auto">
                <UserButton />
            </div>
        </div>
    )
}
