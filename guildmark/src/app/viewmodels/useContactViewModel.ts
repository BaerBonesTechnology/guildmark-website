/** ViewModel for the Contact page: form fields, submit status, navigation. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { submitContact, type ContactFields } from "../services/contact.service";

export type ContactStatus = "error" | "idle" | "loading" | "success";

export function useContactViewModel() {
  const navigate = useNavigate();
  const [fields, setFields] = useState<ContactFields>({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Scroll to top immediately — navigating from a scrolled PreLaunch page
  // would otherwise leave the user staring at mid-page form inputs.
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  function setField(key: keyof ContactFields) {
    return (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [key]: evt.target.value }));
  }

  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await submitContact(fields);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return {
    errorMsg, fields, goBack: () => navigate(-1), goHome: () => navigate("/"),
    handleSubmit, setField, status,
  };
}
