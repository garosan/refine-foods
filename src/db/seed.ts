import { faker } from "@faker-js/faker";
import { db } from "./index";
import {
  stores,
  categories,
  products,
  customers,
  couriers,
  orders,
  orderItems,
} from "./schema";

// Volumes per PRD §7 — do not change without updating the PRD.
const COUNTS = {
  stores: 20,
  categories: 10,
  products: 79,
  customers: 600,
  couriers: 70,
  orders: 1200,
};

const CATEGORY_DEFS = [
  { title: "Starters", icon: "🍢" },
  { title: "Pastas", icon: "🍝" },
  { title: "Pizzas", icon: "🍕" },
  { title: "Burgers", icon: "🍔" },
  { title: "Deserts", icon: "🍰" },
  { title: "Salads", icon: "🥗" },
  { title: "Grilled Meat", icon: "🥩" },
  { title: "Chicken", icon: "🍗" },
  { title: "Cold Drinks", icon: "🥤" },
  { title: "Hot Drinks", icon: "☕" },
];

function id(prefix: string, n: number) {
  return `${prefix}_${n}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log("Seeding database...");

  // Stores
  const storeRows = Array.from({ length: COUNTS.stores }, (_, i) => ({
    id: id("store", i + 1),
    title: `${faker.location.street()} Branch`,
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress({ useFullAddress: true }),
    lat: faker.location.latitude({ min: 40.5, max: 40.9 }),
    lng: faker.location.longitude({ min: -74.1, max: -73.7 }),
    status: faker.helpers.arrayElement(["Open", "Closed"] as const),
    createdAt: faker.date.past({ years: 1 }),
  }));
  await db.insert(stores).values(storeRows);

  // Categories
  const categoryRows = CATEGORY_DEFS.map((c, i) => ({
    id: id("cat", i + 1),
    title: c.title,
    icon: c.icon,
    status: "Visible" as const,
  }));
  await db.insert(categories).values(categoryRows);

  // Products
  const productRows = Array.from({ length: COUNTS.products }, (_, i) => {
    const category = pick(categoryRows);
    return {
      id: id("prod", i + 1),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price({ min: 2, max: 55 }),
      categoryId: category.id,
      imageUrl: `https://picsum.photos/seed/${id("prod", i + 1)}/400/300`,
      status: faker.helpers.arrayElement([
        "Available",
        "Unavailable",
      ] as const),
    };
  });
  await db.insert(products).values(productRows);

  // Customers
  const customerRows = Array.from({ length: COUNTS.customers }, (_, i) => ({
    id: id("cust", i + 1),
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    status: faker.helpers.arrayElement(["Active", "Idle"] as const),
    createdAt: faker.date.past({ years: 1 }),
  }));
  await db.insert(customers).values(customerRows);

  // Couriers
  const courierRows = Array.from({ length: COUNTS.couriers }, (_, i) => ({
    id: id("cour", i + 1),
    name: faker.person.fullName(),
    vehicleId: faker.vehicle.vrm(),
    phone: faker.phone.number(),
    storeId: pick(storeRows).id,
    rating: Number((Math.random() * 2 + 3).toFixed(1)), // 3.0–5.0
    status: faker.helpers.arrayElement([
      "Available",
      "Offline",
      "On delivery",
    ] as const),
  }));
  await db.insert(couriers).values(courierRows);

  // Orders + order items
  const orderRows = Array.from({ length: COUNTS.orders }, (_, i) => ({
    id: id("order", i + 1),
    status: faker.helpers.arrayElement([
      "Pending",
      "Ready",
      "On the way",
      "Delivered",
      "Cancelled",
    ] as const),
    amount: "0.00", // computed below once items are known
    storeId: pick(storeRows).id,
    customerId: pick(customerRows).id,
    courierId: Math.random() > 0.15 ? pick(courierRows).id : null,
    createdAt: faker.date.past({ years: 1 }),
  }));

  const orderItemRows: (typeof orderItems.$inferInsert)[] = [];
  orderRows.forEach((order, orderIdx) => {
    const itemCount = faker.number.int({ min: 1, max: 4 });
    let total = 0;
    for (let j = 0; j < itemCount; j++) {
      const product = pick(productRows);
      const quantity = faker.number.int({ min: 1, max: 3 });
      const price = Number(product.price);
      total += price * quantity;
      orderItemRows.push({
        id: id("item", orderIdx * 4 + j + 1),
        orderId: order.id,
        productId: product.id,
        quantity,
        priceAtOrder: product.price,
      });
    }
    order.amount = total.toFixed(2);
  });

  await db.insert(orders).values(orderRows);
  await db.insert(orderItems).values(orderItemRows);

  console.log(
    `Seeded ${storeRows.length} stores, ${categoryRows.length} categories, ${productRows.length} products, ${customerRows.length} customers, ${courierRows.length} couriers, ${orderRows.length} orders, ${orderItemRows.length} order items.`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
