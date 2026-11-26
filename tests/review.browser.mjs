import { expect } from "@playwright/test";

export async function verifyReviewUpdates(page) {
  const dxSearch = page.getByRole("combobox", { name: "Search and add diagnosis" });
  const procedureSearch = page.getByRole("combobox", { name: "Procedure code or description", exact: true });
  const consultation = page.getByRole("combobox", { name: /^Consultation type/ });
  await page.getByRole("tab", { name: "Initial consultation", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Alina Rivera" })).toBeVisible();
  await expect(consultation).toHaveText("Initial");
  await expect(page.locator(".diagnosis-row")).toHaveCount(1);
  await expect(page.locator(".diagnosis-row")).toContainText("Z71.1");
  await expect(page.locator(".procedure-line")).toContainText("Z71.1 · Primary");
  await dxSearch.fill("Z71.1");
  await expect(page.getByRole("option", { name: /Z71.1/ })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Review request", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Consultation type: Initial");
  await expect(page.getByRole("dialog")).toContainText("Z71.1 (Primary)");
  await page.getByRole("button", { name: "Back to edit", exact: true }).click();

  // The default also works on a blank draft, before the first procedure exists.
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await page.getByRole("combobox", { name: /^LOA type/ }).click();
  await page.getByRole("option", { name: "Outpatient consultation", exact: true }).click();
  await consultation.click();
  await page.getByRole("option", { name: "Initial", exact: true }).click();
  await page.getByRole("button", { name: "Find member", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Alina Rivera" })).toBeVisible();
  await expect(page.locator(".diagnosis-row")).toContainText("Z71.1");
  await page.getByRole("button", { name: "Add procedure line", exact: true }).click();
  await procedureSearch.click();
  await expect(page.getByRole("option")).toHaveCount(1);
  await page.getByRole("option", { name: /Initial consultation/ }).click();
  await expect(page.getByRole("checkbox", { name: /Z71.1/ })).toBeChecked();
  await expect(page.getByRole("textbox", { name: "Quantity for line 1" })).toHaveValue("1");
  await page.getByRole("button", { name: "Add procedure", exact: true }).click();
  await expect(page.locator(".procedure-line")).toContainText("Z71.1 · Primary");
  await page.getByRole("button", { name: "Remove diagnosis Z71.1", exact: true }).click();
  await expect(page.locator(".diagnosis-row")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add procedure line", exact: true })).toBeDisabled();
  await dxSearch.fill("Fever");
  await page.getByRole("option", { name: /R50.9/ }).click();
  await consultation.click();
  await page.getByRole("option", { name: "Follow up", exact: true }).click();
  await expect(page.locator(".diagnosis-row")).toContainText("R50.9");
  await expect(page.locator(".diagnosis-row")).not.toContainText("Z71.1");
  await page.getByRole("button", { name: "Edit line 1", exact: true }).click();
  await expect(page.getByRole("button", { name: "Reconfirm", exact: true })).toHaveCount(0);
  await procedureSearch.fill("consultation");
  await expect(page.getByRole("option")).toHaveCount(1);
  await page.getByRole("option", { name: /Follow-up consultation/ }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.locator(".procedure-line")).toContainText("Follow-up consultation");

  await page.getByRole("tab", { name: "Emergency LOA", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Alina Rivera" })).toBeVisible();
  await expect(page.locator(".procedure-line")).toHaveCount(3);
  await expect(page.locator(".request-summary .loa-total")).toContainText("Total LOA Amount");
  await expect(page.locator(".request-summary .loa-total")).toContainText("₱3,350.00");
  for (const line of await page.locator(".procedure-line").all()) await expect(line).toContainText("Emergency Room");
  await expect(page.getByRole("combobox", { name: /^Chief complaint/ })).toHaveText("Fever");
  await page.getByRole("combobox", { name: /^Availment \/ admission date/ }).click();
  await expect(page.getByRole("listbox")).not.toContainText("Today");
  await expect(page.getByRole("listbox")).not.toContainText("Tomorrow");
  await page.keyboard.press("Escape");
  await dxSearch.fill("Z71.1");
  await expect(page.getByRole("option", { name: /Z71.1/ })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Edit line 1", exact: true }).click();
  await expect(page.getByRole("combobox", { name: /^Room type/ })).toHaveText("Emergency Room");
  await expect(page.getByRole("combobox", { name: /^Room type/ })).toHaveAttribute("aria-disabled", "true");
  await page.locator(".procedure-dialog .deductions summary").click();
  await expect(page.getByRole("checkbox", { name: "PhilHealth", exact: true })).toBeChecked();
  await expect(page.getByRole("textbox", { name: "PhilHealth amount" })).toHaveValue("300.00");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Add procedure line", exact: true }).click();
  await procedureSearch.fill("Emergency");
  await expect(page.getByRole("option")).toHaveCount(0);
  await procedureSearch.fill("Complete blood count");
  await page.getByRole("option", { name: /Complete blood count/ }).click();
  await expect(page.getByRole("textbox", { name: "Quantity for line 4" })).toHaveValue("1");
  await page.getByRole("button", { name: "Add procedure", exact: true }).click();
  await page.getByRole("button", { name: "Review request", exact: true }).click();
  await expect(page.getByRole("dialog").locator(".loa-total")).toContainText("₱3,800.00");
  await expect(page.getByRole("dialog").locator(".deduction-total dd")).toHaveText("₱300.00");
  await expect(page.getByRole("dialog")).toContainText("Emergency department assessment");
  await expect(page.getByRole("dialog")).toContainText("Emergency observation");
  await expect(page.getByRole("dialog")).toContainText("Emergency supplies");
  await expect(page.getByRole("dialog")).toContainText("PhilHealth: ₱300.00");
  await page.getByRole("button", { name: "Back to edit", exact: true }).click();
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.getByRole("button", { name: "Edit line 3", exact: true }).click();
    await expect.poll(() => page.getByRole("dialog").evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    await expect(page.getByRole("button", { name: "Save changes", exact: true })).toBeInViewport();
    if (width === 375) await page.screenshot({ animations: "disabled", path: "test-results/mobile-emergency.png" });
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
  }

  await page.getByRole("tab", { name: "Dental & tooth selection", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Alina Rivera" })).toBeVisible();
  await page.getByRole("button", { name: "Add procedure line", exact: true }).click();
  await procedureSearch.fill("Periodontal treatment");
  await page.getByRole("option", { name: /Periodontal treatment/ }).click();
  await expect(page.getByRole("group", { name: "Dental quadrant", exact: true }).getByRole("button")).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Permanent teeth", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Temporary teeth", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  for (const code of ["K05.1", "K04.0", "K08.9"]) {
    await dxSearch.fill(code);
    await page.getByRole("option", { name: new RegExp(code.replace('.', '\\.')) }).click();
  }
  for (const [code, rank] of [["K02.9", "Primary"], ["K05.1", "Secondary"], ["K04.0", "Other"], ["K08.9", "Other"]]) {
    await expect(page.getByRole("combobox", { name: "Rank for " + code })).toHaveText(rank);
  }
  await page.getByRole("tab", { name: "Review notes", exact: true }).click();
  await page.locator(".review-checklist > summary").click();
  await expect(page.locator(".review-checklist tbody tr")).toHaveCount(26);
  await expect(page.locator(".review-checklist")).toContainText("Business decision pending");
}
