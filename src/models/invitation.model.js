import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
    },
    studentId: {
        type: Number,
        required: true,
    },
    invitationCode: {
        type: String,
        required: true,
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
})

export const Invitation = mongoose.model("Invitation", invitationSchema);

