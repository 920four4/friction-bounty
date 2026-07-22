import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";
import { requireOrgOwner } from "@/lib/auth";
import { widgetBaseUrl } from "@/lib/url";
import { orgCanIssueRewards } from "@/lib/stripe";
import { CopyButton, CopyField } from "@/components/copy-button";
import { WidgetStudio } from "@/components/widget-studio";

export const dynamic = "force-dynamic";

async function saveSettings(formData: FormData) {
  "use server";
  const { orgId } = await requireOrgOwner();
  const db = getDb();

  const defaultBountyAmount = (formData.get("defaultBountyAmount") as string || "10.00").trim();
  const monthlyBudgetRaw = (formData.get("monthlyBudget") as string || "").trim();
  const monthlyBudget = monthlyBudgetRaw === "" ? null : monthlyBudgetRaw;
  let widgetPrimaryColor = (formData.get("widgetPrimaryColor") as string || "#FFE100").trim();
  if (!widgetPrimaryColor.startsWith("#")) widgetPrimaryColor = `#${widgetPrimaryColor}`;
  if (!/^#[0-9A-Fa-f]{6}$/.test(widgetPrimaryColor)) widgetPrimaryColor = "#FFE100";

  const widgetPositionRaw = (formData.get("widgetPosition") as string || "bottom-right").trim();
  const widgetPosition = widgetPositionRaw === "bottom-left" ? "bottom-left" : "bottom-right";
  const widgetWelcomeMessage = (formData.get("widgetWelcomeMessage") as string || "").trim();
  const styleRaw = (formData.get("widgetStyle") as string || "brutal").trim();
  const widgetStyle = ["brutal", "soft", "pill"].includes(styleRaw) ? styleRaw : "brutal";
  const widgetButtonLabel = (formData.get("widgetButtonLabel") as string || "").trim().slice(0, 40);
  let widgetOffsetBottom = parseInt(String(formData.get("widgetOffsetBottom") || "20"), 10);
  if (isNaN(widgetOffsetBottom)) widgetOffsetBottom = 20;
  widgetOffsetBottom = Math.min(120, Math.max(8, widgetOffsetBottom));

  const websiteUrl = (formData.get("websiteUrl") as string || "").trim();
  const orgName = (formData.get("orgName") as string || "").trim();
  const notificationEmail = (formData.get("notificationEmail") as string || "").trim();
  const notifyOnSubmission = formData.get("notifyOnSubmission") === "on";

  await db.update(organizations)
    .set({
      name: orgName || undefined,
      defaultBountyAmount,
      monthlyBudget,
      widgetPrimaryColor,
      widgetPosition,
      widgetWelcomeMessage: widgetWelcomeMessage || undefined,
      widgetStyle,
      widgetButtonLabel,
      widgetOffsetBottom,
      websiteUrl: websiteUrl || null,
      notificationEmail: notificationEmail || null,
      notifyOnSubmission,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId));

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/getting-started");
  redirect("/dashboard/settings?saved=1");
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { orgId } = await requireOrgOwner();
  const db = getDb();
  const org = await db.query.organizations.findFirst({ where: eq(organizations.id, orgId) });
  const { saved } = await searchParams;

  if (!org) redirect("/dashboard");

  const widgetSrc = `<script src="${widgetBaseUrl()}/widget.js" data-key="${org.apiKey}" async></script>`;
  const stripeReady = orgCanIssueRewards(org);

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div>
        <p className="font-mono text-xs uppercase text-gray-500 mb-1">Settings</p>
        <h1 className="text-3xl font-bold font-mono uppercase">Widget &amp; org</h1>
        <p className="text-sm text-gray-600 mt-1">
          Design what customers see on your site, then install once. Billing &amp; Stripe →{" "}
          <Link href="/dashboard/account" className="underline">Account</Link>.
        </p>
      </div>

      {saved && (
        <div className="brutal-box-sm bg-green-100 px-4 py-2 font-mono text-sm">
          Saved — your live widget will pick this up on the next page load (no reinstall needed).
        </div>
      )}

      <form action={saveSettings} className="space-y-6">
        {/* Widget studio — primary experience */}
        <section className="brutal-box p-5 md:p-6 bg-[#faf9f5]">
          <WidgetStudio
            initial={{
              primaryColor: org.widgetPrimaryColor || "#FFE100",
              position: (org.widgetPosition === "bottom-left" ? "bottom-left" : "bottom-right"),
              welcomeMessage: org.widgetWelcomeMessage,
              bountyAmount: org.defaultBountyAmount?.toString() || "10.00",
              style: (["brutal", "soft", "pill"].includes(org.widgetStyle || "")
                ? org.widgetStyle
                : "brutal") as "brutal" | "soft" | "pill",
              buttonLabel: org.widgetButtonLabel || "",
              offsetBottom: org.widgetOffsetBottom ?? 20,
              orgName: org.websiteUrl || org.name,
            }}
          />
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t-2 border-black pt-4">
            <button type="submit" className="brutal-btn-black">
              Save widget look →
            </button>
            <p className="font-mono text-xs text-gray-500">
              Changes apply to every site using your snippet.
            </p>
          </div>
        </section>

        {/* Install */}
        <section className="brutal-box p-6 space-y-3">
          <h2 className="font-mono font-bold uppercase">Install on your site</h2>
          <p className="text-sm text-gray-600">
            Paste once before <code className="bg-gray-100 px-1">&lt;/body&gt;</code>. Appearance comes from this
            page — you do not edit the script when you change color or style.
          </p>
          <CopyField value={widgetSrc} />
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-mono">
            <span>API key:</span>
            <span className="bg-gray-100 px-2 py-1 break-all">{org.apiKey}</span>
            <CopyButton value={org.apiKey} label="Copy key" />
          </div>
        </section>

        {/* Stripe */}
        <section className="brutal-box p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-mono font-bold uppercase">Reward payouts</h2>
              <p className="text-sm text-gray-600 mt-1">
                {stripeReady
                  ? "Stripe is connected. Rewards issue on your account."
                  : "Connect Stripe to issue credits & promo codes — no API keys to paste."}
              </p>
            </div>
            <Link href="/dashboard/account" className="brutal-btn-black text-sm">
              {stripeReady ? "Manage in Account →" : "Connect Stripe →"}
            </Link>
          </div>
        </section>

        <section className="brutal-box p-6">
          <h2 className="font-mono font-bold uppercase mb-4">Organization</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Name" name="orgName" defaultValue={org.name} required />
            <Field label="Website URL" name="websiteUrl" defaultValue={org.websiteUrl ?? ""} placeholder="https://yourstore.com" />
          </div>
        </section>

        <section className="brutal-box p-6">
          <h2 className="font-mono font-bold uppercase mb-4">Monthly budget</h2>
          <p className="text-sm text-gray-600 mb-3">
            Default bounty amount is set in the widget studio above (what visitors see). Cap total spend here.
          </p>
          <div className="max-w-sm">
            <label className="brutal-label">Monthly budget (USD)</label>
            <input
              type="number"
              name="monthlyBudget"
              step="0.01"
              min="0"
              defaultValue={org.monthlyBudget ?? ""}
              placeholder="No limit"
              className="brutal-input"
            />
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Hard cap per calendar month. Leave blank for unlimited.
            </p>
          </div>
        </section>

        <section className="brutal-box p-6">
          <h2 className="font-mono font-bold uppercase mb-4">Notifications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Notification email"
              name="notificationEmail"
              type="email"
              defaultValue={org.notificationEmail ?? ""}
              placeholder="bugs@yourstore.com"
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

        <button type="submit" className="brutal-btn-black">Save all settings</button>
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
