import { errorHandler } from "../utils/error.js";
import * as onnx from 'onnxruntime-node';
import { promises as fsPromises } from 'fs';

const loadModel = async () => {
  const modelPath = 'HomeFinder-AI/RF_ai_model.onnx'; //The model is stored in another folder,

  try {
    await fsPromises.access(modelPath); // Check if the file exists
    const model = await onnx.InferenceSession.create(modelPath);
    return model;
  } catch (error) {
    throw new Error(`Load model from ${modelPath} failed: ${error.message}`);
  }
};

//add a verification process to make sure that the features sent are in the right format
export const postFeatures = async (req, res, next) => {
  try {

    //load features & ai model
    const features = req.query;
    const model = await loadModel();  

    // Convert features to a TensorFlow tensor
    const values = Object.values(features).map(Number);
    const input = new Float32Array(values);
    const inputTensor = new onnx.Tensor('float32', input, [1, input.length]);
    
    // prepare feeds. use model input names as keys.
    const feed = {
      float_input: inputTensor
    };

    // feed inputs and run
    const result = await model.run(feed);

    // Convert predictions to JSON and send the response
    const proba = {
      approved: result.probabilities.data[1],
      denied: result.probabilities.data[0]
    }
    res.json({results: proba});
  } catch (error) {
    next(error);
  }
};