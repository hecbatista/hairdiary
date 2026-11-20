import { readFileSync } from "fs";
import { join } from "path";

import { Colors } from "../colors";

/** Deprecated `Colors` keys and the token each one mirrors. */
const ALIASES: Record<string, string> = {
    text: "foreground",
    mutedText: "muted-foreground",
};

/** Reads the "R G B" triplets from the `:root` block in global.css, as uppercase hex. */
function readColorTokens(): Map<string, string> {
    const css = readFileSync(join(__dirname, "..", "global.css"), "utf8");
    const root = css.match(/:root\s*\{([^}]*)\}/);
    if (!root) {
        throw new Error("global.css has no :root block");
    }

    const tokens = new Map<string, string>();
    for (const [, name, r, g, b] of root[1].matchAll(/--([\w-]+):\s*(\d+)\s+(\d+)\s+(\d+);/g)) {
        const hex = [r, g, b].map((c) => Number(c).toString(16).padStart(2, "0")).join("");
        tokens.set(name, `#${hex.toUpperCase()}`);
    }
    return tokens;
}

/** `secondaryStrong` -> `secondary-strong` */
function tokenName(key: string): string {
    return ALIASES[key] ?? key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

describe("Colors", () => {
    const tokens = readColorTokens();

    it("reads the color tokens from global.css", () => {
        expect(tokens.get("background")).toBe("#EAD9D1");
    });

    it.each(Object.entries(Colors))("%s matches its global.css token", (key, value) => {
        expect(tokens.get(tokenName(key))).toBe(value.toUpperCase());
    });
});
