import { useTranslation } from "react-i18next";
import { MarketplaceFilterRow } from "./MarketplaceFilterRow";
import { MarketplaceFilterSection } from "./MarketplaceFilterSection";

interface FilterOption {
  checked: boolean;
  label: string;
  value: string;
}

interface MarketplaceFiltersProps {
  categoryOptions: FilterOption[];
  gradeOptions: FilterOption[];
  toggleCategory: (value: string) => void;
  toggleGrade: (value: string) => void;
}

export function MarketplaceFilters({ categoryOptions, gradeOptions, toggleCategory, toggleGrade }: MarketplaceFiltersProps) {
  const { t } = useTranslation();
  return (
    <>
      <MarketplaceFilterSection title={t("marketplaceFilters.category")}>
        {categoryOptions.map((option) => <MarketplaceFilterRow key={option.value} label={option.label} checked={option.checked} onToggle={() => toggleCategory(option.value)} />)}
      </MarketplaceFilterSection>
      <MarketplaceFilterSection title={t("marketplaceFilters.condition")}>
        {gradeOptions.map((option) => <MarketplaceFilterRow key={option.value} label={option.label} checked={option.checked} onToggle={() => toggleGrade(option.value)} />)}
      </MarketplaceFilterSection>
    </>
  );
}
