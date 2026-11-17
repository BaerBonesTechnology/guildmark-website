import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Navigate, Route, Routes } from "react-router";
import { AuthProvider, useAuth } from "../hooks/useAuth";
import { RegisterPasskey } from "./RegisterPasskey";

function Dashboard() {
  const { token } = useAuth();
  return token ? <p>Staff dashboard</p> : <Navigate to="/login" replace />;
}

function mount() {
  render(<AuthProvider><MemoryRouter initialEntries={["/register-passkey"]}>
    <Routes>
      <Route path="/register-passkey" element={<RegisterPasskey />} />
      <Route path="/login" element={<p>Staff login</p>} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  </MemoryRouter></AuthProvider>);
}

beforeEach(() => sessionStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

test("missing setup session redirects after render without a React warning", async () => {
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  mount();
  await screen.findByText("Staff login");
  expect(errors.mock.calls.flat().join(" ")).not.toContain("Cannot update a component");
});

test("successful registration updates auth context and reaches the protected dashboard", async () => {
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  sessionStorage.setItem("devdash_setup_token", "setup-session");
  sessionStorage.setItem("devdash_setup_employee", JSON.stringify({full_name: "Local Staff", email: "staff@guildmark.co"}));
  const create = vi.fn().mockResolvedValue({
    rawId: new Uint8Array([1, 2, 3]).buffer,
    response: { attestationObject: new Uint8Array([1]).buffer, clientDataJSON: new Uint8Array([2]).buffer },
  });
  vi.stubGlobal("navigator", { credentials: { create } });
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({
      challenge_id: "challenge-1", challenge: "AQID", rp: {id: "localhost", name: "GuildMark"},
      user: {id: "AQID", name: "staff@guildmark.co", display_name: "Local Staff"},
      pub_key_cred_params: [{type: "public-key", alg: -7}, {type: "public-key", alg: -257}],
    })))
    .mockResolvedValueOnce(new Response(JSON.stringify({access_token: "full-staff-session"})));
  vi.stubGlobal("fetch", fetchMock);
  mount();
  fireEvent.click(screen.getByRole("button", {name: /create passkey/i}));
  await screen.findByText("Staff dashboard");
  expect(sessionStorage.getItem("devdash_token")).toBe("full-staff-session");
  expect(sessionStorage.getItem("devdash_setup_token")).toBeNull();
  expect(sessionStorage.getItem("devdash_setup_employee")).toBeNull();
  expect(create.mock.calls[0][0].publicKey.pubKeyCredParams.map((p: {alg: number}) => p.alg)).toEqual([-7, -257]);
  expect(create.mock.calls[0][0].publicKey.authenticatorSelection.userVerification).toBe("required");
  expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer setup-session");
  expect(errors.mock.calls.flat().join(" ")).not.toContain("Cannot update a component");
});

test("expired setup session cannot start registration or enter the dashboard", async () => {
  sessionStorage.setItem("devdash_setup_token", "expired-setup");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({error: "Valid setup token required"}), {status: 401})));
  mount();
  fireEvent.click(screen.getByRole("button", {name: /create passkey/i}));
  await waitFor(() => expect(screen.getByText("Valid setup token required")).toBeTruthy());
  expect(screen.queryByText("Staff dashboard")).toBeNull();
  expect(sessionStorage.getItem("devdash_token")).toBeNull();
});
