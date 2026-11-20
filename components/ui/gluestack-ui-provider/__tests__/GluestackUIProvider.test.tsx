import { readFileSync } from "fs";
import { join } from "path";

import tailwind from "@tailwindcss/postcss";
import { render, screen } from "@testing-library/react-native";
import postcss from "postcss";
import { Text, View } from "react-native";
import { registerCSS } from "react-native-css/jest";

import { Colors } from "../../../../colors";
import { GluestackUIProvider } from "..";

const GLOBAL_CSS = join(__dirname, "..", "..", "..", "..", "global.css");

/**
 * Compiles global.css with Tailwind, as Metro does in the app, generating only `classes`.
 * The compiled styles are then registered with react-native-css for the next render.
 */
async function registerTailwind(classes: string[]) {
    const css = readFileSync(GLOBAL_CSS, "utf8").replace(
        '@import "tailwindcss/utilities.css";',
        `@import "tailwindcss/utilities.css" source(none);\n@source inline("${classes.join(" ")}");`,
    );
    const result = await postcss([tailwind()]).process(css, { from: GLOBAL_CSS });
    registerCSS(result.css, { inlineRem: 16 });
}

describe("GluestackUIProvider", () => {
    it("renders its children", () => {
        render(
            <GluestackUIProvider mode="light">
                <Text>Hair Diary</Text>
            </GluestackUIProvider>,
        );

        expect(screen.getByText("Hair Diary")).toBeTruthy();
    });

    it("styles className with the global.css tokens", async () => {
        await registerTailwind([
            "bg-secondary",
            "rounded-control",
            "p-4",
            "text-title-3",
            "font-poppins-semibold",
            "text-secondary-strong",
        ]);

        render(
            <GluestackUIProvider mode="light">
                <View testID="panel" className="bg-secondary rounded-control p-4" />
                <Text className="text-title-3 font-poppins-semibold text-secondary-strong">
                    Entries
                </Text>
            </GluestackUIProvider>,
        );

        expect(screen.getByTestId("panel")).toHaveStyle({
            backgroundColor: Colors.secondary.toLowerCase(),
            borderRadius: 12,
            padding: 16,
        });
        expect(screen.getByText("Entries")).toHaveStyle({
            fontSize: 20,
            lineHeight: 28,
            fontFamily: "Poppins-SemiBold",
            color: Colors.secondaryStrong.toLowerCase(),
        });
    });
});
