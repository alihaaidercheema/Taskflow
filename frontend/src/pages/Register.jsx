import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await register(formData);
      // Auto-login after successful registration
      await login({ email: formData.email, password: formData.password });
      navigate("/dashboard");
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        // Pydantic validation errors — show the first message
        setError(detail[0]?.msg || "Validation error. Please check your inputs.");
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(`Registration failed (${err.response?.status || "Network error"}). Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-lg space-y-6 border-t-2 border-t-primary">
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Create an account</h2>
        <p className="text-muted-foreground text-xs">
          Start managing your tasks with TaskFlow
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive animate-fade-in font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={formData.username}
            onChange={handleChange}
            placeholder="johndoe"
            className="w-full px-3 py-2 text-[13px] bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full px-3 py-2 text-[13px] bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className="w-full px-3 py-2 pr-10 text-[13px] bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-9 flex items-center justify-center gap-2 mt-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xs"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
