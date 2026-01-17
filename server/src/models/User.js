const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator', 'citizen', 'engineer'],
      default: 'user',
    },
    department: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profilePicture: {
      type: String,
      required: false,
    },
    profileImage: {
      url: {
        type: String,
        required: false,
      },
      publicId: {
        type: String,
        required: false,
      }
    },
    // Google OAuth fields
    googleId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    isGoogleAuth: {
      type: Boolean,
      default: false,
    },
    // Microsoft OAuth fields
    microsoftId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    isMicrosoftAuth: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    // Phone Auth fields
    firebaseUid: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    isPhoneAuth: {
      type: Boolean,
      default: false,
    },
    // Engineer-specific fields
    engineerId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    specialization: {
      type: String,
      required: false,
    },
    assignedGrievances: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grievance',
    }],
    completedTasks: {
      type: Number,
      default: 0,
    },
    activeTasks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only if modified and not OAuth/Phone Auth)
userSchema.pre('save', async function (next) {
  // Skip if password not modified
  if (!this.isModified('password')) {
    return next();
  }

  // Skip password hashing for OAuth users
  if (this.isGoogleAuth || this.isPhoneAuth) {
    return next();
  }

  // Hash password for regular users
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
