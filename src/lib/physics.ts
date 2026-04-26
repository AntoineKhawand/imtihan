/**
 * Physics Data & Calculation Engine
 * Inspired by the "University Physics" standards for high-accuracy academic problems.
 */

export const PHYSICS_CONSTANTS = {
  // Astrophysical Constants
  astrophysical: {
    AU: 1.496e11, // Astronomical Unit (m)
    EARTH_MASS: 5.9723e24, // kg
    EARTH_RADIUS: 6.371e6, // m
    SOLAR_MASS: 1.989e30, // kg
    SOLAR_RADIUS: 6.957e8, // m
    LUNAR_MASS: 7.347e22, // kg
    LUNAR_RADIUS: 1.737e6, // m
  },
  // Common Physical Constants
  common: {
    C: 2.99792458e8, // Speed of light in vacuum (m/s)
    G: 6.67430e-11, // Gravitational constant (N m²/kg²)
    G_ACCEL: 9.80665, // Standard gravity (m/s²)
    H: 6.62607015e-34, // Planck constant (J s)
    H_BAR: 1.054571817e-34, // Reduced Planck constant (J s)
    K_BOLTZMANN: 1.380649e-23, // Boltzmann constant (J/K)
    K_COULOMB: 8.9875517923e9, // Coulomb constant (N m²/C²)
    EPSILON_0: 8.8541878128e-12, // Permittivity of vacuum (F/m)
    MU_0: 1.25663706212e-6, // Permeability of vacuum (N/A²)
    E_CHARGE: 1.602176634e-19, // Elementary charge (C)
    N_AVOGADRO: 6.02214076e23, // Avogadro's number (mol⁻¹)
    R_GAS: 8.314462618, // Molar gas constant (J/(mol K))
    SIGMA_SB: 5.670374419e-8, // Stefan-Boltzmann constant (W/(m² K⁴))
    ATM: 101325, // Standard atmosphere (Pa)
    B_WIEN: 2.897771955e-3, // Wien displacement constant (m K)
  },
  // Particle Masses
  masses: {
    ELECTRON: 9.1093837015e-31, // kg
    PROTON: 1.67262192369e-27, // kg
    NEUTRON: 1.67492749804e-27, // kg
    AMU: 1.66053906660e-27, // Atomic mass unit (kg)
  }
};

/**
 * Common Physics Formulas (Methodological references)
 */
export const PHYSICS_FORMULAS = {
  mechanics: {
    kinetic_energy: "K = 1/2 * m * v²",
    potential_energy_grav: "U = m * g * h",
    newton_second: "ΣF = m * a",
    work: "W = F * d * cos(θ)",
    power: "P = W / t",
    momentum: "p = m * v",
  },
  electromagnetism: {
    ohms_law: "V = I * R",
    coulombs_law: "F = k * |q1 * q2| / r²",
    electric_field: "E = F / q",
    capacitance: "C = Q / V",
    magnetic_force: "F = q * v * B * sin(θ)",
  },
  thermodynamics: {
    ideal_gas_law: "PV = nRT",
    heat_transfer: "Q = m * c * ΔT",
    entropy_change: "ΔS = ΔQ / T",
  },
  optics: {
    snells_law: "n1 * sin(θ1) = n2 * sin(θ2)",
    lens_maker: "1/f = (n - 1) * (1/R1 - 1/R2)",
    photon_energy: "E = h * f = h * c / λ",
  }
};

/**
 * Formats physics context for AI prompt inclusion
 */
export function getPhysicsPromptContext(): string {
  const c = PHYSICS_CONSTANTS.common;
  const a = PHYSICS_CONSTANTS.astrophysical;
  
  return `
[PHYSICS_REFERENCE_STANDARDS]
Fundamental Constants (University Physics Standard):
- Gravity (g): ${c.G_ACCEL} m/s²
- Speed of Light (c): ${c.C} m/s
- Gravitational Constant (G): ${c.G} N m²/kg²
- Planck Constant (h): ${c.H} J s
- Coulomb Constant (k): ${c.K_COULOMB} N m²/C²
- Gas Constant (R): ${c.R_GAS} J/(mol K)
- Avogadro Number (NA): ${c.N_AVOGADRO} mol⁻¹
- Standard Atmosphere (atm): ${c.ATM} Pa

Earth Data:
- Earth Mass: ${a.EARTH_MASS} kg
- Earth Radius: ${a.EARTH_RADIUS} m

Mandatory methodology:
- Always state the physical law being applied.
- Show dimensional consistency (units in intermediate steps).
- Use ${c.G_ACCEL} for g unless specified otherwise.
- For modern physics, use relativistic formulas if v > 0.1c.
`;
}
