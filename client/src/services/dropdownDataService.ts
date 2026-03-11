import { currenciesService } from "./currenciesService";
import { productCategoriesService } from "./productCategoriesService";
import { taxesService } from "./taxesService";
import { productsService } from "./productsService";

/**
 * Simple DTO for dropdown options.
 */
export interface DropdownOption {
  id: number;
  label: string;
}

/**
 * Service that aggregates calls to various lookup APIs and returns data
 * formatted for UI dropdown components.
 */
export const dropdownDataService = {
  /** Fetch all currencies and map to {id, label} */
  async getCurrencyOptions(): Promise<DropdownOption[]> {
    const currencies = await currenciesService.getAll();
    return currencies.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` }));
  },

  /** Fetch all product categories */
  async getCategoryOptions(): Promise<DropdownOption[]> {
    const categories = await productCategoriesService.getProductCategories();
    return categories.map((cat) => ({ id: cat.id, label: cat.name }));
  },

  /** Fetch all taxes */
  async getTaxOptions(): Promise<DropdownOption[]> {
    const taxes = await taxesService.getAll();
    return taxes.map((t) => ({ id: t.id, label: `${t.name} (${t.rate}%)` }));
  },

  /** Fetch all products (lightweight) */
  async getProductOptions(): Promise<DropdownOption[]> {
    const response = await productsService.list();
    const items = response?.data?.items || [];
    return items.map((p: any) => ({ id: p.id, label: p.name }));
  },
};
