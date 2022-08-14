// import React, {useEffect, useRef, useState} from 'react';
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   Platform,
//   useWindowDimensions,
//   Image,
//   LogBox,
//   TouchableOpacity,
//   Alert,
//   Pressable,
// } from 'react-native';
// import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
// import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-core';
// import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-react-native/dist/platform_react_native';
// import {cameraWithTensors, fetch} from '@tensorflow/tfjs-react-native';
// import {Camera} from 'expo-camera';
// import Canvas from 'react-native-canvas';
// import {drawMesh} from './utilities';
// import * as jpeg from 'jpeg-js';

// const TensorCamera = cameraWithTensors(Camera);

// // LogBox.ignoreAllLogs();

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
// LogBox.ignoreAllLogs();

// const App = () => {
//   const [detector, setDetector] = useState(null);

//   let context = useRef();
//   let canvas = useRef();

//   const {height, width} = useWindowDimensions();

//   useEffect(() => {
//     (async () => {
//       await tf.ready();

//       const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
//       const detectorConfig = {
//         runtime: 'tfjs', // or 'tfjs'
//         // solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
//       };
//       const detectors = await faceLandmarksDetection.createDetector(
//         model,
//         detectorConfig,
//       );

//       setDetector(detectors);
//       console.log(detector);
//     })();
//   }, []);

//   // useEffect(() => {
//   //   (async () => {
//   //     await checkAnImage();
//   //   })();
//   // }, [detector]);

//   const handleCameraStream = (images, updatePreview, gl) => {
//     const loop = async () => {
//       const nextImageTensor = images.next().value;

//       const faces = await detector.estimateFaces(nextImageTensor);

//       drawMesh(faces, context.current, nextImageTensor);

//       tf.dispose([nextImageTensor]);

//       // net.dispose();
//       updatePreview();
//       gl.endFrameEXP();

//       requestAnimationFrame(loop);
//     };
//     loop();
//   };

//   const hadleCanvas = async can => {
//     if (can) {
//       can.width = width;
//       can.height = height - 200;
//       const ctx = can.getContext('2d');
//       ctx.strokeStyle = 'green';
//       ctx.fillStyle = 'green';
//       ctx.lineWidth = 1;
//       ctx.font = '30px Verdana';

//       context.current = ctx;
//       canvas.current = can;
//     }
//   };

//   const imageToTensor = rawImageData => {
//     const TO_UINT8ARRAY = true;
//     const {width, height, data} = jpeg.decode(rawImageData, TO_UINT8ARRAY);
//     // Drop the alpha channel info for mobilenet
//     const buffer = new Uint8Array(width * height * 3);
//     let offset = 0; // offset into original data
//     for (let i = 0; i < buffer.length; i += 3) {
//       buffer[i] = data[offset];
//       buffer[i + 1] = data[offset + 1];
//       buffer[i + 2] = data[offset + 2];

//       offset += 4;
//     }

//     return tf.tensor3d(buffer, [height, width, 3]);
//   };

//   const checkAnImage = async () => {
//     //  Start inference and show result.
//     const image = require('./image.jpeg');
//     const imageAssetPath = Image.resolveAssetSource(image);
//     console.log(imageAssetPath);
//     const response = await fetch(imageAssetPath?.uri, {}, {isBinary: true});
//     const imageDataArrayBuffer = await response.arrayBuffer();
//     const imageData = new Uint8Array(imageDataArrayBuffer);
//     const imageTensor = imageToTensor(imageData);
//     // const prediction = await net.classify(imageTensor);

//     const faces = await detector.estimateFaces(imageTensor);

//     if (faces && faces.length > 0) {
//       drawMesh(faces, context.current, imageAssetPath);
//     }
//   };

//   if (!detector) {
//     return (
//       <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
//         <Text>LOADING ...</Text>
//         <ActivityIndicator />
//       </View>
//     );
//   }
//   return (
//     <View style={{flex: 1}}>
//       {/* <TensorCamera
//         // Standard Camera props
//         style={{flex: 1}}
//         type={Camera.Constants.Type.front}
//         // Tensor related props
//         cameraTextureHeight={textureDims.height}
//         cameraTextureWidth={textureDims.width}
//         useCustomShadersToResize={false}
//         resizeHeight={200}
//         resizeWidth={152}
//         resizeDepth={3}
//         onReady={handleCameraStream}
//         // rotation={90}
//         autorender={false}
//       /> */}
//       <Image
//         source={require('./image.jpeg')}
//         style={{height: 100, width: 100, alignSelf: 'center'}}
//       />
//       <TouchableOpacity
//         onPress={checkAnImage}
//         style={{height: 50, width: 100, backgroundColor: 'red'}}>
//         <Text>check Image</Text>
//       </TouchableOpacity>
//       <View style={{flex: 1}}>
//         <Canvas
//           style={{
//             position: 'absolute',
//             width,
//             height,
//             borderWidth: 1,
//             zIndex: 100,
//             // backgroundColor: 'red',
//             // transform: [{scaleX: -1}],
//           }}
//           ref={hadleCanvas}
//         />
//       </View>
//     </View>
//   );
// };

// export default App;

// // import React, {Component} from 'react';
// // import Expo from 'expo';
// // import {
// //   Scene,
// //   Mesh,
// //   MeshBasicMaterial,
// //   PerspectiveCamera,
// //   BoxBufferGeometry,
// //   BufferGeometry,
// //   BufferAttribute,
// //   MeshStandardMaterial,
// // } from 'three';
// // import ExpoTHREE, {Renderer} from 'expo-three';
// // import {GLView, ExpoWebGLRenderingContext} from 'expo-gl';
// // import {View} from 'react-native';

// // const App = () => {
// //   const onContextCreate = async gl => {
// //     const scene = new Scene();
// //     const camera = new PerspectiveCamera(
// //       75,
// //       gl.drawingBufferWidth / gl.drawingBufferHeight,
// //       0.1,
// //       1000,
// //     );

// //     gl.canvas = {width: gl.drawingBufferWidth, height: gl.drawingBufferHeight};
// //     camera.position.z = 6;

// //     const renderer = new Renderer({gl});
// //     renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

// //     const geometry = new BoxBufferGeometry(1, 1, 1);
// //     const material = new MeshBasicMaterial({
// //       color: 'blue',
// //     });

// //     const cube = new Mesh(geometry, material);
// //     scene.add(cube);

// //     const render = () => {
// //       requestAnimationFrame(render);
// //       cube.rotation.x += 0.01;
// //       cube.rotation.y += 0.01;

// //       renderer.render(scene, camera);
// //       gl.endFrameEXP();
// //     };

// //     render();
// //   };
// //   const vertices = new Float32Array([
// //     0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0,

// //     1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0,
// //   ]);

// //   return (
// //     <View style={{flex: 1}}>
// //       {/* <GLView onContextCreate={onContextCreate} style={{flex: 1}} /> */}
// //       <Mesh>
// //         <BufferGeometry>
// //           <BufferAttribute
// //             attachObject={['attributes', 'position']}
// //             array={vertices}
// //             itemSize={3}
// //             count={6}
// //           />
// //         </BufferGeometry>
// //         <MeshStandardMaterial
// //           attach="material"
// //           color="hotpink"
// //           flatShading={true}
// //         />
// //       </Mesh>
// //     </View>
// //   );
// // };

// // export default App;

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {View, Text} from 'react-native';
import {Home, RTHD, RTOD, RTTD} from './Screens';

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
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default App;
