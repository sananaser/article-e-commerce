require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Category = require("../src/models/Category");
const Product = require("../src/models/Product");

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const CATEGORIES = ["Dresses", "Tops", "Outerwear"];

const LEGACY_DUPLICATE_NAMES = [
  "Light Blue Striped Wrap Shirt-Dress",
  "Off-the-Shoulder Embellished Velvet Gown",
  "Western Fringe Suede Jacket",
  "Tan V-Neck Puffed Sleeve Midi Dress",
];

const PRODUCTS = [
  {
    name: "Blue and White Striped Wrap Tunic Shirt",
    description:
      "A modern oversized wrap-style shirt with a deep V-neckline, long buttoned cuffs, and a side tie at the hip. Crafted from crisp lightweight cotton poplin with vertical pinstripes in light blue and white. Features an asymmetrical tunic-length hem for an effortless high-fashion look.",
    price: 1499,
    brand: "Luxe Edit",
    category: "Tops",
    stock: 30,
    featured: true,
    images: ["/uploads/products/striped-wrap-tunic-shirt.png"],
  },
  {
    name: "Off-the-Shoulder Embellished Black Velvet Evening Gown",
    description:
      "An elegant floor-length evening gown in plush black velvet with an off-the-shoulder neckline and draped sleeves. The bodice band is adorned with intricate silver crystal floral embellishments. Fitted bodycon silhouette perfect for galas, prom, and black-tie events.",
    price: 5999,
    brand: "Velour Noir",
    category: "Dresses",
    stock: 15,
    featured: true,
    images: ["/uploads/products/black-velvet-evening-gown.png"],
  },
  {
    name: "Suede Fringe Western Jacket",
    description:
      "A waist-length cognac brown suede jacket with dramatic fringe detailing across the chest yoke, sleeves, and side seams. Gold-toned chain accents on the notched lapels add a rustic-glam Western touch. Pairs beautifully with denim for a chic bohemian look.",
    price: 4499,
    brand: "Earthy Roots",
    category: "Outerwear",
    stock: 20,
    featured: false,
    images: ["/uploads/products/suede-fringe-western-jacket.png"],
  },
  {
    name: "Light Brown Linen-Blend Puff Sleeve Midi Dress",
    description:
      "A relaxed linen-blend dress in warm tan with a V-neck puff-sleeve top and a flowy high-waisted midi skirt. The textured fabric and elasticated waistband offer all-day comfort. Perfect for summer outings with a minimalist cottagecore aesthetic.",
    price: 1299,
    brand: "Minimal",
    category: "Dresses",
    stock: 35,
    featured: false,
    images: ["/uploads/products/linen-puff-sleeve-midi-dress.png"],
  },
];

const ensureCategory = async (name) => {
  const slug = slugify(name);
  let category = await Category.findOne({ slug });
  if (!category) {
    category = await Category.create({ name, slug });
    console.log(`Created category: ${name}`);
  }
  return category;
};

const seed = async () => {
  await connectDB();

  const categoryMap = {};
  for (const name of CATEGORIES) {
    categoryMap[name] = await ensureCategory(name);
  }

  const removed = await Product.deleteMany({ name: { $in: LEGACY_DUPLICATE_NAMES } });
  if (removed.deletedCount > 0) {
    console.log(`Removed ${removed.deletedCount} legacy duplicate product(s)`);
  }

  for (const item of PRODUCTS) {
    const existing = await Product.findOne({ name: item.name });
    if (existing) {
      existing.description = item.description;
      existing.price = item.price;
      existing.brand = item.brand;
      existing.category = categoryMap[item.category]._id;
      existing.stock = item.stock;
      existing.featured = item.featured;
      existing.images = item.images;
      await existing.save();
      console.log(`Updated product: ${item.name}`);
      continue;
    }

    await Product.create({
      name: item.name,
      description: item.description,
      price: item.price,
      brand: item.brand,
      category: categoryMap[item.category]._id,
      stock: item.stock,
      featured: item.featured,
      images: item.images,
    });
    console.log(`Created product: ${item.name}`);
  }

  console.log("Seed complete.");
  await mongoose.connection.close();
};

seed().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.connection.close();
  process.exit(1);
});
