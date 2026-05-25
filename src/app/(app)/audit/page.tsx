import { listAuditLogs } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { ROLE_BADGE_LIGHT } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export default function AuditPage() {
  const logs = listAuditLogs(80);

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Track who created or updated records across the clinic"
      />
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3">{log.user_email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${ROLE_BADGE_LIGHT[log.user_role as UserRole]}`}
                  >
                    {log.user_role}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{log.action}</td>
                <td className="px-4 py-3">
                  {log.entity_type}/{log.entity_id}
                </td>
                <td className="px-4 py-3 text-slate-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
