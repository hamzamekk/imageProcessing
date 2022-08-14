import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from 'react-native';
import * as tf from '@tensorflow/tfjs';
import * as toxicity from '@tensorflow-models/toxicity';
import '@tensorflow/tfjs-react-native/dist/platform_react_native';
import '@tensorflow/tfjs-react-native';

const threshold = 0.1;

export const RTTD = () => {
  const [model, setModel] = useState(null);
  const [text, setText] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      await tf.ready();
      const mod = await toxicity.load(threshold);
      console.log(mod);
      setModel(mod);
    })();
  }, []);

  useEffect(() => {
    if (text) {
      model
        .classify(text)
        .then(predictions => {
          const data = [];
          predictions.map(item => {
            item?.results.map(prob => {
              console.log(prob.match);
              if (prob?.match) {
                data.push({
                  label: item?.label,
                  probabilities: prob?.probabilities[1].toFixed(1) * 100 + '%',
                  // prob?.probabilities[1].toFixed(2) * 100 +
                  // '%',
                });
              }
            });
          });
          setData(data);
        })
        .catch(e => console.log(e));
    }
  }, [text]);

  if (!model) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>LOADING ...</Text>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={style.container}>
      <Text style={style.text}>Enter a Text :</Text>
      <TextInput value={text} onChangeText={setText} style={{borderWidth: 1}} />

      {data.length === 0 && (
        <Text style={style.emptyText}>
          nothing in this Text, try another Text
        </Text>
      )}
      {data.map((item, index) => (
        <Text key={index} style={style.probabilities}>
          {item?.label} : {item?.probabilities}
        </Text>
      ))}
    </View>
  );
};

const style = StyleSheet.create({
  container: {flex: 1},
  text: {textAlign: 'center', fontSize: 20, marginVertical: 10},
  emptyText: {textAlign: 'center', fontSize: 18, marginVertical: 10},
  probabilities: {textAlign: 'center', fontSize: 18, marginVertical: 10},
});
