import bcryptjs from "bcryptjs"; // Import bcryptjs
import User from "../models/user.model.js"; // Import user model
import { errorHandler } from "../utils/error.js"; // Import error handler
import Listing from "../models/listing.model.js";

export const test = (req, res) => {
  // Test route
  res.send("api route are working!"); // Send response
};

export const updateUser = async (req, res, next) => {
  try {
    // Check if the user ID from the token matches the user ID in the request parameters
    if (req.user.id !== req.params.id) {
      return next(errorHandler(403, "You can only update your own account."));
    }

    const updateData = {
      username: req.body.username,
      email: req.body.email,
      avatar: req.body.avatar,
    };

    // If a password is provided, hash it before updating the user
    if (req.body.password) {
      const salt = await bcryptjs.genSalt(15);
      updateData.password = await bcryptjs.hash(req.body.password, salt);
    }

    // Attempt to update the user with the new data
    const updatedUserResult = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    // Check if a user was found and updated
    if (!updatedUserResult) {
      return next(errorHandler(404, "User not found."));
    }

    // Exclude the password from the result before sending it to the client
    const { password, ...rest } = updatedUserResult._doc;
    res.status(200).json(rest);
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "Can only delete your own account."));
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json("User deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  // Ensure that the user ID from the token matches the user ID in the request parameters
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "Unauthorized access to listings."));
  }

  try {
    // Retrieve the listings that belong to the user
    const listings = await Listing.find({ userRef: req.params.id });

    // If no listings are found, return a 404 status code
    if (!listings || listings.length === 0) {
      return res
        .status(404)
        .json({ message: "No listings found for this user." });
    }

    // If listings are found, return them with a 200 status code
    res.status(200).json(listings);
  } catch (error) {
    // If an error occurs, pass it to the error handling middleware
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return next(errorHandler(404, "User not found!"));

    const { password: pass, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
