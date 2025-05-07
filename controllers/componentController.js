// File: controllers/componentController.js
// Controller for component operations
const Component = require('../models/componentModel');

// Get all components grouped by category
exports.getComponents = async (req, res) => {
  try {
    // Get all active components
    const components = await Component.find({ isActive: true }).sort({ category: 1, name: 1 });
    
    // Group components by category
    const groupedComponents = components.reduce((acc, component) => {
      const { category } = component;
      
      if (!acc[category]) {
        acc[category] = [];
      }
      
      acc[category].push({
        name: component.name,
        hsn: component.hsn,
        price: component.price,
        gst: component.gst,
        warranty: component.warranty,
        stock: component.stock
      });
      
      return acc;
    }, {});
    
    res.json(groupedComponents);
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single component by ID
exports.getComponent = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }
    
    res.json(component);
  } catch (error) {
    console.error('Error fetching component:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new component
exports.createComponent = async (req, res) => {
  try {
    // Check if component with same name already exists
    const existingComponent = await Component.findOne({ name: req.body.name });
    if (existingComponent) {
      return res.status(400).json({ message: 'Component with this name already exists' });
    }
    
    const newComponent = new Component(req.body);
    await newComponent.save();
    
    res.status(201).json(newComponent);
  } catch (error) {
    console.error('Error creating component:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update an existing component
exports.updateComponent = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }
    
    // Check if trying to update name to an existing one
    if (req.body.name && req.body.name !== component.name) {
      const existingComponent = await Component.findOne({ name: req.body.name });
      if (existingComponent) {
        return res.status(400).json({ message: 'Another component with this name already exists' });
      }
    }
    
    // Update fields
    Object.assign(component, req.body);
    component.updatedAt = new Date();
    
    await component.save();
    
    res.json(component);
  } catch (error) {
    console.error('Error updating component:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a component (soft delete by setting isActive to false)
exports.deleteComponent = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }
    
    // Soft delete
    component.isActive = false;
    component.updatedAt = new Date();
    await component.save();
    
    res.json({ message: 'Component deleted successfully' });
  } catch (error) {
    console.error('Error deleting component:', error);
    res.status(500).json({ message: error.message });
  }
};

// Bulk import components
exports.bulkImport = async (req, res) => {
  try {
    const { components } = req.body;
    
    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ message: 'No components provided for import' });
    }
    
    const results = {
      success: 0,
      errors: []
    };
    
    // Process each component
    for (const componentData of components) {
      try {
        // Check if component already exists
        const existingComponent = await Component.findOne({ name: componentData.name });
        
        if (existingComponent) {
          // Update existing component
          Object.assign(existingComponent, componentData);
          existingComponent.updatedAt = new Date();
          await existingComponent.save();
        } else {
          // Create new component
          const newComponent = new Component(componentData);
          await newComponent.save();
        }
        
        results.success++;
      } catch (error) {
        results.errors.push({
          component: componentData.name,
          error: error.message
        });
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error bulk importing components:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get component categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Component.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching component categories:', error);
    res.status(500).json({ message: error.message });
  }
};