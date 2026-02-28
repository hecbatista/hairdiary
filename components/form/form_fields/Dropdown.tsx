import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Modal, Pressable, ScrollView, Text } from "react-native";
import { ENTRY_TYPES, EntryType } from "../../../type";
import { formStyles } from "../FormStyle";
import Entypo from "@expo/vector-icons/Entypo";
import { useState } from "react";

interface dropdownProps {
    label: string;
    option: any;
    setOption: (constant: any) => void;
}

export default function Dropdown({ label, option, setOption } : dropdownProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Resets dropdown modal after selecting type.
    const selectOption = (selectedOption: any) => {
        setOption(selectedOption);
        setShowDropdown(false);
    }
    
    return (
        <View>
            <Text style={formStyles.label}>{label}</Text>
            <Pressable style={formStyles.dropdownButton} onPress={() => setShowDropdown(true)}>
                <Text style={formStyles.dropdownText}>{option}</Text>
                <Entypo name="chevron-down" size={24} color="black"/>
             </Pressable>

            <Modal
                    visible={showDropdown}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDropdown(false)}
                >
                    <Pressable
                        style={formStyles.modalOverlay}
                        onPress={() => setShowDropdown(false)}
                    >
                        <View style={formStyles.dropdownMenu}>
                            <ScrollView>
                                    {ENTRY_TYPES.map((t) => (
                                        <Pressable
                                            key={t}
                                            style={formStyles.dropdownOption}
                                            onPress={() => selectOption(t as any)}
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