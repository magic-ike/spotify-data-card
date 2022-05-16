import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const tokenMapSchema = new Schema(
  {
    userId: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    },
    accessToken: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const TokenMap = mongoose.model('Token Map', tokenMapSchema);

export default TokenMap;
