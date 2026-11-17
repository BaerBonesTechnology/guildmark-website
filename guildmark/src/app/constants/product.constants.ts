/** Product Detail (PDP) label maps for device-spec enums. */
export const FUNCTIONAL_LABEL: Record<string, string> = {
  fully_functional: "Fully functional",
  functional_with_issues: "Functional — with issues",
  for_parts: "For parts / not working",
};

export const STORAGE_TYPE_LABEL: Record<string, string> = {
  ssd: "SSD", nvme: "NVMe", hdd: "HDD", emmc: "eMMC", other: "",
};

export const WARRANTY_LABEL: Record<string, string> = {
  none: "No warranty", active: "Active warranty", expired: "Warranty expired",
};

export const WIPE_LABEL: Record<string, string> = {
  not_wiped: "Not wiped", wiped: "Data wiped", certified: "NIST 800-88 certified",
};
