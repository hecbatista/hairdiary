import { fireEvent, render, screen } from "@testing-library/react-native";
import { ENTRY_TYPES } from "../../../../type";
import Dropdown from "../Dropdown";

describe("Dropdown", () => {
    it("shows the label and the selected option with the menu closed", () => {
        render(<Dropdown label="Entry type" option="Wash" setOption={jest.fn()} />);

        expect(screen.getByText("Entry type")).toBeOnTheScreen();
        expect(screen.getByText("Wash")).toBeOnTheScreen();
        expect(screen.queryByText("Haircut")).not.toBeOnTheScreen();
    });

    it("lists every entry type when opened", () => {
        render(<Dropdown label="Entry type" option="Wash" setOption={jest.fn()} />);

        fireEvent.press(screen.getByText("Wash"));

        for (const type of ENTRY_TYPES) {
            expect(screen.getAllByText(type).length).toBeGreaterThan(0);
        }
    });

    it("marks the selected option with a checkmark", () => {
        render(<Dropdown label="Entry type" option="Haircut" setOption={jest.fn()} />);

        fireEvent.press(screen.getByText("Haircut"));

        expect(screen.getAllByTestId("icon-checkmark")).toHaveLength(1);
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
