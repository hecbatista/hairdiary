import { fireEvent, render, screen } from "@testing-library/react-native";
import ShortText from "../ShortText";

describe("ShortText", () => {
    it("renders the label, placeholder and current value", () => {
        render(
            <ShortText label="Name" placeHolder="Your name" value="Sam" onChangeText={jest.fn()} />,
        );

        expect(screen.getByText("Name")).toBeOnTheScreen();
        expect(screen.getByPlaceholderText("Your name")).toBeOnTheScreen();
        expect(screen.getByDisplayValue("Sam")).toBeOnTheScreen();
    });

    it("reports typed text through onChangeText", () => {
        const onChangeText = jest.fn();
        render(
            <ShortText label="Name" placeHolder="Your name" value="" onChangeText={onChangeText} />,
        );

        fireEvent.changeText(screen.getByPlaceholderText("Your name"), "Alex");

        expect(onChangeText).toHaveBeenCalledWith("Alex");
    });

    it("is a single-line input", () => {
        render(
            <ShortText label="Name" placeHolder="Your name" value="" onChangeText={jest.fn()} />,
        );

        expect(screen.getByPlaceholderText("Your name")).not.toHaveProp("multiline", true);
    });
});
