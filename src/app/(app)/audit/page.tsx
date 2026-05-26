import { serverApiJson } from "@/lib/api-server";
import { PageHeader } from "@/components/PageHeader";
import { ROLE_BADGE_LIGHT } from "@/lib/auth";
import type { AuditLogEntry, UserRole } from "@/lib/types";

export default async function AuditPage() {
  const logs = await serverApiJson<AuditLogEntry[]>("/api/audit");

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Track who created or updated records across the clinic"
      />
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-500">Time</th>
              <th className="px-4 py-3 font-medium text-slate-500">User</th>
              <th className="px-4 py-3 font-medium text-slate-500">Action</th>
              <th className="px-4 py-3 font-medium text-slate-500">Entity</th>
              <th className="px-4 py-3 font-medium text-slate-500">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-slate-500">
                  No audit entries yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{log.user_email}</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE_LIGHT[log.user_role as UserRole]}`}
                    >
                      {log.user_role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {log.entity_type}/{log.entity_id}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
