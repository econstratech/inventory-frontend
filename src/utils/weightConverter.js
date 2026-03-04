/**
 * Converts weight to the best unit representation
 * @param {number} totalWeight - Total weight value
 * @param {string} unitLabel - Unit label (e.g., "g", "kg", "mg", "ton", "tonne", "ml", "l", "L")
 * @returns {object} - { value: number, unit: string, display: string }
 * 
 * @example
 * convertWeight(5000, "g") // { value: 5, unit: "kg", display: "5 kg" }
 * convertWeight(500, "g") // { value: 500, unit: "g", display: "500 g" }
 * convertWeight(1500, "ml") // { value: 1.5, unit: "L", display: "1.5 L" }
 */
export const convertWeight = (totalWeight, unitLabel) => {
  if (!totalWeight || totalWeight === 0) {
    return { value: 0, unit: unitLabel || "", display: `0 ${unitLabel || ""}` };
  }

  if (!unitLabel) {
    return { value: totalWeight, unit: "", display: totalWeight.toString() };
  }

  const unit = unitLabel.toLowerCase().trim();

  // Weight conversions
  if (unit === "g" || unit === "gram" || unit === "grams") {
    if (totalWeight >= 1000000) {
      // Convert to metric ton
      const value = totalWeight / 1000000;
      return {
        value: parseFloat(value.toFixed(2)),
        unit: "ton",
        display: `${value.toFixed(2)} ton`,
      };
    } else if (totalWeight >= 1000) {
      // Convert to kg
      const value = totalWeight / 1000;
      return {
        value: parseFloat(value.toFixed(2)),
        unit: "kg",
        display: `${value.toFixed(2)} kg`,
      };
    } else {
      return {
        value: totalWeight,
        unit: "g",
        display: `${totalWeight} g`,
      };
    }
  }

  if (unit === "mg" || unit === "milligram" || unit === "milligrams") {
    if (totalWeight >= 1000000) {
      // Convert to kg
      const value = totalWeight / 1000000;
      return {
        value: parseFloat(value.toFixed(3)),
        unit: "kg",
        display: `${value.toFixed(3)} kg`,
      };
    } else if (totalWeight >= 1000) {
      // Convert to g
      const value = totalWeight / 1000;
      return {
        value: parseFloat(value.toFixed(3)),
        unit: "g",
        display: `${value.toFixed(3)} g`,
      };
    } else {
      return {
        value: totalWeight,
        unit: "mg",
        display: `${totalWeight} mg`,
      };
    }
  }

  if (unit === "kg" || unit === "kilogram" || unit === "kilograms") {
    if (totalWeight >= 1000) {
      // Convert to metric ton
      const value = totalWeight / 1000;
      return {
        value: parseFloat(value.toFixed(3)),
        unit: "ton",
        display: `${value.toFixed(3)} ton`,
      };
    } else {
      return {
        value: totalWeight,
        unit: "kg",
        display: `${totalWeight.toFixed(3)} kg`,
      };
    }
  }

  if (unit === "ton" || unit === "tonne" || unit === "tonnes" || unit === "metric ton") {
    return {
      value: totalWeight,
      unit: "ton",
      display: `${totalWeight.toFixed(3)} ton`,
    };
  }

  // Volume conversions (for liquids)
  if (unit === "ml" || unit === "milliliter" || unit === "milliliters") {
    if (totalWeight >= 1000) {
      // Convert to L
      const value = totalWeight / 1000;
      return {
        value: parseFloat(value.toFixed(3)),
        unit: "L",
        display: `${value.toFixed(3)} L`,
      };
    } else {
      return {
        value: totalWeight,
        unit: "ml",
        display: `${totalWeight} ml`,
      };
    }
  }

  if (unit === "l" || unit === "litre" || unit === "liter" || unit === "litres" || unit === "liters") {
    return {
      value: totalWeight,
      unit: "L",
      display: `${totalWeight.toFixed(3)} L`,
    };
  }

  // For other units (numbers, pieces, etc.), return as is
  return {
    value: totalWeight,
    unit: unitLabel,
    display: `${totalWeight} ${unitLabel}`,
  };
};

/**
 * Calculates total weight from quantity and weight per unit, then converts to best unit
 * @param {number} quantity - Quantity
 * @param {number} weightPerUnit - Weight per unit value
 * @param {string} unitLabel - Unit label (e.g., "g", "kg")
 * @returns {object} - { value: number, unit: string, display: string }
 * 
 * @example
 * calculateTotalWeight(10, 500, "g") // { value: 5, unit: "kg", display: "5 kg" }
 * calculateTotalWeight(5, 200, "g") // { value: 1000, unit: "g", display: "1000 g" }
 */
export const calculateTotalWeight = (quantity, weightPerUnit, unitLabel) => {
  const qty = parseFloat(quantity) || 0;
  const weight = parseFloat(weightPerUnit) || 0;
  const totalWeight = qty * weight;

  return convertWeight(totalWeight, unitLabel);
};
