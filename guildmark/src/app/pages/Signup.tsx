import { Navigate, useLocation } from "react-router";
import { PlatformStory } from "../components/signup/PlatformStory";
import { SignupForm } from "../components/signup/SignupForm";
import { useSignupViewModel } from "../viewmodels/useSignupViewModel";
import { useAuth } from "../hooks/useAuth";
import "../components/signup/registration.css";

export function Signup() {
 const viewModel = useSignupViewModel();
 const { user } = useAuth();
 const prefix = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
 if (user) return <Navigate to={`${prefix}/dashboard`} replace />;
 return <div className="registration-page"><div className="registration-layout"><PlatformStory/><SignupForm {...viewModel}/></div></div>;
}
