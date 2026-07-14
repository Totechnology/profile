"use client";

import { LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setLoading(false);
    if (!response.ok) {
      setError("密码不正确，或服务器未配置 ADMIN_PASSWORD。");
      return;
    }

    window.location.reload();
  }

  return (
    <main className="admin-shell space-shell flex min-h-[100dvh] items-center justify-center px-4">
      <form className="glass-panel w-full max-w-md p-6" onSubmit={handleSubmit}>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-accent text-primary">
            <LockKeyhole className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">管理后台</h1>
            <p className="mt-1 text-sm text-muted-foreground">Developer access only</p>
          </div>
        </div>

        <label className="admin-label">
          管理密码
          <input
            className="admin-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="输入 ADMIN_PASSWORD"
          />
        </label>

        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

        <button className="primary-button focus-ring mt-6 w-full" type="submit" disabled={loading}>
          {loading ? "正在验证" : "进入管理模式"}
        </button>
      </form>
    </main>
  );
}
