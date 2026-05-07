import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IProject extends Document {
  _id: Types.ObjectId
  name: string
  description: string
  admin: Types.ObjectId
  members: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project admin is required'],
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
)

// Ensure admin is always included in members
projectSchema.pre('save', function (next) {
  if (this.admin && !this.members.some(m => m.equals(this.admin))) {
    this.members.push(this.admin)
  }
  next()
})

export default mongoose.model<IProject>('Project', projectSchema)
