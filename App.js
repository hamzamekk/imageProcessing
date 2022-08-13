// import React, {useEffect, useRef, useState} from 'react';
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   Platform,
//   LogBox,
//   useWindowDimensions,
//   StyleSheet,
// } from 'react-native';
// import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-react-native/dist/platform_react_native';
// require('@tensorflow/tfjs-backend-cpu');
// require('@tensorflow/tfjs-backend-webgl');
// import * as cocoSsd from '@tensorflow-models/coco-ssd';
// import {cameraWithTensors} from '@tensorflow/tfjs-react-native';
// import {Camera} from 'expo-camera';
// import Canvas from 'react-native-canvas';

// const TensorCamera = cameraWithTensors(Camera);

// LogBox.ignoreAllLogs();

// const textureDims =
//   Platform.OS === 'ios'
//     ? {
//         height: 1920,
//         width: 1080,
//       }
//     : {
//         height: 1200,
//         width: 1600,
//       };

// const App = () => {
//   const [net, setNet] = useState(null);
//   let context = useRef();
//   let canvas = useRef();

//   const {width, height} = useWindowDimensions();

//   useEffect(() => {
//     (async () => {
//       const {statue} = Camera.requestCameraPermissionsAsync();
//       await tf.ready();
//       const model = await cocoSsd.load({base: 'mobilenet_v2'});
//       setNet(model);
//     })();
//   }, []);

//   const handleCameraStream = (images, updatePreview, gl) => {
//     const loop = async () => {
//       const nextImageTensor = images.next().value;

//       const prediction = await net.detect(nextImageTensor);
//       drawRectangle(prediction, nextImageTensor);
//       tf.dispose([nextImageTensor]);
//       // net.dispose();
//       updatePreview();
//       gl.endFrameEXP();
//       // console.log(prediction);

//       requestAnimationFrame(loop);
//     };
//     loop();
//   };

//   const hadleCanvas = async can => {
//     if (can) {
//       can.width = width;
//       can.height = height;
//       const ctx = can.getContext('2d');
//       ctx.strokeStyle = 'green';
//       ctx.fillStyle = 'green';
//       ctx.lineWidth = 3;
//       ctx.font = '30px Verdana';

//       context.current = ctx;
//       canvas.current = can;
//     }
//   };

//   const drawRectangle = (predictions, nextImageTensor) => {
//     if (!context.current || !canvas.current) {
//       return;
//     }

//     // to match size of camera
//     const scaleWidth = width / nextImageTensor.shape[1];
//     const scaleHeight = height / nextImageTensor.shape[0];

//     const flipHorizontal = true;

//     context.current.clearRect(0, 0, width, height);

//     for (const prediction of predictions) {
//       const [x, y, width, height] = prediction.bbox;

//       const boundingBoxX =
//         canvas.current.width - x * scaleWidth - width * scaleWidth;
//       const boundingBoxY = y * scaleHeight;

//       context.current.strokeRect(
//         boundingBoxX,
//         boundingBoxY,
//         width * scaleWidth,
//         height * scaleHeight,
//       );

//       context.current.strokeText(
//         prediction.class,
//         boundingBoxX - 5,
//         boundingBoxY - 5,
//       );
//     }
//   };

//   if (!net) {
//     return (
//       <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
//         <Text>LOADING ...</Text>
//         <ActivityIndicator />
//       </View>
//     );
//   }
//   return (
//     <View style={styles.container}>
//       <TensorCamera
//         // Standard Camera props
//         style={styles.camera}
//         type={Camera.Constants.Type.back}
//         // Tensor related props
//         cameraTextureHeight={textureDims.height}
//         cameraTextureWidth={textureDims.width}
//         resizeHeight={200}
//         resizeWidth={152}
//         resizeDepth={3}
//         onReady={handleCameraStream}
//         autorender={false}
//       />
//       <Canvas style={styles.canvas} ref={hadleCanvas} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1},
//   camera: {flex: 1},
//   canvas: {
//     position: 'absolute',
//     zIndex: 100,
//     width: '100%',
//     height: '100%',
//   },
// });

// export default App;

//text detection

import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, TextInput} from 'react-native';
import * as tf from '@tensorflow/tfjs';
import * as toxicity from '@tensorflow-models/toxicity';
import '@tensorflow/tfjs-react-native/dist/platform_react_native';
import '@tensorflow/tfjs-react-native';

const threshold = 0.1;

const App = () => {
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

  console.log(data);
  return (
    <View style={{flex: 1}}>
      <Text style={{textAlign: 'center', fontSize: 20, marginVertical: 10}}>
        Enter a Text :
      </Text>
      <TextInput value={text} onChangeText={setText} style={{borderWidth: 1}} />

      {data.length === 0 && (
        <Text style={{textAlign: 'center', fontSize: 18, marginVertical: 10}}>
          nothing in this Text, try another Text
        </Text>
      )}
      {data.map((item, index) => (
        <Text
          key={index}
          style={{textAlign: 'center', fontSize: 18, marginVertical: 10}}>
          {item?.label} : {item?.probabilities}
        </Text>
      ))}
    </View>
  );
};

export default App;
