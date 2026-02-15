import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['owner', 'manager', 'staff', 'patient'],
        index: true
    },
    module: {
        type: String,
        required: true,
        index: true
    },
    permissions: {
        read: {
            type: Boolean,
            default: false
        },
        write: {
            type: Boolean,
            default: false
        },
        delete: {
            type: Boolean,
            default: false
        }
    },
    customPermissions: {
        type: Map,
        of: Boolean,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Compound unique index for role + module
permissionSchema.index({ role: 1, module: 1 }, { unique: true });

// Static method to get all permissions for a role
permissionSchema.statics.getByRole = function (role) {
    return this.find({ role, isActive: true });
};

// Static method to check if role has permission
permissionSchema.statics.hasPermission = async function (role, module, action) {
    const permission = await this.findOne({ role, module, isActive: true });
    if (!permission) return false;
    return permission.permissions[action] === true;
};

export default mongoose.model('Permission', permissionSchema);
