/**
 * Pre-launch hero — the canonical GuildMark landing experience (View).
 *
 * Three full-height audience panels (IT teams / supply side / partner
 * network), each its own component with an early-access form wired to the
 * real POST /waitlist endpoint via useWaitlistViewModel. The backend stores
 * `source` plus extra fields as notes, so every submission is segmentable.
 *
 * Design language: Barlow Condensed display, DM Sans body, JetBrains Mono
 * labels; sharp borders; layered section backgrounds (--section-1/2/3).
 */
import { ITTeamsSection } from "../components/preLaunch/ITTeamsSection";
import { PartnerNetworkSection } from "../components/preLaunch/PartnerNetworkSection";
import { PreLaunchFooter } from "../components/preLaunch/PreLaunchFooter";
import { PreLaunchHeader } from "../components/preLaunch/PreLaunchHeader";
import { SupplySection } from "../components/preLaunch/SupplySection";

export function PreLaunch() {
  return (
    <>
      <PreLaunchHeader />
      <div className="flex flex-col min-[3000px]:flex-row min-[3000px]:min-h-[calc(100vh-3rem) max-w-[5120] mx-auto">
        <ITTeamsSection />
        <SupplySection />
        <PartnerNetworkSection />
      </div>
      <PreLaunchFooter />
    </>
  );
}
