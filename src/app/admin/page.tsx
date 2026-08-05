import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import AppShell from "@/components/AppShell";
import AdminPanel from "@/components/admin/AdminPanel";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user.role, "EDIT_CONTENT")) {
    redirect("/dashboard");
  }

  return (
    <AppShell>
      <div style={{ height: "calc(100vh - 0px)" }}>
        <AdminPanel />
      </div>
    </AppShell>
  );
}