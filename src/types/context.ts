import { BrowserWorker } from "@cloudflare/puppeteer";

export type Context = {
  Bindings: {
    MYBROWSER: BrowserWorker;
    DEBUG: string;
    WORKER_URL: string;
  };
};
