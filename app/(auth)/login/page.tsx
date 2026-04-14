import { AuthForm } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="w-full h-[100dvh] flex items-center justify-center bg-[#ffdc42] p-4 md:p-8 overflow-hidden">
      <div className="w-full max-w-lg animate-in fade-in zoom-in duration-500 flex items-center justify-center">
        <AuthForm type="login" />
      </div>
    </div>
  );
}
