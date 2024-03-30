import mongoose from "mongoose";

const tokenShema = new mongoose.Schema({
  token: {
    type: String,
  },
  expiresAt: {
    type: Date,
    expires: 60,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

tokenShema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Token", tokenShema);
