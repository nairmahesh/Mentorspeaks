/*
  # Update Industries with Modern Icon Names

  1. Changes
    - Update icon field to store Lucide icon names instead of emojis
    - These will be rendered as proper React components for a modern look

  2. Icons
    - Using professional Lucide icon names that will render beautifully
*/

-- Update industries with modern Lucide icon names
UPDATE industries SET icon = 'Laptop' WHERE slug = 'technology';
UPDATE industries SET icon = 'Briefcase' WHERE slug = 'business-management';
UPDATE industries SET icon = 'TrendingUp' WHERE slug = 'marketing-sales';
UPDATE industries SET icon = 'DollarSign' WHERE slug = 'finance-investment';
UPDATE industries SET icon = 'Palette' WHERE slug = 'design-creative';
UPDATE industries SET icon = 'Stethoscope' WHERE slug = 'healthcare-medicine';
UPDATE industries SET icon = 'GraduationCap' WHERE slug = 'education-training';
UPDATE industries SET icon = 'Scale' WHERE slug = 'legal-compliance';
UPDATE industries SET icon = 'Cog' WHERE slug = 'engineering';
UPDATE industries SET icon = 'BarChart3' WHERE slug = 'data-science-analytics';
UPDATE industries SET icon = 'Rocket' WHERE slug = 'product-management';
UPDATE industries SET icon = 'Users' WHERE slug = 'human-resources';
