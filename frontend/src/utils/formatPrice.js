const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

export const formatPrice = (value) => priceFormatter.format(Number(value) || 0);
