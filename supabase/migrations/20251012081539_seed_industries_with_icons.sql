/*
  # Seed Industries with Icons

  1. Data
    - Add popular industries with appropriate emoji icons
    - Ensures all industries have visual identifiers
*/

-- Insert industries with icons if they don't exist
INSERT INTO industries (name, slug, description, icon, is_active)
VALUES 
  ('Technology', 'technology', 'Software development, AI, cloud computing, and tech innovation', '💻', true),
  ('Business & Management', 'business-management', 'Strategy, operations, leadership, and entrepreneurship', '💼', true),
  ('Marketing & Sales', 'marketing-sales', 'Digital marketing, branding, sales strategy, and growth', '📈', true),
  ('Finance & Investment', 'finance-investment', 'Banking, investing, fintech, and financial planning', '💰', true),
  ('Design & Creative', 'design-creative', 'UI/UX, graphic design, branding, and creative direction', '🎨', true),
  ('Healthcare & Medicine', 'healthcare-medicine', 'Medical practice, healthcare management, and wellness', '⚕️', true),
  ('Education & Training', 'education-training', 'Teaching, e-learning, curriculum development, and coaching', '📚', true),
  ('Legal & Compliance', 'legal-compliance', 'Law, regulations, corporate governance, and compliance', '⚖️', true),
  ('Engineering', 'engineering', 'Mechanical, civil, electrical, and industrial engineering', '⚙️', true),
  ('Data Science & Analytics', 'data-science-analytics', 'Data analysis, machine learning, and business intelligence', '📊', true),
  ('Product Management', 'product-management', 'Product strategy, roadmaps, and user experience', '🚀', true),
  ('Human Resources', 'human-resources', 'Talent acquisition, employee relations, and organizational development', '👥', true)
ON CONFLICT (slug) 
DO UPDATE SET 
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;
