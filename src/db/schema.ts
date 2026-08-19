import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  doublePrecision,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const stores = pgTable("stores", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  status: text("status", { enum: ["Open", "Closed"] })
    .notNull()
    .default("Open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  icon: text("icon").notNull(),
  status: text("status", { enum: ["Visible", "Hidden"] })
    .notNull()
    .default("Visible"),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  imageUrl: text("image_url").notNull(),
  status: text("status", { enum: ["Available", "Unavailable"] })
    .notNull()
    .default("Available"),
});

export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  status: text("status", { enum: ["Active", "Idle"] })
    .notNull()
    .default("Active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const couriers = pgTable("couriers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  vehicleId: text("vehicle_id").notNull(),
  phone: text("phone").notNull(),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id),
  rating: doublePrecision("rating").notNull().default(0),
  status: text("status", {
    enum: ["Available", "Offline", "On delivery"],
  })
    .notNull()
    .default("Offline"),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  status: text("status", {
    enum: ["Pending", "Ready", "On the way", "Delivered", "Cancelled"],
  })
    .notNull()
    .default("Pending"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id),
  courierId: text("courier_id").references(() => couriers.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  priceAtOrder: numeric("price_at_order", { precision: 10, scale: 2 }).notNull(),
});

// --- BetterAuth tables ---

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    // Better Auth 1.7+: account identity is scoped by (issuer, accountId).
    // "local:credential" for email/password accounts.
    issuer: text("issuer").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// --- Relations ---

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const storesRelations = relations(stores, ({ many }) => ({
  couriers: many(couriers),
  orders: many(orders),
}));

export const couriersRelations = relations(couriers, ({ one, many }) => ({
  store: one(stores, { fields: [couriers.storeId], references: [stores.id] }),
  orders: many(orders),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  store: one(stores, { fields: [orders.storeId], references: [stores.id] }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  courier: one(couriers, {
    fields: [orders.courierId],
    references: [couriers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
