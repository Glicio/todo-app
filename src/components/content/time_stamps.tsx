import React from 'react'

export default function TimeStamps({createdByName, createdAt, updatedByName, updatedAt}: {
    createdByName?: string;
    createdAt?: Date;
    updatedByName?: string;
    updatedAt?: Date;
}) {

    return (

        <div className="timestamps pt-1 "
            style={{ fontSize: "10px", lineHeight: "10px"  }}
        >
            <div className="created">
                Created 
                {createdByName ? <>by{" "}
                <span className="font-bold">
                    {createdByName}
                </span>{" "}</> : " "}
                {createdAt ? <>
                at{" "}
                <span className="font-bold">
                    {createdAt.toLocaleString()}
                </span></> : null}
            </div>
            {updatedAt ? (
                <div className="updated">
                    Last update{" "}
                    {updatedByName ? (
                        <>
                            {"by "}
                            <span className="font-bold">
                                {updatedByName}
                            </span>{" "}
                        </>
                    ) : (
                        " "
                    )}
                    at{" "}
                    <span className="font-bold">
                        {updatedAt.toLocaleString()}
                    </span>
                </div>
            ) : null}
        </div>
    )
}
