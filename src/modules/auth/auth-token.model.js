import mongoose from "mongoose";

const authTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    purpose: {
      type: String,
      enum: ["password_reset", "email_verification"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: {
        expireAfterSeconds: 0,
      },
    },

    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Useful when finding tokens for a particular user and purpose
authTokenSchema.index({
  user: 1,
  purpose: 1,
});

const AuthToken = mongoose.model("AuthToken", authTokenSchema);

export default AuthToken;
