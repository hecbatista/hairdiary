import { supabase } from './supabase';

/**
 * Signs up a new user and creates their profile in the database.
 *
 * @param email - User's email address
 * @param password - User's password
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @param birthDate - User's birthday in YYYY-MM-DD format
 * @param hairJourney - User's bio/hair journey description.
 * @throws {Error} If signup or profile creation fails.
 */
export async function signUpUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    birthDate: string,
    hairJourney: string
) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) throw error;

        if (!data.user) {
            throw new Error('No user data returned from sign up!');
        }

        const { error: profileError } = await supabase.from('Users').insert({
            user_id: data.user?.id,
            hair_journey: hairJourney,
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate,
        });

        if (profileError) throw profileError;
    } catch (error) {
        throw error;
    }
}
