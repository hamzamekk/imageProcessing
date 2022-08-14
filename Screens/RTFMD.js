import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
  Image,
  LogBox,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-react-native/dist/platform_react_native';
import {fetch} from '@tensorflow/tfjs-react-native';
import Canvas from 'react-native-canvas';
import {drawMesh} from '../utilities';
import * as jpeg from 'jpeg-js';

LogBox.ignoreAllLogs();

export const RTFMD = () => {
  const [detector, setDetector] = useState(null);
  const [loading, setLoading] = useState(false);

  let context = useRef();
  let canvas = useRef();

  const {height, width} = useWindowDimensions();

  useEffect(() => {
    (async () => {
      await tf.ready();

      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'tfjs',
        solutionPath: 'https:cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
      };
      const detectors = await faceLandmarksDetection.createDetector(
        model,
        detectorConfig,
      );

      setDetector(detectors);
      console.log(detector);
    })();
  }, []);

  const hadleCanvas = async can => {
    if (can) {
      can.width = width;
      can.height = height - 200;
      const ctx = can.getContext('2d');
      ctx.strokeStyle = 'green';
      ctx.fillStyle = 'green';
      ctx.lineWidth = 1;
      ctx.font = '30px Verdana';

      context.current = ctx;
      canvas.current = can;
    }
  };

  const imageToTensor = rawImageData => {
    const TO_UINT8ARRAY = true;
    const {width, height, data} = jpeg.decode(rawImageData, TO_UINT8ARRAY);
    // Drop the alpha channel info for mobilenet
    const buffer = new Uint8Array(width * height * 3);
    let offset = 0; //offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset];
      buffer[i + 1] = data[offset + 1];
      buffer[i + 2] = data[offset + 2];

      offset += 4;
    }

    return tf.tensor3d(buffer, [height, width, 3]);
  };

  const checkAnImage = async () => {
    //Start inference and show result.
    const image = require('../image.jpeg');
    const imageAssetPath = Image.resolveAssetSource(image);
    const response = await fetch(imageAssetPath?.uri, {}, {isBinary: true});
    const imageDataArrayBuffer = await response.arrayBuffer();
    const imageData = new Uint8Array(imageDataArrayBuffer);
    const imageTensor = imageToTensor(imageData);
    setLoading(true);
    const faces = await detector.estimateFaces(imageTensor);
    setLoading(false);
    if (faces && faces.length > 0) {
      drawMesh(faces, context.current, imageAssetPath);
    }
  };

  if (!detector) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>LOADING ...</Text>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <View style={style.container}>
      <Image source={require('../image.jpeg')} style={style.image} />
      <TouchableOpacity onPress={checkAnImage} style={style.button}>
        <Text>check Image</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size={'large'} />}
      <View style={{flex: 1}}>
        <Canvas style={style.canvas} ref={hadleCanvas} />
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {height: 100, width: 100, alignSelf: 'center'},
  button: {
    height: 50,
    width: 100,
    backgroundColor: 'cyan',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 100,
  },
});
