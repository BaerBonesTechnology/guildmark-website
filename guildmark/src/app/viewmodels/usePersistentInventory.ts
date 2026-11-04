import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
import { inventoryApi, type InventoryInput } from "../services/persistentInventory.service";

const inventory = inventoryApi(api);
export function usePersistentInventory() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [includeArchived, setIncludeArchived] = useState(false);
  const query = useQuery({ queryKey: ["amps", "inventory", user?.company_id, includeArchived], queryFn: () => inventory.listAll(includeArchived), enabled: !!user, retry: false });
  const refresh = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["amps"] }),
      qc.invalidateQueries({ queryKey: ["assets"] }),
      qc.invalidateQueries({ queryKey: ["subscription"] }),
    ]);
  };
  const save = useMutation({ mutationFn: ({ id, data, key }: { id?: string; data: InventoryInput; key: string }) => id ? inventory.update(id, data) : inventory.create(data, key), onSuccess: refresh });
  const archive = useMutation({ mutationFn: inventory.archive, onSuccess: refresh });
  const importRecords = useMutation({ mutationFn: ({ assets, key }: { assets: InventoryInput[]; key: string }) => inventory.import(assets, key), onSuccess: refresh });
  return { query, save, archive, importRecords, includeArchived, setIncludeArchived };
}
