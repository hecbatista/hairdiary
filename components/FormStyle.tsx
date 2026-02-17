import { StyleSheet } from "react-native";

export const formStyles = StyleSheet.create({
    formContainer: { borderRadius: 16, backgroundColor: "#AD948B", padding: 24 },
    label: { fontSize: 16, marginBottom: 8, fontFamily: "Poppins-Regular" },
    dropdownButton: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24
    },
    dropdownText: {
        fontSize: 16,
        fontFamily: "Poppins-Regular"
    },
    bigInput: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        minHeight: 120,
        textAlignVertical: "top",
        marginBottom: 24,
        fontFamily: "Poppins-Regular",
        fontSize: 16
    },
    submitButton: {
        backgroundColor: "#1E1E1E",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center"
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontFamily: "Poppins-SemiBold"
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    dropdownMenu: {
        backgroundColor: "white",
        overflow: "hidden",
        borderRadius: 12,
        width: "80%",
        maxHeight: 400,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    dropdownOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    optionText: {
        fontSize: 16,
        fontFamily: "Poppins-Regular",
        color: "#000"
    },
    smallInput: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        textAlignVertical: "top",
        marginBottom: 24,
        fontFamily: "Poppins-Regular",
        fontSize: 16
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: "top",
    },
    avatarWrap: {
        alignSelf: "center",
        marginBottom: 16,
        position: "relative",
        overflow: "hidden"
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 14,
        opacity: 0.7,
    },
    editBadgeOuter: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 38,
        height: 38,
        backgroundColor: "#AD948B",
        borderRadius: 21,
        justifyContent: "center",
        alignItems: "center"
    },
    editBadgeInner: {
        width: 32,
        height: 32,
        borderRadius: 18,
        backgroundColor: "#2A2A2A",
        justifyContent: "center",
        alignItems: "center"
    }
});