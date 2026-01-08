const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Asset = require('./models/Asset');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected for Seeding'))
  .catch(err => console.error(err));

const library = [
  {
    name: "MacBook Pro M3",
    category: "Laptops",
    available: 5,
    description: "The latest 14-inch MacBook Pro with M3 Pro chip. Perfect for coding and video editing projects.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Sony A7III Camera",
    category: "Cameras",
    available: 3,
    description: "Full-frame mirrorless camera. Includes 28-70mm lens kit. Great for photography assignments.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Oculus Quest 2",
    category: "VR/AR",
    available: 8,
    description: "All-in-one VR headset. 128GB storage. Comes with two controllers.",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Arduino Starter Kit",
    category: "Electronics",
    available: 15,
    description: "Complete kit with Uno board, breadboard, LEDs, and sensors. Essential for hardware prototyping.",
    image: "https://images.unsplash.com/photo-1555664424-778a69f452d1?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "iPad Air 5",
    category: "Tablets",
    available: 4,
    description: "Lightweight tablet with M1 chip. Supports Apple Pencil (2nd gen).",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Raspberry Pi 4",
    category: "Electronics",
    available: 20,
    description: "8GB RAM Model B. Tiny dual-display computer for robot brains and servers.",
    image: "https://images.unsplash.com/photo-1629734360634-84687a41400d?auto=format&fit=crop&w=800&q=80"
  }
];

const seedDB = async () => {
  await Asset.deleteMany({});
  await Asset.insertMany(library);
  console.log('Database Seeded with 6 Cool Items!');
  process.exit();
};

seedDB();