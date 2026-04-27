/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import puppeteer from "puppeteer";
import { buildHTML } from "@/lib/buildResultHTML";

export async function generateResultPdf(groups: any[]) {
  const html = buildHTML(groups);

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return pdf;
}