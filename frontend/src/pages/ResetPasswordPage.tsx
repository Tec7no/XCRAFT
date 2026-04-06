import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {

  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {

      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          password
        })
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setSuccess("Password updated successfully");

      setTimeout(() => {
        navigate("/auth");
      }, 3000);

    } catch (err) {

      setError("Server error");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-background p-6">

      <div className="w-full max-w-md bg-card p-6 rounded-xl border">

        <h2 className="text-2xl font-bold mb-2 text-center">
          Reset Password
        </h2>

        <p className="text-muted-foreground text-center mb-6">
          Enter your new password
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl flex items-center justify-center gap-2"
          >

            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Update Password"
            )}

          </button>

        </form>

      </div>

    </div>

  );

}