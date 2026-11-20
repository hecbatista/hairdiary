import { fireEvent, render, screen, within } from "@testing-library/react-native";
import { ENTRY_TYPES } from "../../../../type";
import Dropdown from "../Dropdown";

/** An element returned by a Testing Library query. */
type Element = ReturnType<typeof screen.getByTestId>;

/**
 * Returns the text of the nearest ancestor of `element` that contains any text: for an icon
 * inside a menu row, that's the row's label.
 */
function labelOfRow(element: Element): string[] {
    let node = element.parent;
    while (node) {
        const texts = within(node).queryAllByText(/.+/);
        if (texts.length > 0) {
            return texts.map((text) => String(text.props.children));
        }
        node = node.parent;
    }
    return [];
}

describe("Dropdown", () => {
    it("shows the label and the selected option with the menu closed", () => {
        render(<Dropdown label="Entry type" option="Wash" setOption={jest.fn()} />);

        expect(screen.getByText("Entry type")).toBeOnTheScreen();
        expect(screen.getByText("Wash")).toBeOnTheScreen();
        expect(screen.queryByText("Haircut")).not.toBeOnTheScreen();
    });

    it("lists every entry type exactly once when opened", () => {
        render(<Dropdown label="Entry type" option="Wash" setOption={jest.fn()} />);

        fireEvent.press(screen.getByText("Wash"));

        for (const type of ENTRY_TYPES) {
            // The selected option also shows on the closed button, so it appears twice.
            const expected = type === "Wash" ? 2 : 1;
            expect(screen.getAllByText(type)).toHaveLength(expected);
        }
    });

    it("marks only the selected option with a checkmark", () => {
        render(<Dropdown label="Entry type" option="Haircut" setOption={jest.fn()} />);

        fireEvent.press(screen.getByText("Haircut"));

        const checkmarks = screen.getAllByTestId("icon-checkmark");
        expect(checkmarks).toHaveLength(1);
        expect(labelOfRow(checkmarks[0])).toEqual(["Haircut"]);
    });

    it("reports the chosen option and closes the menu", () => {
        const setOption = jest.fn();
        render(<Dropdown label="Entry type" option="Wash" setOption={setOption} />);

        fireEvent.press(screen.getByText("Wash"));
        fireEvent.press(screen.getByText("Good Hair Day"));

        expect(setOption).toHaveBeenCalledWith("Good Hair Day");
        expect(screen.queryByText("Good Hair Day")).not.toBeOnTheScreen();
    });
});
