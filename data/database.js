import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "PR_REACT_NATIVE_ECOMMERCE_2023",
    });

    console.log(`Server connected to database ${connection.host}`);
  } catch (error) {
    console.log("Some Error Ocurred", error);
    process.exit(1);
  }
};
