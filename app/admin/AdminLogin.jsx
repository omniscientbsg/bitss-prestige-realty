"use client";
import { useState } from "react";
import { Building2, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (data.success) {
        window.location.reload(); // Reload to hit the Server Component and get the dashboard
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-dark2 border border-white/10 flex items-center justify-center mb-4 shadow-xl">
            <Building2 className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-heading text-4xl text-white">Partner Portal</h1>
          <p className="text-platinum/60 mt-2">Enter your master password to access the vault.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-dark2 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum/40" />
            <input
              type="password"
              placeholder="Master Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark1 border border-white/10 text-white rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all placeholder:text-platinum/30"
              autoFocus
            />
          </div>

          {error && <div className="text-red-400 text-sm mb-6 bg-red-400/10 border border-red-400/20 p-3 rounded-lg text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-gold hover:bg-[#D4B35E] text-[#0A0A0F] font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Unlock Vault
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
