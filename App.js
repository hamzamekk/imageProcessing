import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {View, Text} from 'react-native';
import {Home, RTFMD, RTHD, RTOD, RTTD} from './Screens';

const Stack = createNativeStackNavigator();

export const App = () => {
  return (
    <View style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen
            name="RTOD"
            component={RTOD}
            options={{title: 'Real Time Object detection'}}
          />
          <Stack.Screen
            name="RTTD"
            component={RTTD}
            options={{title: 'Real Time Text detection'}}
          />
          <Stack.Screen
            name="RTHD"
            component={RTHD}
            options={{title: 'Real Time hand detection'}}
          />
          <Stack.Screen
            name="RTFMD"
            component={RTFMD}
            options={{title: 'Real Time Face mesh detection'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default App;
