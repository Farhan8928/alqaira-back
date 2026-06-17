/**
 * Seed demo catalog for ALQAIRA — sections, style categories and sample
 * products with size variants. Idempotent: categories upsert by slug, products
 * skip if their slug already exists.
 *
 *   node scripts/seedDemoData.js
 *
 * Product images use picsum.photos placeholders — replace with real product
 * photography from the admin panel before going live.
 */
import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { CategoryModel } from "../src/modules/category/category.model.js";
import { ProductModel } from "../src/modules/product/product.model.js";
import { SettingsModel } from "../src/modules/settings/settings.model.js";

const CATEGORIES = [
  // Men — jubba & kurta styles
  { name: "Saudi Style Jubba", slug: "saudi-style-jubba", section: "men", isFeatured: true, displayOrder: 1, description: "Classic Saudi thobe silhouette with a crisp collar and clean placket." },
  { name: "Omani Style Jubba", slug: "omani-style-jubba", section: "men", isFeatured: true, displayOrder: 2, description: "Collarless Omani dishdasha with the signature tassel (furakha)." },
  { name: "Emirati Style Jubba", slug: "emirati-style-jubba", section: "men", isFeatured: true, displayOrder: 3, description: "Refined Emirati kandura with a front pocket and minimal detailing." },
  { name: "Moroccan / Kaftan Style Jubba", slug: "moroccan-kaftan-jubba", section: "men", isFeatured: true, displayOrder: 4, description: "Flowing Moroccan kaftan cut with ornate trims." },
  { name: "Designer / Modern Style Jubba", slug: "designer-modern-jubba", section: "men", isFeatured: true, displayOrder: 5, description: "Contemporary tailored jubbas for the modern gentleman." },
  { name: "Straight Cut Kurta Pajama", slug: "straight-cut-kurta-pajama", section: "men", displayOrder: 6, description: "Timeless straight-cut kurta with matching pajama." },
  { name: "Pathani Kurta Pajama", slug: "pathani-kurta-pajama", section: "men", displayOrder: 7, description: "Rugged Pathani suit with a structured collar and side pockets." },
  // Women
  { name: "Burkha", slug: "burkha", section: "women", isFeatured: true, displayOrder: 1, description: "Elegant, breathable burkhas and abayas crafted from premium fabric." },
  // Kids
  { name: "Kids Kurta & Jubba", slug: "kids-kurta-jubba", section: "kids", isFeatured: true, displayOrder: 1, description: "Festive kurtas and jubbas for little ones." },
];

const SIZES_MEN = ["S", "M", "L", "XL", "XXL"];
const SIZES_WOMEN = ["S", "M", "L", "XL"];
const SIZES_KIDS = ["2-3Y", "4-5Y", "6-7Y", "8-9Y"];

const FABRICS = ["Premium Japan Fabric", "Soft Cotton Blend", "Light Linen", "Nida Crepe"];
const COLORS = ["Off White", "Beige", "Sand", "Navy", "Charcoal", "Olive"];

const POOL_SIZE = { men: 12, women: 8, kids: 6 };

/** Real garment photos bundled in frontend/public/products (men-NN/women-NN/kids-NN.jpg).
 * Deterministic per (seed,n). Replace with your own product photography from the
 * admin panel before going live. */
function img(section, seed, n) {
  const size = POOL_SIZE[section] || POOL_SIZE.men;
  let h = 0;
  const key = `${seed}-${n}`;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100000;
  const idx = (h % size) + 1;
  return `/products/${section}-${String(idx).padStart(2, "0")}.jpg`;
}

function makeVariants(sizes, base) {
  return sizes.map((size, i) => ({
    size,
    stock: base + i * 3,
    sku: `${size}-${Math.floor(1000 + i * 137)}`,
  }));
}

// title templates per category slug
const PRODUCTS_BY_CATEGORY = {
  "saudi-style-jubba": ["Riyadh Classic Thobe", "Najdi Premium Thobe", "Royal Saudi Jubba"],
  "omani-style-jubba": ["Muscat Dishdasha", "Nizwa Tassel Jubba"],
  "emirati-style-jubba": ["Dubai Signature Kandura", "Abu Dhabi Pocket Kandura"],
  "moroccan-kaftan-jubba": ["Marrakech Kaftan", "Fez Embroidered Jubba"],
  "designer-modern-jubba": ["Noir Tailored Jubba", "Onyx Modern Thobe", "Aristo Designer Jubba"],
  "straight-cut-kurta-pajama": ["Ivory Straight Kurta Set", "Cotton Comfort Kurta Set"],
  "pathani-kurta-pajama": ["Khyber Pathani Suit", "Frontier Pathani Set"],
  burkha: ["Layla Flared Abaya", "Noor Premium Burkha", "Dana Embroidered Abaya"],
  "kids-kurta-jubba": ["Little Prince Jubba", "Junior Festive Kurta"],
};

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected.\n");

  // Ensure settings exist
  const settingsExists = await SettingsModel.findOne();
  if (!settingsExists) {
    await SettingsModel.create({});
    console.log("[OK]   Created default settings");
  }

  // Upsert categories
  const catBySlug = {};
  for (const c of CATEGORIES) {
    const cat = await CategoryModel.findOneAndUpdate(
      { slug: c.slug },
      { $set: { ...c, image: img(c.section, c.slug, 0), isActive: true } },
      { new: true, upsert: true },
    );
    catBySlug[c.slug] = cat;
    console.log(`[OK]   Category: ${c.name}`);
  }

  // Products
  let created = 0;
  for (const [slug, names] of Object.entries(PRODUCTS_BY_CATEGORY)) {
    const cat = catBySlug[slug];
    const sizes = cat.section === "women" ? SIZES_WOMEN : cat.section === "kids" ? SIZES_KIDS : SIZES_MEN;
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const productSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (await ProductModel.exists({ slug: productSlug })) {
        console.log(`[SKIP] Product exists: ${name}`);
        continue;
      }
      const price = 1499 + Math.floor(Math.random() * 30) * 100;
      const compareAtPrice = price + 600 + Math.floor(Math.random() * 10) * 100;
      await ProductModel.create({
        name,
        slug: productSlug,
        shortDescription: `${name} — ${cat.name} crafted in premium fabric.`,
        description: `${name} from ALQAIRA's ${cat.name} collection. ${cat.description} Tailored from ${FABRICS[i % FABRICS.length]} for an elegant drape and all-day comfort. Subtle detailing along the placket and cuffs delivers refined simplicity with timeless presence.`,
        category: cat._id,
        categoryName: cat.name,
        section: cat.section,
        price,
        compareAtPrice,
        images: [img(cat.section, productSlug, 1), img(cat.section, productSlug, 2), img(cat.section, productSlug, 3)],
        variants: makeVariants(sizes, 8 + i),
        fabric: FABRICS[i % FABRICS.length],
        color: COLORS[i % COLORS.length],
        careInstructions: "Dry clean recommended. Cool iron. Do not bleach.",
        tags: [cat.section, slug, "premium"],
        rating: 0,
        numReviews: 0,
        isFeatured: i === 0,
        isNewArrival: i % 2 === 0,
        isActive: true,
      });
      created++;
      console.log(`[OK]   Product: ${name}  (₹${price})`);
    }
  }

  console.log(`\nDone. ${created} products created.`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
