'use server';

import {
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  duplicatePortfolio,
  updatePortfoliosSortOrder,
} from '@/libs/supabase/queries/portfolios.admin';
import type { Portfolio, PortfolioFormInput } from '@/types/portfolio';

export async function createPortfolioAction(input: PortfolioFormInput): Promise<Portfolio> {
  return createPortfolio(input);
}

export async function updatePortfolioAction(id: string, input: PortfolioFormInput): Promise<Portfolio> {
  return updatePortfolio(id, input);
}

export async function deletePortfolioAction(id: string): Promise<void> {
  return deletePortfolio(id);
}

export async function duplicatePortfolioAction(id: string): Promise<Portfolio> {
  return duplicatePortfolio(id);
}

export async function updatePortfoliosSortOrderAction(
  updates: { id: string; sort_order: number }[],
): Promise<void> {
  return updatePortfoliosSortOrder(updates);
}
