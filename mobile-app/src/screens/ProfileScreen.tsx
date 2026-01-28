import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Avatar, Button, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ProfileScreen() {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();

    const handleLogout = async () => {
        await dispatch(logout());
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text
                    size={80}
                    label={`${user?.profile?.firstName?.charAt(0)}${user?.profile?.lastName?.charAt(0)}`}
                    style={styles.avatar}
                />
                <Text variant="headlineSmall" style={styles.name}>
                    {user?.profile?.firstName} {user?.profile?.lastName}
                </Text>
                <Text variant="bodyMedium" style={styles.email}>
                    {user?.email}
                </Text>
            </View>

            <View style={styles.section}>
                <List.Section>
                    <List.Subheader>Account Settings</List.Subheader>

                    <List.Item
                        title="Personal Information"
                        description="Update your profile"
                        left={props => <List.Icon {...props} icon="account" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => { }}
                    />

                    <Divider />

                    <List.Item
                        title="Biometric Authentication"
                        description="Enable fingerprint/face ID"
                        left={props => <List.Icon {...props} icon="fingerprint" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => { }}
                    />

                    <Divider />

                    <List.Item
                        title="Notifications"
                        description="Manage notification preferences"
                        left={props => <List.Icon {...props} icon="bell" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => { }}
                    />
                </List.Section>
            </View>

            <View style={styles.section}>
                <List.Section>
                    <List.Subheader>Support & Information</List.Subheader>

                    <List.Item
                        title="Help & Support"
                        description="Get help with the app"
                        left={props => <List.Icon {...props} icon="help-circle" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => { }}
                    />

                    <Divider />

                    <List.Item
                        title="Privacy Policy"
                        description="Read our privacy policy"
                        left={props => <List.Icon {...props} icon="shield-check" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => { }}
                    />

                    <Divider />

                    <List.Item
                        title="Terms of Service"
                        description="Read our terms"
                        left={props => <List.Icon {...props} icon="file-document" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => { }}
                    />
                </List.Section>
            </View>

            <View style={styles.section}>
                <Button
                    mode="outlined"
                    onPress={handleLogout}
                    icon="logout"
                    style={styles.logoutButton}
                    textColor="#d32f2f"
                >
                    Logout
                </Button>
            </View>

            <View style={styles.footer}>
                <Text variant="bodySmall" style={styles.version}>
                    Version 1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    avatar: {
        backgroundColor: '#0ea5e9',
    },
    name: {
        marginTop: 15,
        fontWeight: 'bold',
    },
    email: {
        marginTop: 5,
        color: '#666',
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    logoutButton: {
        margin: 20,
        borderColor: '#d32f2f',
    },
    footer: {
        alignItems: 'center',
        padding: 20,
    },
    version: {
        color: '#999',
    },
});
