import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";
import { requireOrgOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function saveSettings(formData: FormData) {
  "use server";
  const { orgId } = await requireOrgOwner();
  const db = getDb();

  const defaultBountyAmount = (formData.get("defaultBountyAmount") as string || "10.00").trim();
  const widgetPrimaryColor = (formData.get("widgetPrimaryColor") as string || "#FFE100").trim();
  const widgetPosition = (formData.get("widgetPosition") as string || "bottom-right").trim();
  const widgetWelcomeMessage = (formData.get("widgetWelcomeMessage") as string || "").trim();
  const stripeSecretKey = (formData.get("stripeSecretKey") as string || "").trim();
  const websiteUrl = (formData.get("websiteUrl") as string || "").trim();
  const orgName = (formData.get("orgName") as string || "").trim();
  const notificationEmail = (formData.get("notificationEmail") as string || "").trim();
  const notifyOnSubmission = formData.get("notifyOnSubmission") === "on";

  await db.update(organizations)
    .set({
      name: orgName || undefined,
      defaultBountyAmount,
      widgetPrimaryColor,
      widgetPosition,
      widgetWelcomeMessage: widgetWelcomeMessage || undefined,
      websiteUrl: websiteUrl || null,
      notificationEmail: notificationEmail || null,
      notifyOnSubmission,
      ...(stripeSecretKey ? { stripeSecretKey } : {}),
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId));

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?saved=1");
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { orgId } = await requireOrgOwner();
  const db = getDb();
  const org = await db.query.organizations.findFirst({ where: eq(organizations.id, orgId) });
  const { saved } = await searchParams;

  if (!org) redirect("/dashboard");

  const widgetSrc = `<script src="https://friction-bounty.vercel.app/widget.js" data-key="${org.apiKey}" async></script>`;
  const shopifySrc = `{% comment %} Add to theme.liquid before </body> {% endcomment %}\n${widgetSrc}`;

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono uppercase">Settings</h1>
      </div>

      {saved && (
        <div className="brutal-box-sm bg-green-100 px-4 py-2 font-mono text-sm">Settings saved.</div>
      )}

      {/* Install snippet */}
      <section className="brutal-box p-6">
        <h2 className="font-mono font-bold uppercase mb-4">Install the widget</h2>
        <p className="text-gray-700 mb-4 text-sm">
          Add this <strong>once</strong> to your site, just before <code className="bg-gray-100 px-1">&lt;/body&gt;</code>. The widget auto-loads its config from your account.
        </p>
        <pre className="brutal-box-sm p-4 font-mono text-xs bg-gray-900 text-green-400 overflow-x-auto whitespace-pre-wrap break-all mb-3">{widgetSrc}</pre>

        <details className="mt-4">
          <summary className="font-mono text-sm uppercase cursor-pointer">Shopify install</summary>
          <p className="text-gray-700 text-sm mt-2 mb-2">
            In your Shopify admin: <em>Online Store → Themes → ⋯ → Edit code → layout/theme.liquid</em>. Paste this above <code className="bg-gray-100 px-1">&lt;/body&gt;</code>:
          </p>
          <pre className="brutal-box-sm p-4 font-mono text-xs bg-gray-900 text-green-400 overflow-x-auto whitespace-pre-wrap break-all">{shopifySrc}</pre>
        </details>

        <div className="mt-4 text-xs text-gray-500 font-mono">
          Your API key: <span className="bg-gray-100 px-2 py-1">{org.apiKey}</span>
        </div>
      </section>

      <form action={saveSettings} className="space-y-6">
        {/* Org */}
        <section className="brutal-box p-6">
          <h2 className="font-mono font-bold uppercase mb-4">Organization</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Name" name="orgName" defaultValue={org.name} required />
            <Field label="Website URL" name="websiteUrl" defaultValue={org.websiteUrl ?? ""} placeholder="https://yourstore.com" />
          </div>
        </section>

        {/* Bounty */}
        <section className="brutal-box p-6">
          <h2 className="font-mono font-bold uppercase mb-4">Bounty</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Default amount (USD)" name="defaultBountyAmount" type="number" step="0.01" defaultValue={org.defaultBountyAmount.toString()} />
          </div>
        </section>

        {/* Notifications */}
        <section className="brutal-box p-6">
          <h2 className="font-mono font-bold uppercase mb-4">Notifications</h2>
          <p className="text-gray-700 text-sm mb-4">
            We email you whenever a new report lands. Reporters automatically get a receipt and a reply when you respond.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Notification email"
              name="notificationEmail"
              type="email"
              defaultValue={org.notificationEmail ?? ""}
              placeholder="bugs@yourstore.com (defaults to your account email)"
            />
            <div className="flex items-end">
              <label className="flex items-center gap-2 font-mono text-sm">
                <input
                  type="checkbox"
                  name="notifyOnSubmission"
                  defaultChecked={org.notifyOnSubmission}
                  className="w-4 h-4 border-2 border-black"
                />
                Email me for every new submission
              </label>
            </div>
          </div>
        </section>

        {/* Stripe */}
        <section className="brutal-box p-6">
          <h2 className="font-mono font-bold uppercase mb-4">Stripe (rewards)</h2>
          <p className="text-gray-700 text-sm mb-4">
            Rewards are issued on <strong>your</strong> Stripe account as customer credit. Paste a restricted key with permission to read/write Customers and Coupons.
          </p>
          <Field
            label={org.stripeSecretKey ? "Replace Stripe Secret Key" : "Stripe Secret Key"}
            name="stripeSecretKey"
            type="password"
            placeholder={org.stripeSecretKey ? "•••••••• (leave blank to keep current)" : "rk_live_..."}
          />
        </section>

        {/* Widget look */}
        <section className="brutal-box p-6">
          <h2 className="font-mono font-bold uppercase mb-4">Widget appearance</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Primary color" name="widgetPrimaryColor" defaultValue={org.widgetPrimaryColor} placeholder="#FFE100" />
            <div>
              <label className="brutal-label">Position</label>
              <select name="widgetPosition" defaultValue={org.widgetPosition} className="brutal-input">
                <option value="bottom-right">Bottom right</option>
                <option value="bottom-left">Bottom left</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="brutal-label">Welcome message</label>
              <textarea name="widgetWelcomeMessage" defaultValue={org.widgetWelcomeMessage} rows={2} className="brutal-input" />
            </div>
          </div>
        </section>

        <button type="submit" className="brutal-btn-black">Save settings</button>
      </form>
    </main>
  );
}

function Field({ label, name, type = "text", defaultValue, placeholder, required, step }: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <div>
      <label className="brutal-label">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        step={step}
        className="brutal-input"
      />
    </div>
  );
}
