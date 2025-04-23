const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    uid: {
      type: String,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,          // <- still needed here
      sparse: true,          // <- this is key for allowing nulls
      validate: {
        validator: function (value) {
          // only validate if the value is not null/undefined
          return !value || validator.isEmail(value);
        },
        message: 'Invalid email',
      },
    },    
    countryCode: {
      type: String,
      trim: true,
      validate(value) {
        if (!/^\+\d{1,4}$/.test(value)) {
          throw new Error('Invalid country code');
        }
      },
    },
    // onboardingStage: {
    //   type: Number,
    //   validate: {
    //     validator: function (value) {
    //       return value >= 1 && value <= 9;
    //     },
    //     message: 'onboardingStage must be a number between 1 and 9.',
    //   },
    // },
    isOnboardingCompleted: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,

    },
    referralCode: {
      type: String,
    },
    phoneNumber: {
      type: String,
      trim: true,
      // unique: true,
      sparse: true,
      // unique: true,
      validate(value) {
        if (!validator.isMobilePhone(value)) {
          throw new Error('Invalid phone number');
        }
      },
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: 'user',
    },
    gender: {
      type: String,
   
    },
    dob: {
      type: Date,
      validate: {
        validator: (value) => {
          // Validate that the user is at least 18 years old
          const age = new Date().getFullYear() - value.getFullYear();
          return age >= 18;
        },
        message: 'User must be at least 18 years old',
      },
    },
    // age: {
    //   type: Number,
    //   min: 18,
    // },
    // bio: {
    //   type: String,
    //   trim: true,
    //   maxlength: 500,
    // },
    // height: {
    //   type: Number,
    // },
    // occupation: {
    //   type: String,
    //   trim: true,
    // },
    signInProvider: {
      type: String,
      enum: ['phone', 'google', 'facebook'],
      default: 'phone',
    },
    // education: {
    //   type: String,
    //   trim: true,
    // },
    // interests: {
    //   type: [
    //     {
    //       icon: String, // Use primitive types directly without creating nested objects
    //       title: String,
    //       _id: false,
    //     },
    //   ],
    //   default: [],
    // },
    // likedUsers: {
    //   type: [
    //     {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'User',
    //     },
    //   ],
    //   default: [],
    // },
    // rejectedUsers: {
    //   type: [
    //     {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'User',
    //     },
    //   ],
    //   default: [],
    // },
    // savedUsers: {
    //   type: [
    //     {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'User',
    //     },
    //   ],
    //   default: [],
    // },
    // matchedUsers: {
    //   type: [
    //     {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'User',
    //     },
    //   ],
    //   default: [],
    // },
    about: {
      type: String,
      default: '',
    },
    // blockedUsers: {
    //   type: [
    //     {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'User',
    //     },
    //   ],
    //   default: [],
    // },
    // languagesSpoken: {
    //   type: [String],
    //   default: [],
    // },
      language: {
      type: String,
 
    },
    profilePhotos: {
      type: Array
    },
     wallet: {
      type:Number,
      default:0
    },
    history: {
      type: [
        {
          name: { type: String, required: true },
          duration: { type: String, required: true },
          type: { type: String, required: true },
          cost: { type: Number, required: true },
        }
      ],
      default: [],
    },
    rate:{
      type : Number,
      default: 10,
    },
    // location: {
    //   type: {
    //     type: String,
    //     enum: ['Point'], // GeoJSON type must be "Point"
    //     // required: true,
    //   },
    //   coordinates: {
    //     type: [Number], // Array of numbers: [longitude, latitude]
    //     // required: true,
    //   },
    //   city: {
    //     type: String,
    //     trim: true,
    //   },
    //   country: {
    //     type: String,
    //     trim: true,
    //   },
    // },
    // profileStatus: {
    //   type: Array,
    //   default: [],
    // },
    // permanentAddress: {
    //   type: String,
    //   trim: true,
    // },
    // currentAddress: {
    //   type: String,
    //   trim: true,
    // },
    // originalAddress: {
    //   type: String,
    //   trim: true,
    // },
    // preferences: {
    //   genderPreference: {
    //     type: Number,
    //     default: 0,
    //   },
    //   lookingFor: {
    //     type: Number,
    //     default: 0,
    //   },
    //   ageRange: {
    //     min: {
    //       type: Number,
    //       default: 18,
    //     },
    //     max: {
    //       type: Number,
    //       default: 60,
    //     },
    //   },
    //   maxDistance: {
    //     type: Number, // In kilometers
    //     default: 50,
    //   },
      //   lookingFor: {
      //     type: String,
      //   },
      // },
      // orientation: {
      //   type: String,
      //   default: 'Straight',
      // },
      // likes: {
      //   type: [mongoose.Schema.Types.ObjectId],
      //   ref: 'User',
      //   default: [],
      // },
      // matches: {
      //   type: [mongoose.Schema.Types.ObjectId],
      //   ref: 'User',
      //   default: [],
      // },
      // blockList: {
      //   type: [mongoose.Schema.Types.ObjectId],
      //   ref: 'User',
      //   default: [],
      // },
      // premiumStatus: {
      //   isPremium: {
      //     type: Boolean,
      //     default: false,
      //   },
      //   subscriptionType: {
      //     type: String,
      //     enum: ['free', 'gold', 'platinum'],
      //     default: 'free',
      //   },
      //   expiryDate: {
      //     type: Date,
      //   },
    // },
    // lastActive: {
    //   type: Date,
    //   default: Date.now,
    // },
    // chatRooms: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'ChatRoom',
    //   },
    // ],
    // unreadCounts: {
    //   type: Map,
    //   of: Number,
    //   default: {},
    // },
    // // isEmailVerified: {
    //   type: Boolean,
    //   default: false,
    // },
    // notifications: {
    //   type: Array,
    //   default: [
    //     {
    //       id: '1',
    //       note: 'Zyan liked your profile',
    //       image: 'https://randomuser.me/api/portraits/men/1.jpg',
    //       name: 'Zyan',
    //       lastSeen: '2 hours ago',
    //       userId: 'user123',
    //       messageSeen: false,
    //       messageReceivedNotSeen: true,
    //       noOfMessageReceivedNotSeen: Math.floor(Math.random() * 20) + 1,
    //       messageSent: false, // Add messageSent field
    //     },
    //     {
    //       id: '2',
    //       note: 'You have a new message from Neha',
    //       image: 'https://randomuser.me/api/portraits/women/2.jpg',
    //       name: 'Neha',
    //       lastSeen: '1 hour ago',
    //       userId: 'user456',
    //       messageSeen: true,
    //       messageReceivedNotSeen: false,
    //       noOfMessageReceivedNotSeen: Math.floor(Math.random() * 20) + 1,
    //       messageSent: true, // Add messageSent field
    //     },
    //     {
    //       id: '3',
    //       note: 'We have new profiles around your location preference',
    //       image: 'https://randomuser.me/api/portraits/men/3.jpg',
    //       name: 'Alex',
    //       lastSeen: '3 hours ago',
    //       userId: 'user789',
    //       messageSeen: false,
    //       messageReceivedNotSeen: true,
    //       noOfMessageReceivedNotSeen: Math.floor(Math.random() * 20) + 1,
    //       messageSent: false, // Add messageSent field
    //     },
    //     {
    //       id: '4',
    //       note: 'Sneha favourited you',
    //       image: 'https://randomuser.me/api/portraits/women/4.jpg',
    //       name: 'Sneha',
    //       lastSeen: '5 hours ago',
    //       userId: 'user012',
    //       messageSeen: true,
    //       messageReceivedNotSeen: false,
    //       noOfMessageReceivedNotSeen: Math.floor(Math.random() * 20) + 1,
    //       messageSent: false, // Add messageSent field
    //     },
    //     {
    //       id: '5',
    //       note: 'Check our prime plan for getting faster matches',
    //       image: 'https://randomuser.me/api/portraits/men/5.jpg',
    //       name: 'Prime Plan',
    //       lastSeen: 'just now',
    //       userId: 'user999',
    //       messageSeen: false,
    //       messageReceivedNotSeen: true,
    //       noOfMessageReceivedNotSeen: Math.floor(Math.random() * 20) + 1,
    //       messageSent: true, // Add messageSent field
    //     },
    //     {
    //       id: '6',
    //       note: 'You have a match request from Ravi',
    //       image: 'https://randomuser.me/api/portraits/men/6.jpg',
    //       name: 'Ravi',
    //       lastSeen: '30 minutes ago',
    //       userId: 'user101',
    //       messageSeen: false,
    //       messageReceivedNotSeen: false,
    //       noOfMessageReceivedNotSeen: Math.floor(Math.random() * 20) + 1,
    //       messageSent: true, // Add messageSent field
    //     },
    //     {
    //       id: '7',
    //       note: 'Ankita viewed your profile',
    //       image: 'https://randomuser.me/api/portraits/women/7.jpg',
    //       name: 'Ankita',
    //       lastSeen: '10 minutes ago',
    //       userId: 'user102',
    //       messageSeen: true,
    //       messageReceivedNotSeen: false,
    //       noOfMessageReceivedNotSeen: Math.floor(Math.random() * 20) + 1,
    //       messageSent: false, // Add messageSent field
    //     },
    //     {
    //       id: '8',
    //       note: 'Raj sent you a message',
    //       image: 'https://randomuser.me/api/portraits/men/8.jpg',
    //       name: 'Raj',
    //       lastSeen: '5 minutes ago',
    //       userId: 'user103',
    //       messageSeen: false,
    //       messageReceivedNotSeen: true,
    //       noOfMessageReceivedNotSeen: Math.floor(Math.random() * 20) + 1,
    //       messageSent: false, // Add messageSent field
    //     },
    //   ],
    // },
  },
  {
    timestamps: true,
    upsert: true,
  }
);
userSchema.index({ location: '2dsphere' });

// Add plugins that convert mongoose to JSON and support pagination
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// eslint-disable-next-line func-names
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
// eslint-disable-next-line func-names
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

/**
 * Hash the password before saving the user
 */
// eslint-disable-next-line func-names
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
