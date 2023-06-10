import React from 'react'
import localFont from 'next/font/local'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

const anton = localFont({ 
    src: '../../static/fonts/Anton-Regular.ttf',
})
export default function UserNotAuthed() {

    return <div className="flex flex-col flex-grow w-full items-center justify-center gap-2">
        <h1 className={"text-4xl sm:text-6xl md:text-8xl text-center "+anton.className}>
            Get Things {" "}
            <span className="cool-text">
                Done.
            </span> 
        </h1>
        <p className="max-w-[60%] text-gray-300 text-center">
            Just Enough To-Do is a simple to-do list app that helps you get things done and improves your and your team's productivity.
        </p>
        <p className="text-gray-400 text-xs">
            Please sign in to continue
        </p>
        <div className="flex gap-2">
            <button className="primary-button w-[8rem]"
                onClick={() => {
                    void signIn();
                }}
            >
                Sign in
            </button>
            <Link href="https://github.com/Glicio/todo-app" className="secondary-button w-[8rem]">
                Repository
            </Link>
        </div>

    </div>
}
