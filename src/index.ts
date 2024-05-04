import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import puppeteer from "@cloudflare/puppeteer";
import { z } from "zod";
import { logger } from "hono/logger";
import { serveStatic } from "hono/cloudflare-workers";
import manifest from "__STATIC_CONTENT_MANIFEST";
import { secureHeaders } from "hono/secure-headers";
import { Context } from "./types/context";
import { getHtmlContent } from "./utils/getHtmlContent";

const app = new Hono<Context>();

app.use(secureHeaders());

app.use("*", (c, next) => {
  if (c.env.DEBUG === "true") {
    return logger((str, ...rest) => {
      console.log("INFO", str, rest);
    })(c, next);
  }
  return next();
});

app.get("/static/*", serveStatic({ root: "./", manifest }));

app.get(
  "/generate/:text",
  zValidator(
    "param",
    z.object({
      text: z.coerce.string(),
    })
  ),
  async (c) => {
    const { text } = c.req.valid("param");

    const template = await getHtmlContent(c.env.WORKER_URL, { title: text });

    const browser = await puppeteer.launch(c.env.MYBROWSER);
    const page = await browser.newPage();
    await page.setContent(template);
    const img = await page.screenshot();
    await browser.close();

    return c.body(img, 200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
      "Cache-Control":
        "public, immutable, no-transform, s-maxage=2592000, max-age=2592000",
      "Content-Type": "image/png",
    });
  }
);

app.onError((error, c) => {
  const status = error instanceof HTTPException ? error.status : 500;
  const message =
    error instanceof HTTPException ? error.message : "Internal Server Error";

  console.error("Error:", error);

  return c.json({ error: message, status }, status);
});

export default app;
