import mongoose, { Document, Schema, Types } from 'mongoose'

export interface ITask extends Document {
  _id: Types.ObjectId

  title: string

  description: string

  dueDate: Date

  priority: 'low' | 'medium' | 'high'

  status: 'todo' | 'in-progress' | 'done'

  assignedTo?: Types.ObjectId

  assignedBy: Types.ObjectId

  project: Types.ObjectId

  createdBy: Types.ObjectId

  isOverdue: boolean

  createdAt: Date

  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },

    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },

    // Member assigned to task
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    // Admin assigning the task
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },

    // Auto overdue flag
    isOverdue: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
)

// ==============================
// INDEXES
// ==============================

taskSchema.index({ project: 1, status: 1 })

taskSchema.index({ assignedTo: 1, status: 1 })

taskSchema.index({ dueDate: 1 })

// ==============================
// AUTO OVERDUE CHECK
// ==============================

taskSchema.pre('save', function (next) {
  if (
    this.status !== 'done' &&
    this.dueDate < new Date()
  ) {
    this.isOverdue = true
  } else {
    this.isOverdue = false
  }

  next()
})

export default mongoose.model<ITask>('Task', taskSchema)