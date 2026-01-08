const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  items: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Asset' 
  }],
  status: { 
    type: String, 
    enum: ['Active', 'Returned'], 
    default: 'Active' 
  },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Loan', LoanSchema);