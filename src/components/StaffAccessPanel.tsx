"use client";

import { useAppAuth } from "@/hooks/useAppAuth";
import { useEffect, useState } from "react";
import { clientApiFetch } from "@/lib/api-client";
import { DEPARTMENTS } from "@/lib/constants";
import { ROLES } from "@/lib/auth";
import type { RoleAssignment, UserRole } from "@/lib/types";
import { Trash2, UserPlus } from "lucide-react";

const STAFF_ROLES = ROLES.filter((r) => r !== "Patient") as Array<
  Exclude<UserRole, "Patient">
>;

export function StaffAccessPanel() {
  const { getToken } = useAppAuth();
  const [list, setList] = useState<RoleAssignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Exclude<UserRole, "Patient">>("Receptionist");
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [saving, setSaving] = useState(false);

  const load = () =>
    clientApiFetch(getToken, "/api/role-assignments")
      .then(async (r) => {
        if (!r.ok) {
          const body = (await r.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Could not load staff list");
        }
        return r.json() as Promise<RoleAssignment[]>;
      })
      .then(setList)
      .catch((e: Error) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await clientApiFetch(getToken, "/api/role-assignments", {
        method: "POST",
        body: JSON.stringify({
          email,
          name,
          role,
          department: role === "Doctor" ? department : undefined,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Could not save staff record");
      }
      setEmail("");
      setName("");
      setRole("Receptionist");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save staff record");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await clientApiFetch(getToken, `/api/role-assignments?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Could not remove staff record");
      return;
    }
    await load();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="card grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="staff-email">
            Email (Clerk sign-in)
          </label>
          <input
            id="staff-email"
            className="input-field"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@clinic.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="staff-name">
            Display name
          </label>
          <input
            id="staff-name"
            className="input-field"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Front Desk"
          />
        </div>
        <div>
          <label className="label" htmlFor="staff-role">
            Role
          </label>
          <select
            id="staff-role"
            className="input-field"
            value={role}
            onChange={(e) => setRole(e.target.value as Exclude<UserRole, "Patient">)}
          >
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        {role === "Doctor" ? (
          <div>
            <label className="label" htmlFor="staff-dept">
              Department
            </label>
            <select
              id="staff-dept"
              className="input-field"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-end">
            <p className="text-sm text-[var(--cr-text-muted)]">
              Patient sign-ups not listed here automatically get Patient access.
            </p>
          </div>
        )}
        <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary gap-2" disabled={saving}>
            <UserPlus className="h-4 w-4" />
            {saving ? "Saving…" : "Add staff access"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-500">Email</th>
              <th className="px-4 py-3 font-medium text-slate-500">Name</th>
              <th className="px-4 py-3 font-medium text-slate-500">Role</th>
              <th className="px-4 py-3 font-medium text-slate-500">Department</th>
              <th className="px-4 py-3 font-medium text-slate-500" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-slate-500">
                  No staff records yet. Add emails above before those users sign in.
                </td>
              </tr>
            ) : (
              list.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">{row.email}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.role}</td>
                  <td className="px-4 py-3 text-slate-600">{row.department ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="btn-secondary gap-1 px-3 py-1.5 text-xs"
                      onClick={() => handleDelete(row.id)}
                      aria-label={`Remove ${row.email}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
