"use server";

import { db } from "@/lib/database";
import { revalidatePath } from "next/cache";

export async function addPropertyAction(data) {
  try { await db.insert(data); revalidatePath('/admin'); return { success: true }; } catch(err) { return { success: false, error: err.message }; }
}

export async function updatePropertyAction(id, data) {
  try { await db.update(id, data); revalidatePath('/admin'); return { success: true }; } catch(err) { return { success: false, error: err.message }; }
}

export async function deletePropertyAction(id) {
  try { await db.delete(id); revalidatePath('/admin'); return { success: true }; } catch(err) { return { success: false, error: err.message }; }
}

export async function addClientAction(data) {
  try { await db.insertClient(data); revalidatePath('/admin'); return { success: true }; } catch(err) { return { success: false, error: err.message }; }
}

export async function updateClientAction(id, data) {
  try { await db.updateClient(id, data); revalidatePath('/admin'); return { success: true }; } catch(err) { return { success: false, error: err.message }; }
}

export async function deleteClientAction(id) {
  try { await db.deleteClient(id); revalidatePath('/admin'); return { success: true }; } catch(err) { return { success: false, error: err.message }; }
}

export async function updateSettingsAction(data) {
  try { await db.updateSettings(data); revalidatePath('/admin'); return { success: true }; } catch(err) { return { success: false, error: err.message }; }
}

export async function addAgentAction(data) {
  try { await db.insertAgent(data); revalidatePath('/admin'); return { success: true }; } catch(err) { return { success: false, error: err.message }; }
}

export async function updateAgentAction(id, data) {
  try { await db.updateAgent(id, data); revalidatePath('/admin'); return { success: true }; } catch(err) { return { success: false, error: err.message }; }
}

export async function deleteAgentAction(id) {
  try { await db.deleteAgent(id); revalidatePath('/admin'); return { success: true }; } catch(err) { return { success: false, error: err.message }; }
}
