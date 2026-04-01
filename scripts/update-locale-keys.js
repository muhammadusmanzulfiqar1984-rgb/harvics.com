#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');

// New keys to add (in English - will be used as placeholders)
const newKeys = {
  "supplierPortal": {
    "dashboard": {
      "loading": "Loading supplier cockpit…",
      "purchaseOrders": "Purchase orders",
      "purchaseOrdersSubtitle": "Raised by Harvics",
      "shipments": "Shipments / GRN",
      "shipmentsSubtitle": "Accepted this week",
      "invoices": "Invoices created",
      "invoicesSubtitle": "Awaiting payment",
      "paymentsPending": "Payments pending",
      "paymentsPendingSubtitle": "Scheduled for release",
      "qualityComplaints": "Quality / complaints",
      "qualityComplaintsSubtitle": "Open tickets",
      "forecast": "Forecast (next 4 weeks)",
      "forecastSubtitle": "AI placeholder",
      "supplierActions": "Supplier actions",
      "action1": "Confirm upcoming shipments and update GRN schedule.",
      "action2": "Review outstanding invoices and share payment advice.",
      "action3": "Resolve open quality complaints with QA evidence."
    }
  },
  "form": {
    "username": "Username",
    "password": "Password",
    "email": "Email",
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "search": "Search",
    "filter": "Filter",
    "reset": "Reset",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "confirm": "Confirm"
  },
  "faq": {
    "products": {
      "category": "Products",
      "q1": "What products does Harvics offer?",
      "a1": "We offer a wide range of premium food products including confectionery, beverages, snacks, pasta, bakery items, and frozen foods across multiple categories.",
      "q2": "Where can I buy Harvics products?",
      "a2": "Our products are available in retail stores across 40+ countries. Use our store locator or contact page to find a retailer near you.",
      "q3": "Do you offer bulk ordering?",
      "a3": "Yes, we offer bulk order discounts for businesses and retailers. Visit our Bulk Order Discounts page for more information."
    },
    "ordersShipping": {
      "category": "Orders & Shipping",
      "q1": "What are your shipping options?",
      "a1": "We offer various shipping options including standard, express, and international shipping. Free shipping is available on orders over $50.",
      "q2": "How long does delivery take?",
      "a2": "Delivery times vary by location. Standard delivery typically takes 5-7 business days, while express delivery takes 2-3 business days.",
      "q3": "Can I track my order?",
      "a3": "Yes, you can track your order using the tracking number provided in your order confirmation email."
    },
    "accountPayments": {
      "category": "Account & Payments",
      "q1": "How do I create an account?",
      "a1": "Click on \"Sign In\" in the header and select \"Create Account\" to register for a new account.",
      "q2": "What payment methods do you accept?",
      "a2": "We accept all major credit cards, debit cards, PayPal, and bank transfers for B2B orders.",
      "q3": "Is my payment information secure?",
      "a3": "Yes, we use industry-standard encryption to protect your payment information."
    },
    "returnsRefunds": {
      "category": "Returns & Refunds",
      "q1": "What is your return policy?",
      "a1": "We offer a 30-day return policy for unopened products in original packaging. Please contact our customer service for return authorization.",
      "q2": "How do I request a refund?",
      "a2": "Contact our customer service team with your order number and reason for return. We will process your refund within 5-7 business days."
    },
    "contactCta": {
      "title": "Still Have Questions?",
      "subtitle": "Our customer service team is here to help",
      "button": "Contact Us"
    }
  }
};

// Get all JSON files except en.json
const files = fs.readdirSync(localesDir)
  .filter(f => f.endsWith('.json') && f !== 'en.json');

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    
    // Check if keys already exist
    if (json.supplierPortal && json.form && json.faq) {
      console.log(`⏭️  Skipped ${file} - keys already exist`);
      skipped++;
      return;
    }
    
    // Add new keys
    json.supplierPortal = newKeys.supplierPortal;
    json.form = newKeys.form;
    json.faq = newKeys.faq;
    
    // Write back with proper formatting
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    console.log(`✅ Updated ${file}`);
    updated++;
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✅ Updated: ${updated} files`);
console.log(`⏭️  Skipped: ${skipped} files`);
console.log(`📝 Total processed: ${files.length} files`);
