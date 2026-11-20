import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Modal, Pressable, ScrollView, Text } from "react-native";
import { formStyles } from "../FormStyle";
import Entypo from "@expo/vector-icons/Entypo";
import { useState } from "react";

interface DropdownProps<T extends string> {
    label: string;
    /** The currently selected option, shown on the closed button. */
    option: T;
    /** Every option the menu lists, in display order. */
    options: readonly T[];
    setOption: (option: T) => void;
}

/**
 * Single-select dropdown: a button showing the selected option that opens a modal menu.
 *
 * @param label - text shown above the button
 * @param option - the selected option
 * @param options - the options to list in the menu
 * @param setOption - called with the option the user picks
 * @returns the dropdown field.
 */
export default function Dropdown<T extends string>({
    label,
    option,
    options,
    setOption,
}: DropdownProps<T>) {
    const [showDropdown, setShowDropdown] = useState(false);

    // Reports the chosen option and closes the menu.
    const selectOption = (selectedOption: T) => {
        setOption(selectedOption);
        setShowDropdown(false);
    };

    return (
        <View>
            <Text style={formStyles.label}>{label}</Text>
            <Pressable style={formStyles.dropdownButton} onPress={() => setShowDropdown(true)}>
                <Text style={formStyles.dropdownText}>{option}</Text>
                <Entypo name="chevron-down" size={24} color="black" />
            </Pressable>

            <Modal
                visible={showDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDropdown(false)}
            >
                <Pressable style={formStyles.modalOverlay} onPress={() => setShowDropdown(false)}>
                    <View style={formStyles.dropdownMenu}>
                        <ScrollView>
                            {options.map((t) => (
                                <Pressable
                                    key={t}
                                    style={formStyles.dropdownOption}
                                    onPress={() => selectOption(t)}
                                >
                                    <Text style={formStyles.optionText}>{t}</Text>
                                    {option === t && (
                                        <Ionicons name="checkmark" size={24} color="#007AFF" />
                                    )}
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}
