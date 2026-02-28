import { LinearGradient } from "expo-linear-gradient";

/**
 * Returns the header gradient for the screen.
 * 
 * @returns the linear gradient on the top of every screen.
 */
export default function HeaderGradient() {
    return (
        <LinearGradient
                colors={["#AD948B", "#EAD9D1"]}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 140,
                }}
        />
    );
}