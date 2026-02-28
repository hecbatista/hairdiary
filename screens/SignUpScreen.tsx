import { NavigationProp } from '@react-navigation/native';
import { Text, View, StyleSheet, TextInput, Alert } from 'react-native';
import HeaderGradient from '../components/HeaderGradient';
import CustomButton from '../components/CustomButton';
import { useState } from 'react';
import { Colors } from '../colors';
import { signUpUser } from '../lib/supabaseSignUp';

const styles = StyleSheet.create({
    container: { flex: 1, padding: 25, paddingTop: 125, backgroundColor: Colors.background },
    title: { fontSize: 48, textAlign: 'left', fontFamily: 'Poppins-Bold', marginBottom: 10 },
    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
        marginBottom: 15,
        width: '100%',
    },
    smallInput: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        textAlignVertical: 'top',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        flex: 1,
    },
    otherInput: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        textAlignVertical: 'top',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        marginBottom: 15,
    },
});

export default function SignUpScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [year, setYear] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const [hairJourney, setHairJourney] = useState('');

    /**
     * Validates all fields before it is passed to backend to sign up.
     *
     * @returns nothing.
     * @throws {Error} if fields are not filled, passwords don't match, password is less than 6 characters, or something fails.
     */
    const handleSignUp = async () => {
        if (
            !firstName ||
            !lastName ||
            !month ||
            !day ||
            !year ||
            !email ||
            !password ||
            !confirmedPassword
        ) {
            Alert.alert('Error', 'Please fill all required fields!');
            return;
        }

        if (password != confirmedPassword) {
            Alert.alert('Error', "Passwords don't match");
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters!');
            return;
        }

        try {
            const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

            await signUpUser(email, password, firstName, lastName, birthDate, hairJourney);

            Alert.alert('Success', 'Account created succesfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate('Login');
                    },
                },
            ]);
        } catch (error: any) {
            Alert.alert('Signup Failed', error.message || 'An error occured');
        }
    };

    return (
        <View style={styles.container}>
            <HeaderGradient />
            <Text style={styles.title}>Sign Up</Text>
            <View style={styles.nameContainer}>
                <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First Name"
                    style={styles.smallInput}
                />
                <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last Name"
                    style={styles.smallInput}
                />
            </View>
            <View style={styles.nameContainer}>
                <TextInput
                    value={month}
                    onChangeText={setMonth}
                    placeholder="Month"
                    style={styles.smallInput}
                    keyboardType="numeric"
                />
                <TextInput
                    value={day}
                    onChangeText={setDay}
                    placeholder="Day"
                    style={styles.smallInput}
                    keyboardType="numeric"
                />
                <TextInput
                    value={year}
                    onChangeText={setYear}
                    placeholder="Year"
                    style={styles.smallInput}
                    keyboardType="numeric"
                />
            </View>
            <TextInput
                value={hairJourney}
                onChangeText={setHairJourney}
                placeholder="What's your hair journey?"
                style={styles.otherInput}
                multiline
            />
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                style={styles.otherInput}
            />
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                style={styles.otherInput}
                secureTextEntry
            />
            <TextInput
                value={confirmedPassword}
                onChangeText={setConfirmedPassword}
                placeholder="Confirm Password"
                style={styles.otherInput}
                secureTextEntry
            />
            <CustomButton buttonText="SIGN UP" handleSave={handleSignUp} />
        </View>
    );
}
