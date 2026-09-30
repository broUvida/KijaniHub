import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const db = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-779d7dfc/health", (c) => {
  return c.json({ status: "ok" });
});

// ── Network members ──

// GET /make-server-779d7dfc/members — return all network members
app.get("/make-server-779d7dfc/members", async (c) => {
  const { data, error } = await db()
    .from("network_members")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// POST /make-server-779d7dfc/members — insert a new member
app.post("/make-server-779d7dfc/members", async (c) => {
  const body = await c.req.json();
  const { data, error } = await db()
    .from("network_members")
    .insert([body])
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// PATCH /make-server-779d7dfc/members/:id/location — update last_seen + lat/lng
app.patch("/make-server-779d7dfc/members/:id/location", async (c) => {
  const id = c.req.param("id");
  const { lat, lng } = await c.req.json();
  const { data, error } = await db()
    .from("network_members")
    .update({ lat, lng, last_seen: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ── Conversion factors ──

app.get("/make-server-779d7dfc/conversion-factors", async (c) => {
  const { data, error } = await db().from("conversion_factors").select("key, value");
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.put("/make-server-779d7dfc/conversion-factors/:key", async (c) => {
  const key = c.req.param("key");
  const { value } = await c.req.json();
  const { data, error } = await db()
    .from("conversion_factors")
    .upsert([{ key, value }], { onConflict: "key" })
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ── Device throughput ──

app.get("/make-server-779d7dfc/device-throughput", async (c) => {
  const { data, error } = await db().from("device_throughput").select("device_id, waste_kg");
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.put("/make-server-779d7dfc/device-throughput/:deviceId", async (c) => {
  const device_id = c.req.param("deviceId");
  const { waste_kg } = await c.req.json();
  const { data, error } = await db()
    .from("device_throughput")
    .upsert([{ device_id, waste_kg }], { onConflict: "device_id" })
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ── App settings (manual waste override) ──

app.get("/make-server-779d7dfc/settings/:key", async (c) => {
  const key = c.req.param("key");
  const { data, error } = await db()
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .single();
  if (error) return c.json({ value: null });
  return c.json(data);
});

app.put("/make-server-779d7dfc/settings/:key", async (c) => {
  const key = c.req.param("key");
  const { value } = await c.req.json();
  const { data, error } = await db()
    .from("app_settings")
    .upsert([{ key, value }], { onConflict: "key" })
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.delete("/make-server-779d7dfc/settings/:key", async (c) => {
  const key = c.req.param("key");
  const { error } = await db().from("app_settings").delete().eq("key", key);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ ok: true });
});

Deno.serve(app.fetch);