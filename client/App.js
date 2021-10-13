import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

export default function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const axiosJWT = axios.create()

  const refreshToken = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/refresh',
        {
          token: user.refreshToken,
        }
      );
      console.log('res', res);
      if (res.status == 200) {
        setUser({
          ...user,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        });
        console.log('res.data', res.data);
        return res.data;
      }
    } catch (error) {
      Alert.alert(
        "Authentication Demo",
        `${error.response.status} - ${error.response.data}`,
      );
      setUser(null);
    }
  }

  axiosJWT.interceptors.request.use(
    async (config) => {
      if (user) {
        let currentDate = new Date();
        const decodedToken = jwt_decode(user.accessToken);
        if (decodedToken.exp * 1000 < currentDate.getTime()) {
          const data = await refreshToken();
          config.headers["authorization"] = "Bearer " + data.accessToken;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  )

  const handleSubmit = async () => {
    try {

      const res = await axios.post(
        'http://localhost:5000/api/login',
        {
          username,
          password,
        }
      );
      if (res.status == 200) {
        setUser(res.data);
        setUsername("");
        setPassword("");
      }
    } catch (error) {
      Alert.alert(
        "Authentication Demo",
        `${error.response.status} - ${error.response.data}`,
      );
    }
  }

  const handleDelete = async (id) => {
    try {
      await axiosJWT.delete(
        "http://localhost:5000/api/users/" + id,
        {
          headers: { authorization: `Bearer ${user.accessToken}` },
        }
      );
      Alert.alert(
        "Authentication Demo",
        "Deleted user successfully",
      );
    } catch (error) {
      Alert.alert(
        "Authentication Demo",
        `${error.response.status} - ${error.response.data}`,
      );
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axiosJWT.post(
        'http://localhost:5000/api/logout',
        {
          token: user.refreshToken,
        },
        {
          headers: { authorization: `Bearer ${user.accessToken}` },
        }
      );
      if (res.status == 200) {
        setUser(null);
      }
    } catch (error) {
      Alert.alert(
        "Authentication Demo",
        `${error.response.status} - ${error.response.data}`,
      );
      if (error.response.status === 403) {
        setUser(null);
      }
    }
  }

  const renderLoginView = () => {
    return (
      <View style={styles.centerView}>
        <Text style={styles.title}>Authentication Demo</Text>
        <View style={styles.textInputContainer}>
          <Text>Username</Text>
          <TextInput
            style={styles.textInput}
            value={username}
            placeholder={"Input username"}
            onChangeText={setUsername}
          />
        </View>
        <View style={styles.textInputContainer}>
          <Text>Password</Text>
          <TextInput
            style={styles.textInput}
            value={password}
            placeholder={"Input password"}
            secureTextEntry
            onChangeText={setPassword}
          />
        </View>
        <Button 
          title="Login"
          color="green"
          onPress={handleSubmit}
        />
      </View>
    )
  }

  const renderMainView = () => {
    return(
      <View style={styles.centerView}>
        <Text style={styles.title}>Main View</Text>
        <Text style={styles.description}>{`Welcome, ${user.isAdmin ? 'admin' : 'user'} ${user.username}`}</Text>
        <Button 
          title="Delete Phu"
          color="blue"
          onPress={() => handleDelete(1)}
        />
        <Button 
          title="Delete Duy"
          color="black"
          onPress={() => handleDelete(2)}
        />
        <Button 
          title="Refresh Token"
          color="pink"
          onPress={() => refreshToken()}
        />
        <Button 
          title="Logout"
          color="red"
          onPress={() => handleLogout()}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {user
        ? renderMainView()
        : renderLoginView()
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3D3D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerView: {
    width: '60%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  title: {
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 18,
    color: 'green',
    paddingBottom: 10,
  },
  description: {
    textAlign: 'center',
    alignSelf: 'center',
    paddingBottom: 10,
  },
  textInputContainer: {
    paddingVertical: 10,
  },
  textInput: {
    paddingVertical: 5,
    paddingVertical: 2.5,
  },
});
