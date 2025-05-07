// File: scripts/seed-db.js
// Script to initialize database with component data
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Component = require('../models/componentModel');

dotenv.config();

// Initial component data
const componentData = {
  'Windows Activation': [
    { name: 'Windows Genuine License Activation', hsn: '9931', price: 423.73, gst: 18, warranty: '1 Year Warranty', stock: 100 },
    { name: 'Windows 11 Pro Activation', hsn: '9931', price: 500.00, gst: 18, warranty: '1 Year Warranty', stock: 50 },
    { name: 'Windows 11 Home Activation', hsn: '9931', price: 380.00, gst: 18, warranty: '1 Year Warranty', stock: 50 },
    { name: 'Windows 10 Pro Activation', hsn: '9931', price: 450.00, gst: 18, warranty: '1 Year Warranty', stock: 100 },
  ],
  'Office Licenses': [
    { name: 'MS Office License', hsn: '9931', price: 423.73, gst: 18, warranty: '1 Year Warranty', stock: 75 },
    { name: 'MS Office 365 Personal', hsn: '9931', price: 4999.00, gst: 18, warranty: '1 Year Warranty', stock: 30 },
    { name: 'MS Office 2021 Professional', hsn: '9931', price: 29999.00, gst: 18, warranty: '1 Year Warranty', stock: 20 },
    { name: 'MS Office 2021 Home & Student', hsn: '9931', price: 7999.00, gst: 18, warranty: '1 Year Warranty', stock: 40 },
  ],
  'Power Supplies': [
    { name: 'Artis PS-600VA 600VA Line Interactive', hsn: '8473', price: 2000.00, gst: 18, warranty: '2 Years Warranty', stock: 15 },
    { name: 'DeepCool PL650D ATX 3.0 650 Watt 80 Plus Bronze SMPS', hsn: '8473', price: 4080.00, gst: 18, warranty: '5 Years Warranty', stock: 10 },
    { name: 'Corsair CV550 550W 80+ Bronze PSU', hsn: '8473', price: 3500.00, gst: 18, warranty: '3 Years Warranty', stock: 12 },
    { name: 'Antec Atom V650 650W 80+ Gold', hsn: '8473', price: 5500.00, gst: 18, warranty: '5 Years Warranty', stock: 8 },
    { name: 'Cooler Master MWE 550 Bronze V2', hsn: '8473', price: 3200.00, gst: 18, warranty: '3 Years Warranty', stock: 15 },
  ],
  'Accessories': [
    { name: 'HP KM160 Wired Mouse and Keyboard Combo', hsn: '8504', price: 800.00, gst: 18, warranty: '1 Year Warranty', stock: 20 },
    { name: 'Logitech MK240 Wireless Combo', hsn: '8504', price: 1500.00, gst: 18, warranty: '1 Year Warranty', stock: 25 },
    { name: 'Dell WM126 Wireless Mouse', hsn: '8504', price: 699.00, gst: 18, warranty: '1 Year Warranty', stock: 30 },
    { name: 'Zebronics Zeb-K16 Wired Keyboard', hsn: '8504', price: 399.00, gst: 18, warranty: '1 Year Warranty', stock: 35 },
    { name: 'Logitech K480 Bluetooth Keyboard', hsn: '8504', price: 2999.00, gst: 18, warranty: '1 Year Warranty', stock: 10 },
  ],
  'Monitors': [
    { name: 'ZEBRONICS Z-E19HD ZEBSTAR LED Monitor', hsn: '8473', price: 2100.00, gst: 18, warranty: '1 Year Warranty', stock: 8 },
    { name: 'LG 22MK430H-B 22 inch LED Monitor', hsn: '8473', price: 6999.00, gst: 18, warranty: '3 Years Warranty', stock: 10 },
    { name: 'Dell E2220H 21.5 inch Monitor', hsn: '8473', price: 7500.00, gst: 18, warranty: '3 Years Warranty', stock: 12 },
    { name: 'HP M22f 21.5 inch FHD Monitor', hsn: '8473', price: 8999.00, gst: 18, warranty: '3 Years Warranty', stock: 7 },
    { name: 'Samsung LS24R350FHWXXL 24 inch IPS Monitor', hsn: '8473', price: 9999.00, gst: 18, warranty: '3 Years Warranty', stock: 5 },
  ],
  'Web Cameras': [
    { name: 'Zebronics Zeb-Crystal Pro Web Camera', hsn: '8473', price: 590.00, gst: 18, warranty: '1 Year Warranty', stock: 20 },
    { name: 'Logitech C270 HD Webcam', hsn: '8473', price: 1499.00, gst: 18, warranty: '2 Years Warranty', stock: 15 },
    { name: 'HP W200 Webcam', hsn: '8473', price: 999.00, gst: 18, warranty: '1 Year Warranty', stock: 18 },
    { name: 'Logitech C920 HD Pro Webcam', hsn: '8473', price: 5999.00, gst: 18, warranty: '2 Years Warranty', stock: 7 },
  ],
  'Air Coolers': [
    { name: 'Deepcool AK400 Black CPU Air Cooler', hsn: '8473', price: 2050.00, gst: 18, warranty: '2 Years Warranty', stock: 10 },
    { name: 'Arctic Freezer 34 CPU Cooler', hsn: '8473', price: 2999.00, gst: 18, warranty: '5 Years Warranty', stock: 8 },
    { name: 'Noctua NH-L9i CPU Cooler', hsn: '8473', price: 4499.00, gst: 18, warranty: '6 Years Warranty', stock: 5 },
    { name: 'Cooler Master Hyper 212 LED', hsn: '8473', price: 2700.00, gst: 18, warranty: '2 Years Warranty', stock: 12 },
  ],
  'Graphics Cards': [
    { name: 'MSI RTX 3050 Ventus 2X XS OC 8GB', hsn: '8504', price: 19830.00, gst: 18, warranty: '3 Years Warranty', stock: 4 },
    { name: 'Gigabyte GTX 1650 4GB OC', hsn: '8504', price: 14999.00, gst: 18, warranty: '3 Years Warranty', stock: 6 },
    { name: 'AMD RX 6600 XT 8GB', hsn: '8504', price: 29999.00, gst: 18, warranty: '3 Years Warranty', stock: 3 },
    { name: 'Zotac RTX 3060 Twin Edge OC 12GB', hsn: '8504', price: 32990.00, gst: 18, warranty: '3 Years Warranty', stock: 2 },
  ],
  'Cabinets': [
    { name: 'Ant Esports Zen Wood C3 (ATX) Mid Tower Cabinet', hsn: '8504', price: 3900.00, gst: 18, warranty: '2 Years Warranty', stock: 7 },
    { name: 'Deepcool MATREXX 40 Micro-ATX Case', hsn: '8504', price: 2199.00, gst: 18, warranty: '2 Years Warranty', stock: 10 },
    { name: 'Corsair SPEC-DELTA RGB Case', hsn: '8504', price: 5999.00, gst: 18, warranty: '2 Years Warranty', stock: 5 },
    { name: 'NZXT H510 Compact ATX Mid-Tower', hsn: '8504', price: 6990.00, gst: 18, warranty: '2 Years Warranty', stock: 4 },
  ],
  'RAM': [
    { name: 'G.Skill Ripjaws S5 16GB DDR5 5200MHz', hsn: '8504', price: 3220.00, gst: 18, warranty: 'Lifetime Warranty', stock: 15 },
    { name: 'Crucial 16GB DDR4 3200MHz', hsn: '8504', price: 2999.00, gst: 18, warranty: 'Lifetime Warranty', stock: 20 },
    { name: 'Kingston Fury Beast 32GB DDR5 5600MHz', hsn: '8504', price: 6999.00, gst: 18, warranty: 'Lifetime Warranty', stock: 8 },
    { name: 'Corsair Vengeance 16GB DDR4 3600MHz', hsn: '8504', price: 3499.00, gst: 18, warranty: 'Lifetime Warranty', stock: 18 },
  ],
  'Motherboards': [
    { name: 'Gigabyte B760M G AX (Wi-Fi) DDR5', hsn: '8504', price: 10000.00, gst: 18, warranty: '3 Years Warranty', stock: 5 },
    { name: 'ASUS PRIME B550M-A', hsn: '8504', price: 8499.00, gst: 18, warranty: '3 Years Warranty', stock: 7 },
    { name: 'MSI B550 TOMAHAWK', hsn: '8504', price: 12999.00, gst: 18, warranty: '3 Years Warranty', stock: 4 },
    { name: 'ASRock B660M-ITX/ac', hsn: '8504', price: 9999.00, gst: 18, warranty: '3 Years Warranty', stock: 6 },
  ],
  'Processors': [
    { name: 'Intel Core i7-12700K', hsn: '8473', price: 19490.00, gst: 18, warranty: '3 Years Warranty', stock: 3 },
    { name: 'AMD Ryzen 7 5800X', hsn: '8473', price: 18999.00, gst: 18, warranty: '3 Years Warranty', stock: 4 },
    { name: 'Intel Core i5-12600K', hsn: '8473', price: 14999.00, gst: 18, warranty: '3 Years Warranty', stock: 6 },
    { name: 'AMD Ryzen 5 5600X', hsn: '8473', price: 13999.00, gst: 18, warranty: '3 Years Warranty', stock: 8 },
  ],
  'Storage': [
    { name: 'WD Blue SN5000 NVMe SSD 500GB', hsn: '8473', price: 2700.00, gst: 18, warranty: '5 Years Warranty', stock: 12 },
    { name: 'Samsung 980 1TB NVMe SSD', hsn: '8473', price: 7499.00, gst: 18, warranty: '5 Years Warranty', stock: 8 },
    { name: 'Seagate BarraCuda 1TB HDD', hsn: '8473', price: 2899.00, gst: 18, warranty: '2 Years Warranty', stock: 15 },
    { name: 'Crucial MX500 500GB SATA SSD', hsn: '8473', price: 3599.00, gst: 18, warranty: '5 Years Warranty', stock: 10 },
    { name: 'WD Black 2TB HDD', hsn: '8473', price: 5999.00, gst: 18, warranty: '5 Years Warranty', stock: 7 },
  ],
};

// Connect to MongoDB
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB...');
    
    // Clear existing components
    await Component.deleteMany({});
    console.log('Cleared existing components');
    
    // Create components
    const componentsToCreate = [];
    
    Object.entries(componentData).forEach(([category, components]) => {
      components.forEach(component => {
        componentsToCreate.push({
          category,
          name: component.name,
          hsn: component.hsn,
          price: component.price,
          gst: component.gst,
          warranty: component.warranty,
          stock: component.stock,
          isActive: true,
          description: `${component.name} - ${category}`,
        });
      });
    });
    
    await Component.insertMany(componentsToCreate);
    console.log(`Added ${componentsToCreate.length} components to the database`);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();