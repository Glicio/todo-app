import React from "react";
import FormItem from "./form_item";
import { ColorPicker } from "@mantine/core";
import { validColors } from "~/utils/valid_colors";

export default function SelectColor({
    color,
    setColor,
}: {
    color?: string | null;
    setColor: (color: string) => void;
}) {
    return (
        <FormItem label="Select Color">
            <button
                type="button"
                className="flex h-8 w-full items-center justify-center border border-[var(--tertiary-color)]"
                onClick={() => {
                    setColor("");
                }}
                style={{
                    backgroundColor: color || "",
                }}
            >
                {color ? "" : <span>No color</span>}
            </button>
            <ColorPicker
                value={color || ""}
                withPicker={false}
                swatches={validColors}
                onChange={(color) => {
                    setColor(color);
                }}
            />
        </FormItem>
    );
}
