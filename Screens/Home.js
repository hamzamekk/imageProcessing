import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

const screens = [
  {
    name: 'Real Time Object Detections',
    screen: 'RTOD',
  },
  {
    name: 'Real Time Text Detection',
    screen: 'RTTD',
  },
];

export const Home = () => {
  const {navigate} = useNavigation();

  return (
    <View style={styles.container}>
      {screens.map((item, index) => (
        <Pressable
          key={index}
          style={styles.pressable}
          onPress={() => navigate(item?.screen)}>
          <Text>{item?.name}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pressable: {
    padding: 10,
    margin: 10,
    borderWidth: 1,
  },
});
