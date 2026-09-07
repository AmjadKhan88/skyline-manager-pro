/**
 * models/index.js — Model Barrel Export
 *
 * Single import point for all Sequelize models.
 * Importing this file:
 *   1. Imports every model (ensures they're registered with Sequelize)
 *   2. Runs all associations (must happen after all models are defined)
 *   3. Re-exports everything for convenient use in controllers/services
 *
 * Usage in any file:
 *   import { User, Building, Tenancy } from '../models/index.js';
 *
 * WHY: Previously, individual controllers imported from separate model files
 * and also imported associations.js separately, which caused race conditions
 * and duplicate association definitions. Centralizing here fixes that.
 */

// Import all models (registers them with sequelize instance)
import User from "./User.model.js";
import OwnerProfile from "./OwnerProfile.model.js";
import UserProfile from "./UserProfile.model.js";
import Building from "./Building.model.js";
import Tenancy from "./Tenancy.model.js";
import Invitation from "./Invitation.model.js";

// Run all associations (MUST be after all model imports)
import "./associations.js";

// Re-export for convenient destructured imports
export {
  User,
  OwnerProfile,
  UserProfile,
  Building,
  Tenancy,
  Invitation,
};
