import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { supabase } from './lib/supabase';

export default function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const signUp = async () => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setMessage(error.message);
    else setMessage('Check your email!');
    };

    const signIn = async () => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMessage(error.message);
    else setMessage('Logged in!');
    };

    return (
        <View style={{ padding: 20, marginTop: 100 }}>
            <Text>Email:</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
            />
            <Text>Password:</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
            />
            <Button title="Sign Up" onPress={signUp} />
            <Button title="Sign In" onPress={signIn} />
            <Text>{message}</Text>
        </View>
    );
    }