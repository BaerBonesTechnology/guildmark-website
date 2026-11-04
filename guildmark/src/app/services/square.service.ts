/**
 * Square Web Payments helpers — SDK loading, order math, and formatting for
 * the Buy Now flow. Square tokenises card data in browser-hosted iframes so
 * raw card data never touches our servers.
 */
import { squareApplicationId, squareEnvironment } from "../config";
import type { MarketplaceListing } from "../models/marketplace";

export interface OrderTotals {
  buyerFee: number | null;
  buyerFeeRate: number | null;
  qty: number;
  subtotal: number;
  total: number;
  unit: number;
}

export type SquareCardForm = {
  attach: (selector: string) => Promise<void>;
  destroy: () => Promise<void>;
  tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>;
};

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<{
        card: (options?: object) => Promise<SquareCardForm>;
      }>;
    };
  }
}

const SQUARE_SDK_URLS: Record<string, string> = {
  production: "https://web.squarecdn.com/v1/square.js",
  sandbox: "https://sandbox.web.squarecdn.com/v1/square.js",
};

let squareSdkPromise: Promise<void> | null = null;

export function loadSquareSdk(): Promise<void> {
  if (window.Square) return Promise.resolve();
  if (squareSdkPromise) return squareSdkPromise;

  squareSdkPromise = new Promise((resolve, reject) => {
    const url = SQUARE_SDK_URLS[squareEnvironment] ?? SQUARE_SDK_URLS.sandbox;
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load Square SDK from ${url}`));
    document.head.appendChild(script);
  });

  return squareSdkPromise;
}

/** Sandbox uses Square's static test nonce, bypassing the SDK card form. */
export function isSquareSandbox(): boolean {
  return squareEnvironment === "sandbox" || squareApplicationId.startsWith("sandbox-");
}

/** Order math — mirrors the backend buy.dart fee snapshot. */
export function computeOrderTotals(listing: MarketplaceListing, quantity: number, buyerFeeRate: number | null): OrderTotals {
  const unit = listing.listed_price ?? listing.buyer_ask_price ?? 0;
  const qty = Math.max(1, quantity);
  const subtotal = unit * qty;
  const buyerFee = buyerFeeRate != null ? subtotal * buyerFeeRate : null;
  const total = buyerFee != null ? subtotal + buyerFee : subtotal;
  return { buyerFee, buyerFeeRate, qty, subtotal, total, unit };
}

export function money(num: number): string {
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
