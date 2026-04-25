import { create, all } from 'mathjs';

const math = create(all);

/**
 * Scientific Service
 * Provides robust mathematical, statistical, and conversion utilities.
 * Powered by Math.js for high-precision local computation.
 */
export const ScientificService = {
  /**
   * Evaluates a mathematical expression string.
   * Safe for fractions, matrices, and units.
   */
  evaluate: (expression: string) => {
    try {
      return math.evaluate(expression);
    } catch (error) {
      console.error("Math evaluation failed:", error);
      return null;
    }
  },

  /**
   * Unit Conversion
   * Supports: length, area, volume, mass, time, temperature, force, energy, etc.
   * Example: convert("10 km", "m") -> 10000
   */
  convert: (value: number | string, fromUnit: string, toUnit: string): number | null => {
    try {
      return math.unit(value, fromUnit).toNumber(toUnit);
    } catch (error) {
      console.error("Unit conversion failed:", error);
      return null;
    }
  },

  /**
   * Statistics
   */
  stats: {
    mean: (data: number[]) => math.mean(data),
    median: (data: number[]) => math.median(data),
    std: (data: number[]) => math.std(data),
    variance: (data: number[]) => math.variance(data),
    max: (data: number[]) => math.max(data),
    min: (data: number[]) => math.min(data),
  },

  /**
   * Trigonometry (Support for both degrees and radians)
   */
  trig: {
    sin: (value: number, isDeg = false) => isDeg ? math.sin(math.unit(value, 'deg')) : math.sin(value),
    cos: (value: number, isDeg = false) => isDeg ? math.cos(math.unit(value, 'deg')) : math.cos(value),
    tan: (value: number, isDeg = false) => isDeg ? math.tan(math.unit(value, 'deg')) : math.tan(value),
    asin: (value: number, toDeg = false) => toDeg ? math.unit(math.asin(value), 'rad').toNumber('deg') : math.asin(value),
    acos: (value: number, toDeg = false) => toDeg ? math.unit(math.acos(value), 'rad').toNumber('deg') : math.acos(value),
    atan: (value: number, toDeg = false) => toDeg ? math.unit(math.atan(value), 'rad').toNumber('deg') : math.atan(value),
  },

  /**
   * Scientific Constants
   */
  constants: {
    pi: math.pi,
    e: math.e,
    phi: math.phi,
    c: 299792458, // Speed of light in m/s
    g: 9.80665,   // Standard gravity in m/s^2
    G: 6.67430e-11, // Gravitational constant
  },

  /**
   * Rounding and Formatting
   */
  format: (value: number, precision = 3) => math.format(value, { precision }),
};
