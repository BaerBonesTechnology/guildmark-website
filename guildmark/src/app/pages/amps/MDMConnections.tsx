/**
 * AMPS MDM Connections — device-management integrations (View).
 * Connection/sync/add-flow state lives in useMDMConnectionsViewModel; each
 * card, the sync-history table, and the add dialog are their own components.
 */
import { Cloud, Plus } from "lucide-react";
import { AddMDMConnectionDialog } from "../../components/amps/AddMDMConnectionDialog";
import { MDMConnectionCard } from "../../components/amps/MDMConnectionCard";
import { SyncHistoryTable } from "../../components/amps/SyncHistoryTable";
import { AMPS_ACCENT } from "../../constants/amps.constants";
import { BODY, DISPLAY, MONO } from "../../constants/typography";
import { useMDMConnectionsViewModel } from "../../viewmodels/useMDMConnectionsViewModel";

export function MDMConnections() {
  const {
    addOpen, connecting, connections, disconnect, formData, handleAddConnection, handleSync,
    resetForm, selectedMDM, setAddOpen, setFormData, setSelectedMDM, syncHistory,
  } = useMDMConnectionsViewModel();

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto pb-20" style={{ fontFamily: BODY }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.3rem)", lineHeight: 1 }}>MDM Connections</h1>
          <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Manage device-management platform integrations</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity shrink-0" style={{ background: AMPS_ACCENT, color: "#fff" }}>
          <Plus size={13} /> Add connection
        </button>
      </div>

      {/* Connections */}
      {connections.length === 0 ? (
        <div className="border border-border py-16 flex flex-col items-center gap-3 mb-6" style={{ background: "var(--card)" }}>
          <Cloud size={28} className="opacity-30" style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No MDM platforms connected yet</p>
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border hover:border-foreground transition-colors">Connect your first MDM</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {connections.map((c) => (
            <MDMConnectionCard key={c.id} connection={c} onDisconnect={disconnect} onSync={handleSync} />
          ))}
        </div>
      )}

      {/* Sync history */}
      <SyncHistoryTable syncHistory={syncHistory} />

      {/* Add connection dialog */}
      <AddMDMConnectionDialog
        connecting={connecting}
        formData={formData}
        onConnect={handleAddConnection}
        onOpenChange={setAddOpen}
        open={addOpen}
        resetForm={resetForm}
        selectedMDM={selectedMDM}
        setFormData={setFormData}
        setSelectedMDM={setSelectedMDM}
      />
    </div>
  );
}
