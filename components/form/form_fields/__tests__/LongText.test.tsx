import { fireEvent, render, screen } from "@testing-library/react-native";
import LongText from "../LongText";

describe("LongText", () => {
    it("renders the label, placeholder and current value", () => {
        render(
            <LongText
                label="Notes"
                placeHolder="How did it go?"
                value="Lots of shine"
                onChangeText={jest.fn()}
            />,
        );

        expect(screen.getByText("Notes")).toBeOnTheScreen();
        expect(screen.getByPlaceholderText("How did it go?")).toBeOnTheScreen();
        expect(screen.getByDisplayValue("Lots of shine")).toBeOnTheScreen();
    });

    it("reports typed text through onChangeText", () => {
        const onChangeText = jest.fn();
        render(
            <LongText
                label="Notes"
                placeHolder="How did it go?"
                value=""
                onChangeText={onChangeText}
            />,
        );

        fireEvent.changeText(screen.getByPlaceholderText("How did it go?"), "Line one\nLine two");

        expect(onChangeText).toHaveBeenCalledWith("Line one\nLine two");
    });

    it("accepts multiple lines", () => {
        render(
            <LongText
                label="Notes"
                placeHolder="How did it go?"
                value=""
                onChangeText={jest.fn()}
            />,
        );

        expect(screen.getByPlaceholderText("How did it go?")).toHaveProp("multiline", true);
    });
});
