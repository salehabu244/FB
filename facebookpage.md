
wrapped in word is my page name: 
# Project: Modern Custom Bouquet Landing Page & Online Ordering System

Act as a senior UI/UX designer, full-stack developer, and e-commerce specialist. Build a complete, modern, responsive bouquet customization website for a small bouquet business. The website will receive customers from my Facebook business page when they click the **Order Now** button.

The website must look premium, romantic, modern, visually attractive, and trustworthy. It should work smoothly on mobile phones, since most customers will arrive from Facebook.

## 1. Design and Brand Direction

Create a premium floral boutique design with:

- Soft blush pink, cream, ivory, sage green, and warm brown colors.
- Elegant typography combining a sophisticated serif font for headings with a clean sans-serif font for body text.
- Realistic bouquet photography, beautiful flower illustrations where needed, soft shadows, rounded cards, and subtle animations.
- A clean, luxury-inspired layout with generous spacing.
- Smooth scrolling, interactive controls, and polished loading states.
- Mobile-first responsive design for phones, tablets, and desktops.
- A floating WhatsApp contact button.
- A sticky mobile order summary and clear call-to-action buttons.

The visual experience should resemble a real online floral boutique, not a generic template.

Use the business name “Bloom & Beyond” as a temporary placeholder. Make the business name, logo, contact information, currency, prices, delivery fees, and brand colors easy to change later.

## 2. Landing Page Structure

Create the following sections:

### A. Hero Section

Display:
- A beautiful, realistic flower-and-book bouquet as the main hero image.
- Headline: “A Bouquet That Tells Your Story.”
- Subheading: “Choose your favorite flowers, wrap them in your favorite colors, and add a personal message.”
- Primary CTA: “Create Your Bouquet.”
- Secondary CTA: “Explore Ready-Made Bouquets.”

Add a small trust section such as “Made with Love,” “Personalized Gifts,” and “Handcrafted for You.”

The primary CTA should scroll to the bouquet customization section.

### B. Default Signature Bouquet

When a customer first visits the page, show a preconfigured signature bouquet.

Default configuration:
- 5 flowers.
- 2 books wrapped with decorative wrapping paper.
- Coordinated floral arrangement.
- A choice of wrapping paper color.
- Optional handwritten or printed note.
- A decorative ribbon and suitable bouquet accessories.

Display the bouquet's price, a realistic product image, and a “Customize This Bouquet” button.

Show an itemized list of included materials, such as flowers, books, wrapping paper, ribbon, note card, floral tape, and protective wrapping.

Do not imply that every accessory is included in the base price unless configured by the business owner.

### C. Interactive Bouquet Customizer

Build a multi-step customization experience with a progress indicator.

**Step 1 — Choose Your Flowers**

Allow customers to select their total number of flowers and the quantity of each flower type.

Include these flower varieties:
- Roses
- Peonies
- Ranunculus
- Lilies
- Gerbera daisies
- Tulips
- Sunflowers
- Carnations
- Hydrangeas
- Baby's breath

For each variety, show:
- A realistic flower image.
- Flower name.
- Available colors.
- Price per stem.
- Quantity selector with plus and minus buttons.

Allow multiple flower varieties in the same bouquet.

The default bouquet should contain 5 flowers, but customers can increase or decrease the total number. The selected quantities must update the total flower count and price automatically.

If a flower is unavailable, mark it as unavailable instead of allowing the customer to order it.

**Step 2 — Add Books and Gifts**

Let customers select:
- Number of books.
- Optional additional gifts.
- Gift tags or cards.
- Optional small accessories.

Default book quantity: 2.

Display extra charges for additional books and gifts. Support optional book titles or customer preferences.

**Step 3 — Choose Wrapping Paper**

Display visual swatches and previews for:
- Blush pink
- White
- Cream
- Kraft brown
- Lavender
- Light blue
- Sage green
- Black
- Floral print
- Premium patterned paper

Allow the customer to select a wrapping style, such as classic wrap, layered wrap, or premium wrap, if available.

Update the bouquet preview when the wrapping color or style changes.

**Step 4 — Personalize the Note**

Give customers two options:
1. Handwritten note.
2. Printed note.

Allow the customer to enter a personalized message and preview it on a card.

Include an optional sender name and recipient name.

Enforce a configurable character limit and clearly display any extra charges.

**Step 5 — Delivery Options**

Provide two delivery options:

- **Express Delivery — Today:** Available only when the order is placed before the configured cutoff time and the delivery area and stock permit it.
- **Standard Delivery — Within 3 Days:** Show the expected delivery date based on the business's delivery policy.

Collect:
- Customer name.
- Phone number.
- WhatsApp number, if different.
- Delivery address.
- Area or district.
- Preferred delivery date and time window, where available.
- Optional delivery instructions.

Show delivery charges clearly before checkout. Never promise same-day delivery if the configured rules or availability do not permit it.

**Step 6 — Special Requests**

Add a large text area labeled “Tell us how you imagine your bouquet.”

Customers can request specific flower arrangements, colors, book themes, wrapping styles, budget limits, or other special details.

Allow customers to upload an optional inspiration photo, subject to secure upload limits.

**Step 7 — Review Your Bouquet**

Display a final summary containing:
- Selected flowers and quantities.
- Total number of flowers.
- Number of books.
- Wrapping paper color and style.
- Note type and message.
- Additional gifts.
- Delivery method and address.
- Special instructions.
- Itemized subtotal, delivery fee, discounts, and final total.

Include buttons to edit each section and a prominent “Place My Order” button.

## 3. Realistic Live Bouquet Preview

This is one of the most important features.

Create a large, attractive bouquet preview that updates as the customer customizes the arrangement.

When the customer:
- Adds or removes flowers.
- Changes flower varieties or colors.
- Adds or removes books.
- Changes wrapping paper.
- Changes wrapping style.
- Adds ribbons or accessories.
- Selects a note card.

…the preview should reflect those choices as accurately as possible.

Do not implement this as a static image that never changes.

Preferred implementation:
- Use a layered bouquet renderer with transparent flower assets, wrapping-paper assets, ribbons, books, and note-card assets.
- Position and scale the assets to create a cohesive bouquet composition.
- Use deterministic layouts so the same configuration produces the same preview.
- Provide a responsive preview for mobile and desktop.
- Show a fallback preview and clear loading states if an asset is unavailable.

If suitable assets and time allow, create an optional more advanced 2D or 3D preview. Prioritize a reliable, attractive live preview over an unfinished 3D experience.

Clearly label the preview as an illustration if it does not perfectly represent the final handcrafted bouquet.

## 4. Ready-Made Bouquet Packages

Below the customizer, create a section called “Choose a Bouquet Made for You.”

Include editable package cards with attractive product images.

Initial package concepts:

**Mini Bloom**
- 3 flowers.
- 1 book.
- Basic wrapping.
- Gift note option.

**Signature Bloom**
- 5 flowers.
- 2 books.
- Premium coordinated wrapping.
- Personalized note.

**Grand Romance**
- 9 flowers.
- 2 books.
- Premium wrapping and ribbon.
- Personalized note.

**Luxury Surprise**
- 12 flowers.
- 3 books.
- Luxury wrapping.
- Premium card and selected accessories.

These are example configurations. All prices, available products, and inclusions must be editable in the admin settings.

Each package must have:
- Product image.
- Name and description.
- Starting price.
- Included items.
- “Choose Package” button.
- “Customize” button.

When a package is selected, load its configuration into the bouquet customizer so the customer can personalize it.

## 5. Dynamic Pricing System

Build a reliable pricing engine.

The final price must be calculated on the server using trusted product prices and configuration, not simply accepted from the customer's browser.

Calculate:

- Flower prices by variety, quantity, and selected options.
- Book prices.
- Wrapping paper and premium wrapping fees.
- Note card or printing fees.
- Additional gifts and accessories.
- Delivery charges.
- Discounts, if enabled.
- Final order total.

Show a live estimated price as the customer makes selections. Revalidate all prices and inventory when the order is submitted.

Use a configurable currency setting. Set BDT (৳) as the initial currency, but allow the business owner to change it.

## 6. Customer Checkout and Order Submission

Create a polished checkout form with validation.

Required information:
- Customer name.
- Phone number.
- Delivery address.
- Delivery option.
- Final bouquet configuration.

Optional information:
- Email address.
- Recipient name.
- Different WhatsApp number.
- Personal note.
- Inspiration photo.
- Special instructions.

When the customer clicks “Place My Order”:

1. Validate all customer and bouquet information.
2. Create a unique order ID.
3. Calculate and validate the final price on the server.
4. Save the complete order to the database.
5. Save the selected flower quantities, options, delivery details, note, special requests, and price breakdown.
6. Generate a human-readable order summary.
7. Trigger a WhatsApp notification workflow.
8. Send an order notification email to the business.
9. Send an order confirmation email to the customer when an email address is provided.
10. Show a success page with the order ID, order summary, total amount, and next steps.

Prevent accidental duplicate orders and provide a useful error message if an order fails.

Do not show a success message until the order has actually been saved successfully.

## 7. Database and Backend

Use Supabase as the preferred backend and database, with PostgreSQL.

Create database tables for:

- products
- flower varieties
- flower colors
- ready-made packages
- wrapping options
- accessories
- delivery options
- orders
- order items
- order flower selections
- customer delivery details
- order status history
- business settings

Use appropriate primary keys, relationships, timestamps, and indexes.

Store the complete bouquet configuration as structured order data so that the business owner can reconstruct what the customer ordered.

Implement secure database policies, server-side validation, and protected admin access.

Use secure Supabase Edge Functions or Netlify Functions for order processing, pricing validation, email delivery, and WhatsApp integration.

Never expose database service-role keys, email API keys, WhatsApp access tokens, or other private credentials in frontend code.

## 8. WhatsApp Integration

Integrate WhatsApp notifications using the official WhatsApp Business Platform Cloud API or a suitable authorized provider.

After an order is saved, send an order notification to the configured business WhatsApp number.

Example message:

“NEW BOUQUET ORDER

Order ID: [Order ID]
Customer: [Customer Name]
Phone: [Customer Phone]

BOUQUET DETAILS
Flowers: [Variety and Quantity]
Total Flowers: [Total]
Books: [Quantity]
Wrapping: [Color and Style]
Note Type: [Handwritten/Printed]
Message: [Personalized Message]

DELIVERY
Type: [Express/Standard]
Address: [Delivery Address]

SPECIAL REQUESTS
[Customer Instructions]

ORDER TOTAL: [Currency and Amount]”

Include an optional customer-facing WhatsApp button that opens a conversation with the business.

Use official, authorized integration methods. Do not pretend that a WhatsApp message was sent if the API request failed.

If the official WhatsApp API requires templates, customer consent, or additional configuration, implement the required workflow and explain which settings the owner must complete.

## 9. Email Notifications

Integrate a transactional email provider such as Resend.

Send the business a formatted order notification containing:
- Order ID.
- Customer contact information.
- Bouquet configuration.
- Customer note.
- Delivery information.
- Special requests.
- Itemized pricing.
- Link to view the order in the admin dashboard.

Send the customer a separate order confirmation email when an email address is provided.

Use environment variables for all API keys and sender settings.

Implement error logging and retry-safe notification handling. If email or WhatsApp fails after an order is saved, retain the order and allow the notification to be retried.

## 10. Admin Dashboard

Build a protected admin dashboard so the business owner can manage the store without editing source code.

Features:
- Secure admin login.
- View all orders.
- Search orders by ID, customer name, or phone.
- Filter orders by date, delivery type, and status.
- View complete bouquet configurations.
- View uploaded inspiration photos securely.
- Update order status: Pending, Confirmed, Preparing, Ready, Out for Delivery, Delivered, or Cancelled.
- View payment status.
- Manage flower types, colors, prices, and stock availability.
- Manage books, wrapping options, and accessories.
- Edit ready-made packages.
- Configure delivery charges and same-day cutoff times.
- Configure business WhatsApp number and notification email.
- Export orders to CSV.
- Retry failed notifications.

Protect the admin area and never expose customer orders publicly.

## 11. Netlify Deployment

The website must be deployable on Netlify.

Preferred architecture:
- Frontend: React with TypeScript and Vite.
- Styling: Tailwind CSS with reusable components.
- Icons: Lucide.
- Backend functions: Netlify Functions.
- Database: Supabase PostgreSQL.
- File storage: Supabase Storage or another secure object storage service.
- Email: Resend.
- WhatsApp: WhatsApp Business Platform Cloud API or an authorized provider.

Requirements:
- Provide a complete project structure.
- Include all required source files.
- Configure the build command and publish directory.
- Add Netlify function configuration.
- Include a `.env.example` file with placeholder values only.
- Include database schema and migration files.
- Provide setup instructions for Supabase, email, and WhatsApp.
- Configure appropriate redirects and SPA routing.
- Never commit real API keys or secrets.
- Add production error handling and secure logging.

Use environment variables for the frontend's public Supabase URL and publishable key, and keep privileged credentials server-side.

## 12. Facebook Page Integration

Optimize the landing page for Facebook traffic.

Requirements:
- Use a clear, mobile-friendly URL.
- Provide a Facebook “Order Now” destination URL.
- Make the primary CTA visible immediately.
- Optimize image sizes and loading speed.
- Add Open Graph metadata for attractive Facebook link previews.
- Add a custom title, description, and social sharing image.
- Add Facebook Pixel integration as an optional feature, configurable through environment settings.
- Support conversion tracking for checkout completion only after the relevant event actually occurs and required consent is handled.
- Preserve relevant campaign tracking parameters where appropriate.
- Ensure the page works correctly inside mobile browsers and Facebook's in-app browser.

Suggested page title:
“Create Your Own Flower & Book Bouquet | Bloom & Beyond”

Suggested meta description:
“Design a personalized bouquet with your favorite flowers, books, beautiful wrapping, and a special message. Create your gift and order online.”

## 13. UI/UX and Quality Requirements

- Build real working functionality, not just a static visual mockup.
- Use reusable, maintainable components.
- Keep the customization process simple and enjoyable.
- Display loading, empty, success, and error states.
- Validate forms accessibly.
- Ensure keyboard navigation and readable contrast.
- Optimize images and avoid unnecessary JavaScript.
- Support modern mobile and desktop browsers.
- Make all prices and stock status configurable.
- Include clear privacy and order policies.
- Include customer consent where needed for data processing and messaging.
- Do not invent successful payments, saved orders, or sent notifications.

## 14. Development Deliverables

Deliver the project in working stages:

1. Build the complete responsive landing page.
2. Implement the live bouquet customizer and dynamic preview.
3. Implement the ready-made packages and pricing engine.
4. Connect Supabase and create the database schema.
5. Implement secure checkout and order persistence.
6. Integrate WhatsApp and email notifications.
7. Build the protected admin dashboard.
8. Add Facebook metadata and conversion tracking.
9. Test the entire customer journey.
10. Prepare the Netlify deployment and configuration guide.

Include a README that explains installation, local development, database setup, environment variables, API integrations, testing, and deployment.

Before declaring the project complete, test the following journey:

A customer arrives from Facebook → sees the default bouquet with 5 flowers and 2 books → changes flower varieties and quantities → chooses wrapping paper → adds a personalized note → selects delivery → views the updated bouquet preview and price → submits an order → receives an order ID → the order appears in Supabase → the business receives WhatsApp and email notifications → the owner manages the order from the admin dashboard.

**Final requirement:** Build a polished, functional, production-oriented bouquet ordering platform. Prioritize a beautiful shopping experience, accurate pricing, realistic customization, secure order storage, reliable notifications, and straightforward Netlify deployment. If any third-party service requires credentials or business verification, implement the integration and document the remaining configuration instead of faking the functionality.






Recents
Deploying to Netlify with markdown documentation
13 minutes ago
Instructions
Add instructions to tailor Claude’s responses

Context
1% of project capacity used

facebook landing page
18.3kB

text



facebook landing page
# Project: Modern Custom Bouquet Landing Page & Online Ordering System
 
Act as a senior UI/UX designer, full-stack developer, and e-commerce specialist. Build a complete, modern, responsive bouquet customization website for a small bouquet business. The website will receive customers from my Facebook business page when they click the **Order Now** button.
 
The website must look premium, romantic, modern, visually attractive, and trustworthy. It should work smoothly on mobile phones, since most customers will arrive from Facebook.
 
## 1. Design and Brand Direction
 
Create a premium floral boutique design with:
 
- Soft blush pink, cream, ivory, sage green, and warm brown colors.
- Elegant typography combining a sophisticated serif font for headings with a clean sans-serif font for body text.
- Realistic bouquet photography, beautiful flower illustrations where needed, soft shadows, rounded cards, and subtle animations.
- A clean, luxury-inspired layout with generous spacing.
- Smooth scrolling, interactive controls, and polished loading states.
- Mobile-first responsive design for phones, tablets, and desktops.
- A floating WhatsApp contact button.
- A sticky mobile order summary and clear call-to-action buttons.
 
The visual experience should resemble a real online floral boutique, not a generic template.
 
Use the business name “Bloom & Beyond” as a temporary placeholder. Make the business name, logo, contact information, currency, prices, delivery fees, and brand colors easy to change later.
 
## 2. Landing Page Structure
 
Create the following sections:
 
### A. Hero Section
 
Display:
- A beautiful, realistic flower-and-book bouquet as the main hero image.
- Headline: “A Bouquet That Tells Your Story.”
- Subheading: “Choose your favorite flowers, wrap them in your favorite colors, and add a personal message.”
- Primary CTA: “Create Your Bouquet.”
- Secondary CTA: “Explore Ready-Made Bouquets.”
 
Add a small trust section such as “Made with Love,” “Personalized Gifts,” and “Handcrafted for You.”
 
The primary CTA should scroll to the bouquet customization section.
 
### B. Default Signature Bouquet
 
When a customer first visits the page, show a preconfigured signature bouquet.
 
Default configuration:
- 5 flowers.
- 2 books wrapped with decorative wrapping paper.
- Coordinated floral arrangement.
- A choice of wrapping paper color.
- Optional handwritten or printed note.
- A decorative ribbon and suitable bouquet accessories.
 
Display the bouquet's price, a realistic product image, and a “Customize This Bouquet” button.
 
Show an itemized list of included materials, such as flowers, books, wrapping paper, ribbon, note card, floral tape, and protective wrapping.
 
Do not imply that every accessory is included in the base price unless configured by the business owner.
 
### C. Interactive Bouquet Customizer
 
Build a multi-step customization experience with a progress indicator.
 
**Step 1 — Choose Your Flowers**
 
Allow customers to select their total number of flowers and the quantity of each flower type.
 
Include these flower varieties:
- Roses
- Peonies
- Ranunculus
- Lilies
- Gerbera daisies
- Tulips
- Sunflowers
- Carnations
- Hydrangeas
- Baby's breath
 
For each variety, show:
- A realistic flower image.
- Flower name.
- Available colors.
- Price per stem.
- Quantity selector with plus and minus buttons.
 
Allow multiple flower varieties in the same bouquet.
 
The default bouquet should contain 5 flowers, but customers can increase or decrease the total number. The selected quantities must update the total flower count and price automatically.
 
If a flower is unavailable, mark it as unavailable instead of allowing the customer to order it.
 
**Step 2 — Add Books and Gifts**
 
Let customers select:
- Number of books.
- Optional additional gifts.
- Gift tags or cards.
- Optional small accessories.
 
Default book quantity: 2.
 
Display extra charges for additional books and gifts. Support optional book titles or customer preferences.
 
**Step 3 — Choose Wrapping Paper**
 
Display visual swatches and previews for:
- Blush pink
- White
- Cream
- Kraft brown
- Lavender
- Light blue
- Sage green
- Black
- Floral print
- Premium patterned paper
 
Allow the customer to select a wrapping style, such as classic wrap, layered wrap, or premium wrap, if available.
 
Update the bouquet preview when the wrapping color or style changes.
 
**Step 4 — Personalize the Note**
 
Give customers two options:
1. Handwritten note.
2. Printed note.
 
Allow the customer to enter a personalized message and preview it on a card.
 
Include an optional sender name and recipient name.
 
Enforce a configurable character limit and clearly display any extra charges.
 
**Step 5 — Delivery Options**
 
Provide two delivery options:
 
- **Express Delivery — Today:** Available only when the order is placed before the configured cutoff time and the delivery area and stock permit it.
- **Standard Delivery — Within 3 Days:** Show the expected delivery date based on the business's delivery policy.
 
Collect:
- Customer name.
- Phone number.
- WhatsApp number, if different.
- Delivery address.
- Area or district.
- Preferred delivery date and time window, where available.
- Optional delivery instructions.
 
Show delivery charges clearly before checkout. Never promise same-day delivery if the configured rules or availability do not permit it.
 
**Step 6 — Special Requests**
 
Add a large text area labeled “Tell us how you imagine your bouquet.”
 
Customers can request specific flower arrangements, colors, book themes, wrapping styles, budget limits, or other special details.
 
Allow customers to upload an optional inspiration photo, subject to secure upload limits.
 
**Step 7 — Review Your Bouquet**
 
Display a final summary containing:
- Selected flowers and quantities.
- Total number of flowers.
- Number of books.
- Wrapping paper color and style.
- Note type and message.
- Additional gifts.
- Delivery method and address.
- Special instructions.
- Itemized subtotal, delivery fee, discounts, and final total.
 
Include buttons to edit each section and a prominent “Place My Order” button.
 
## 3. Realistic Live Bouquet Preview
 
This is one of the most important features.
 
Create a large, attractive bouquet preview that updates as the customer customizes the arrangement.
 
When the customer:
- Adds or removes flowers.
- Changes flower varieties or colors.
- Adds or removes books.
- Changes wrapping paper.
- Changes wrapping style.
- Adds ribbons or accessories.
- Selects a note card.
 
…the preview should reflect those choices as accurately as possible.
 
Do not implement this as a static image that never changes.
 
Preferred implementation:
- Use a layered bouquet renderer with transparent flower assets, wrapping-paper assets, ribbons, books, and note-card assets.
- Position and scale the assets to create a cohesive bouquet composition.
- Use deterministic layouts so the same configuration produces the same preview.
- Provide a responsive preview for mobile and desktop.
- Show a fallback preview and clear loading states if an asset is unavailable.
 
If suitable assets and time allow, create an optional more advanced 2D or 3D preview. Prioritize a reliable, attractive live preview over an unfinished 3D experience.
 
Clearly label the preview as an illustration if it does not perfectly represent the final handcrafted bouquet.
 
## 4. Ready-Made Bouquet Packages
 
Below the customizer, create a section called “Choose a Bouquet Made for You.”
 
Include editable package cards with attractive product images.
 
Initial package concepts:
 
**Mini Bloom**
- 3 flowers.
- 1 book.
- Basic wrapping.
- Gift note option.
 
**Signature Bloom**
- 5 flowers.
- 2 books.
- Premium coordinated wrapping.
- Personalized note.
 
**Grand Romance**
- 9 flowers.
- 2 books.
- Premium wrapping and ribbon.
- Personalized note.
 
**Luxury Surprise**
- 12 flowers.
- 3 books.
- Luxury wrapping.
- Premium card and selected accessories.
 
These are example configurations. All prices, available products, and inclusions must be editable in the admin settings.
 
Each package must have:
- Product image.
- Name and description.
- Starting price.
- Included items.
- “Choose Package” button.
- “Customize” button.
 
When a package is selected, load its configuration into the bouquet customizer so the customer can personalize it.
 
## 5. Dynamic Pricing System
 
Build a reliable pricing engine.
 
The final price must be calculated on the server using trusted product prices and configuration, not simply accepted from the customer's browser.
 
Calculate:
 
- Flower prices by variety, quantity, and selected options.
- Book prices.
- Wrapping paper and premium wrapping fees.
- Note card or printing fees.
- Additional gifts and accessories.
- Delivery charges.
- Discounts, if enabled.
- Final order total.
 
Show a live estimated price as the customer makes selections. Revalidate all prices and inventory when the order is submitted.
 
Use a configurable currency setting. Set BDT (৳) as the initial currency, but allow the business owner to change it.
 
## 6. Customer Checkout and Order Submission
 
Create a polished checkout form with validation.
 
Required information:
- Customer name.
- Phone number.
- Delivery address.
- Delivery option.
- Final bouquet configuration.
 
Optional information:
- Email address.
- Recipient name.
- Different WhatsApp number.
- Personal note.
- Inspiration photo.
- Special instructions.
 
When the customer clicks “Place My Order”:
 
1. Validate all customer and bouquet information.
2. Create a unique order ID.
3. Calculate and validate the final price on the server.
4. Save the complete order to the database.
5. Save the selected flower quantities, options, delivery details, note, special requests, and price breakdown.
6. Generate a human-readable order summary.
7. Trigger a WhatsApp notification workflow.
8. Send an order notification email to the business.
9. Send an order confirmation email to the customer when an email address is provided.
10. Show a success page with the order ID, order summary, total amount, and next steps.
 
Prevent accidental duplicate orders and provide a useful error message if an order fails.
 
Do not show a success message until the order has actually been saved successfully.
 
## 7. Database and Backend
 
Use Supabase as the preferred backend and database, with PostgreSQL.
 
Create database tables for:
 
- products
- flower varieties
- flower colors
- ready-made packages
- wrapping options
- accessories
- delivery options
- orders
- order items
- order flower selections
- customer delivery details
- order status history
- business settings
 
Use appropriate primary keys, relationships, timestamps, and indexes.
 
Store the complete bouquet configuration as structured order data so that the business owner can reconstruct what the customer ordered.
 
Implement secure database policies, server-side validation, and protected admin access.
 
Use secure Supabase Edge Functions or Netlify Functions for order processing, pricing validation, email delivery, and WhatsApp integration.
 
Never expose database service-role keys, email API keys, WhatsApp access tokens, or other private credentials in frontend code.
 
## 8. WhatsApp Integration
 
Integrate WhatsApp notifications using the official WhatsApp Business Platform Cloud API or a suitable authorized provider.
 
After an order is saved, send an order notification to the configured business WhatsApp number.
 
Example message:
 
“NEW BOUQUET ORDER
 
Order ID: [Order ID]
Customer: [Customer Name]
Phone: [Customer Phone]
 
BOUQUET DETAILS
Flowers: [Variety and Quantity]
Total Flowers: [Total]
Books: [Quantity]
Wrapping: [Color and Style]
Note Type: [Handwritten/Printed]
Message: [Personalized Message]
 
DELIVERY
Type: [Express/Standard]
Address: [Delivery Address]
 
SPECIAL REQUESTS
[Customer Instructions]
 
ORDER TOTAL: [Currency and Amount]”
 
Include an optional customer-facing WhatsApp button that opens a conversation with the business.
 
Use official, authorized integration methods. Do not pretend that a WhatsApp message was sent if the API request failed.
 
If the official WhatsApp API requires templates, customer consent, or additional configuration, implement the required workflow and explain which settings the owner must complete.
 
## 9. Email Notifications
 
Integrate a transactional email provider such as Resend.
 
Send the business a formatted order notification containing:
- Order ID.
- Customer contact information.
- Bouquet configuration.
- Customer note.
- Delivery information.
- Special requests.
- Itemized pricing.
- Link to view the order in the admin dashboard.
 
Send the customer a separate order confirmation email when an email address is provided.
 
Use environment variables for all API keys and sender settings.
 
Implement error logging and retry-safe notification handling. If email or WhatsApp fails after an order is saved, retain the order and allow the notification to be retried.
 
## 10. Admin Dashboard
 
Build a protected admin dashboard so the business owner can manage the store without editing source code.
 
Features:
- Secure admin login.
- View all orders.
- Search orders by ID, customer name, or phone.
- Filter orders by date, delivery type, and status.
- View complete bouquet configurations.
- View uploaded inspiration photos securely.
- Update order status: Pending, Confirmed, Preparing, Ready, Out for Delivery, Delivered, or Cancelled.
- View payment status.
- Manage flower types, colors, prices, and stock availability.
- Manage books, wrapping options, and accessories.
- Edit ready-made packages.
- Configure delivery charges and same-day cutoff times.
- Configure business WhatsApp number and notification email.
- Export orders to CSV.
- Retry failed notifications.
 
Protect the admin area and never expose customer orders publicly.
 
## 11. Netlify Deployment
 
The website must be deployable on Netlify.
 
Preferred architecture:
- Frontend: React with TypeScript and Vite.
- Styling: Tailwind CSS with reusable components.
- Icons: Lucide.
- Backend functions: Netlify Functions.
- Database: Supabase PostgreSQL.
- File storage: Supabase Storage or another secure object storage service.
- Email: Resend.
- WhatsApp: WhatsApp Business Platform Cloud API or an authorized provider.
 
Requirements:
- Provide a complete project structure.
- Include all required source files.
- Configure the build command and publish directory.
- Add Netlify function configuration.
- Include a `.env.example` file with placeholder values only.
- Include database schema and migration files.
- Provide setup instructions for Supabase, email, and WhatsApp.
- Configure appropriate redirects and SPA routing.
- Never commit real API keys or secrets.
- Add production error handling and secure logging.
 
Use environment variables for the frontend's public Supabase URL and publishable key, and keep privileged credentials server-side.
 
## 12. Facebook Page Integration
 
Optimize the landing page for Facebook traffic.
 
Requirements:
- Use a clear, mobile-friendly URL.
- Provide a Facebook “Order Now” destination URL.
- Make the primary CTA visible immediately.
- Optimize image sizes and loading speed.
- Add Open Graph metadata for attractive Facebook link previews.
- Add a custom title, description, and social sharing image.
- Add Facebook Pixel integration as an optional feature, configurable through environment settings.
- Support conversion tracking for checkout completion only after the relevant event actually occurs and required consent is handled.
- Preserve relevant campaign tracking parameters where appropriate.
- Ensure the page works correctly inside mobile browsers and Facebook's in-app browser.
 
Suggested page title:
“Create Your Own Flower & Book Bouquet | Bloom & Beyond”
 
Suggested meta description:
“Design a personalized bouquet with your favorite flowers, books, beautiful wrapping, and a special message. Create your gift and order online.”
 
## 13. UI/UX and Quality Requirements
 
- Build real working functionality, not just a static visual mockup.
- Use reusable, maintainable components.
- Keep the customization process simple and enjoyable.
- Display loading, empty, success, and error states.
- Validate forms accessibly.
- Ensure keyboard navigation and readable contrast.
- Optimize images and avoid unnecessary JavaScript.
- Support modern mobile and desktop browsers.
- Make all prices and stock status configurable.
- Include clear privacy and order policies.
- Include customer consent where needed for data processing and messaging.
- Do not invent successful payments, saved orders, or sent notifications.
 
## 14. Development Deliverables
 
Deliver the project in working stages:
 
1. Build the complete responsive landing page.
2. Implement the live bouquet customizer and dynamic preview.
3. Implement the ready-made packages and pricing engine.
4. Connect Supabase and create the database schema.
5. Implement secure checkout and order persistence.
6. Integrate WhatsApp and email notifications.
7. Build the protected admin dashboard.
8. Add Facebook metadata and conversion tracking.
9. Test the entire customer journey.
10. Prepare the Netlify deployment and configuration guide.
11. Aslo use the netlify database for store data.
 
Include a README that explains installation, local development, database setup, environment variables, API integrations, testing, and deployment.
 
Before declaring the project complete, test the following journey:
 
A customer arrives from Facebook → sees the default bouquet with 5 flowers and 2 books → changes flower varieties and quantities → chooses wrapping paper → adds a personalized note → selects delivery → views the updated bouquet preview and price → submits an order → receives an order ID → the order appears in Supabase → the business receives WhatsApp and email notifications → the owner manages the order from the admin dashboard.
 
**Final requirement:** Build a polished, functional, production-oriented bouquet ordering platform. Prioritize a beautiful shopping experience, accurate pricing, realistic customization, secure order storage, reliable notifications, and straightforward Netlify deployment. If any third-party service requires credentials or business verification, implement the integration and document the remaining configuration instead of faking the functionality.


