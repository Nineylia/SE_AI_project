import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";
import mongoose from "mongoose";
export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ success: false, message: error.message }); // Send the actual error message
  }
};

export const deleteListing = async (req, res, next) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  try {
    const listing = await Listing.findById(id);

    if (!listing) {
      return next(errorHandler(404, "Listing not found."));
    }

    if (userId !== listing.userRef.toString()) {
      return next(
        errorHandler(401, "You are not authorized to delete this listing.")
      );
    }

    await Listing.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Listing has been deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

//DONT TOUCH VOLATILE AS HELL
export const updateListing = async (req, res, next) => {
  const listingId = req.params.id;

  // Check if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    return next(errorHandler(400, "Listing not found!"));
  }

  //Not working in insomnia so did database objectId above instead, keeping both for safety checks.

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }

    if (req.user.id !== listing.userRef) {
      return next(errorHandler(401, "You can only update your own listings!"));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      listingId,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedListing,
      message: "Listing updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      // It's good to create a custom error with a specific status code and message
      const error = new Error("Listing not found!");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(listing);
  } catch (error) {
    // Pass the error to the next middleware, which could be your error handling middleware
    next(error);
  }
};

//TODO WHEN ADDING MORE FILTERS YOU HAVE TO ADD THEM HERE (COPY PASTE SAME FUNCTIONALLITY FOR)
export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const searchTerm = req.query.searchTerm || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order === "asc" ? "asc" : "desc"; // Default to 'desc' if not 'asc'

    //TODO: enhance this even more
    const filters = {
      ...(req.query.offer === "true" && { offer: true }),
      ...(req.query.furnished === "true" && { furnished: true }),
      ...(req.query.parking === "true" && { parking: true }),
      ...(req.query.university === "true" && { university: true }),
      ...(req.query.grocerystore === "true" && { grocerystore: true }),
      ...(req.query.shoppingcenter === "true" && { shoppingcenter: true }),
      ...(req.query.cinema === "true" && { cinema: true }),
      ...(req.query.fitness === "true" && { fitness: true }),
      ...(req.query.type === "sale" || req.query.type === "rent"
        ? { type: req.query.type }
        : { type: { $in: ["sale", "rent"] } }),
      ...(searchTerm && { name: { $regex: searchTerm, $options: "i" } }),
    };

    const listings = await Listing.find(filters)
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);
    return res.status(200).json(listings);
  } catch (error) {
    console.error("Error in getListings:", error); // Log the error for debugging

    // Check if it's a user-induced error or a server error
    if (error instanceof SomeClientError) {
      // Replace SomeClientError with actual client error type
      return res
        .status(400)
        .json({ message: "Bad Request: [specific error message]" });
    } else {
      // For server-side errors, consider logging additional details if needed
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
