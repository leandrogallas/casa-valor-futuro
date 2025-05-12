
// Utility functions for formatting values

/**
 * Formata um valor numérico para o formato de moeda brasileira (BRL)
 * Mantém consistência no número de casas decimais (0)
 */
export function formatarMoeda(valor: number): string {
  // Ensure same decimal precision everywhere
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(valor);
}

/**
 * Formata um valor numérico para o formato de percentual
 */
export function formatarPercentual(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor / 100);
}
