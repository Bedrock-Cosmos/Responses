// convert.js
// Usage: node convert.js
// Requires: input.json in the same folder

const fs = require("fs");
const path = require("path");

// Paths
const inputPath = path.join(__dirname, "input.json");
const outputPath = path.join(__dirname, "output.json");

// Load input JSON
const originalApiResponse = JSON.parse(fs.readFileSync(inputPath, "utf8"));

// Convert a single item
function convertSingleItem(item) {
  const thumbnailImage = item.Images?.find((img) => img.Type === "Thumbnail") || {};

  const priceEntry = item.Price?.Prices?.[0]?.Amounts?.[0] || {};

  return {
    id: item.Id,
    contentType: item.ContentType,
    title: item.Title?.["en-US"] || item.Title?.NEUTRAL || "",
    description: item.Description?.["en-US"] || item.Description?.NEUTRAL || "",
    creatorName: item.DisplayProperties?.creatorName || "",
    thumbnail: {
      tag: thumbnailImage.Tag,
      type: thumbnailImage.Type,
      url: thumbnailImage.Url,
      urlWithResolution: thumbnailImage.Url ? `${thumbnailImage.Url}?width=800&height=450` : null,
    },
    price: {
      listPrice: priceEntry.Amount ?? 0,
      realmsInfo: {
        inRealmsPlus: false,
      },
      currencyId: priceEntry.CurrencyId,
      virtualCurrencyType: "Minecoin",
    },
    linksTo: `ItemDetail_${item.Id}`,
    linksToInfo: {
      linksTo: `ItemDetail_${item.Id}`,
      linkType: "pageId",
      displayType: "store_layout.store_data_driven_screen",
      navigateInPlace: false,
    },
    creatorPage: `CreatorPage_${item.CreatorEntity?.Type}!${item.CreatorEntity?.Id}`,
    pieceType: item.DisplayProperties?.pieceType,
    rarity: item.DisplayProperties?.rarity,
    requiresRedeem: item.DisplayProperties?.requiresRedeem ?? false,
    ownership: "NotOwned",
    packType: "Persona",
    packIdentity: item.DisplayProperties?.packIdentity || [],
    minPerformanceTier: "LowTier",
    startDate: item.StartDate || null,
    hardwareMemoryTier: item.DisplayProperties?.hardwareMemoryTier ?? 0,
  };
}

// Convert all items
function convertAll(apiResponse) {
  const items = apiResponse?.data?.Items;
  if (!Array.isArray(items)) return [];

  return items.map(convertSingleItem);
}

// Run conversion
const output = convertAll(originalApiResponse);

// Write to output.json
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");

console.log(`✔ Converted ${output.length} items`);
console.log(`✔ Output written to ${outputPath}`);
