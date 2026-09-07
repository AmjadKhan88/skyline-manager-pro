/**
 * configs/passport.js — Passport.js Strategy Configuration
 *
 * Updated to use the unified User model instead of the old Auth model.
 * Only owners can log in via Google OAuth — staff use email/password credentials.
 */

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User, OwnerProfile } from "../models/index.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // Check if an owner account with this email already exists
        let user = await User.findOne({ where: { email } });

        if (user) {
          // Existing user — link Google ID if not already linked
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          user.password = undefined;
          return done(null, user);
        }

        // New user — create owner account via Google OAuth
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          role: "owner",
          status: "active",
          verified: true, // Google verifies the email
          password: null, // No password for OAuth users
        });

        // Create corresponding OwnerProfile
        await OwnerProfile.create({
          userId: user.id,
          subscriptionPlan: "basic",
          maxBuildings: 3,
        });

        user.password = undefined;
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
