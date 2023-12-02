import { errorHandler } from "../utils/error.js";
const onnx = require('onnxruntime-node');

const loadModel = async () => {
  const modelPath = '../../HomeFinder-AI/ai_model.onnx';   // Path to ai model file
  const model = await onnx.InferenceSession.create(modelPath);  // Load model
  return model;
};

//To test & add a verification process to make sure that the features sent are in the right format
export const postFeatures = async (req, res, next) => {
  try {

    //load features & ai model
    const features = req.body.features;
    const model = await loadModel();  
  
    // Convert features to a TensorFlow tensor
    const inputTensor = new onnx.Tensor(features);
  
    // Run inference
    const outputMap = await session.run([inputTensor]);

    // Get the output    
    const outputTensor = outputMap.values().next().value;
    const results = outputTensor.data;
  
    // Convert predictions to JSON and send the response
    res.json({ results: results.arraySync() });
  
    res.status(201).json("mortgage ai ran successfully");
  } catch (error) {
    next(error);
  }
};