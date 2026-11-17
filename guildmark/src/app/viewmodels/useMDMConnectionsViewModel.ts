/** ViewModel for AMPS MDM Connections: connections, sync history, add flow. */
import { useState } from "react";
import { EMPTY_MDM_FORM, type MDMConnection, type MdmForm, type SyncEvent } from "../constants/mdm.constants";
import { buildConnection, buildSyncEvent } from "../services/mdm.service";

export function useMDMConnectionsViewModel() {
  const [connections, setConnections] = useState<MDMConnection[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncEvent[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedMDM, setSelectedMDM] = useState("");
  const [formData, setFormData] = useState<MdmForm>(EMPTY_MDM_FORM);
  const [connecting, setConnecting] = useState(false);

  function handleSync(connectionId: string) {
    const conn = connections.find((c) => c.id === connectionId);
    if (!conn) return;
    setSyncHistory((prev) => [buildSyncEvent(conn), ...prev]);
    setConnections((prev) => prev.map((c) => c.id === connectionId ? { ...c, lastSync: "Just now" } : c));
  }

  function disconnect(connectionId: string) {
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
  }

  function resetForm() {
    setSelectedMDM("");
    setFormData(EMPTY_MDM_FORM);
  }

  function handleAddConnection() {
    if (!selectedMDM) return;
    setConnecting(true);
    setTimeout(() => {
      setConnections((prev) => [...prev, buildConnection(selectedMDM, formData)]);
      setConnecting(false);
      setAddOpen(false);
      resetForm();
    }, 1200);
  }

  return {
    addOpen, connecting, connections, disconnect, formData, handleAddConnection, handleSync,
    resetForm, selectedMDM, setAddOpen, setFormData, setSelectedMDM, syncHistory,
  };
}
