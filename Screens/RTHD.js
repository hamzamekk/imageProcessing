import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  LogBox,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import * as tf from '@tensorflow/tfjs';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-react-native/dist/platform_react_native';
import {cameraWithTensors} from '@tensorflow/tfjs-react-native';
import {Camera} from 'expo-camera';
import Canvas from 'react-native-canvas';

const TensorCamera = cameraWithTensors(Camera);

LogBox.ignoreAllLogs();

const textureDims =
  Platform.OS === 'ios'
    ? {
        height: 1920,
        width: 1080,
      }
    : {
        height: 1200,
        width: 1600,
      };

export const RTHD = () => {
  const [mod, setMod] = useState(null);

  const {width, height} = useWindowDimensions();

  let context = useRef();
  let canvas = useRef();

  useEffect(() => {
    (async () => {
      await tf.ready();

      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig = {
        runtime: 'tfjs',
      };
      const detector = await handPoseDetection.createDetector(
        model,
        detectorConfig,
      );
      setMod(detector);
    })();

    return () => {
      tf.dispose();
    };
  }, []);

  const handleCameraStream = (images, updatePreview, gl) => {
    const loop = async () => {
      const nextImageTensor = images.next().value;

      const hands = await mod.estimateHands(nextImageTensor);

      const data = [];

      hands.map(item => {
        item.keypoints.map(key => data.push(key));
      });

      drawHand(data, nextImageTensor);

      tf.dispose([nextImageTensor]);

      // net.dispose();
      updatePreview();
      gl.endFrameEXP();

      requestAnimationFrame(loop);
    };
    loop();
  };

  const drawHand = (predictions, nextImageTensor) => {
    context.current.clearRect(0, 0, width, height);

    const scaleWidth = width / nextImageTensor.shape[1];
    const scaleHeight = height / nextImageTensor.shape[0];

    context.current.beginPath();
    context.current.moveTo(
      predictions[0]?.x * scaleWidth,
      predictions[0]?.y * scaleHeight,
    );
    for (let i = 1; i < predictions.length; i++) {
      context.current.lineTo(
        predictions[i].x * scaleWidth,
        predictions[i].y * scaleHeight,
      );
    }
    context.current.stroke();

    predictions.forEach(prediction => {
      context.current.beginPath();
      context.current.arc(
        prediction.x * scaleWidth,
        prediction.y * scaleHeight,
        (scaleHeight / scaleWidth) * 2,
        0,
        2 * Math.PI,
      );
      context.current.closePath();
      context.current.fillStyle = 'aqua';
      context.current.fill();
    });
  };

  const hadleCanvas = async can => {
    if (can) {
      can.width = width;
      can.height = height;
      const ctx = can.getContext('2d');
      ctx.strokeStyle = 'green';
      ctx.fillStyle = 'green';
      ctx.lineWidth = 1;

      context.current = ctx;
      canvas.current = can;
    }
  };

  if (!mod) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>LOADING ...</Text>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={style.container}>
      <TensorCamera
        // Standard Camera props
        style={{flex: 1}}
        type={Camera.Constants.Type.back}
        // Tensor related props
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        useCustomShadersToResize={false}
        resizeHeight={200}
        resizeWidth={152}
        resizeDepth={3}
        onReady={handleCameraStream}
        // rotation={90}
        autorender={false}
      />
      <Canvas style={style.canvas} ref={hadleCanvas} />
    </View>
  );
};

const style = StyleSheet.create({
  container: {flex: 1},
  canvas: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 100,
    transform: [{scaleX: -1}],
  },
});
