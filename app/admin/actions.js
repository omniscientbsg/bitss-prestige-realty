"use server";

import { db } from "@/lib/database";
import { revalidatePath } from "next/cache";

export async function addPropertyAction(data) {
  await db.insert(data);
  revalidatePath('/admin');
  return { success: true };
}

export async function updatePropertyAction(id, data) {
  await db.update(id, data);
  revalidatePath('/admin');
  return { success: true };
}

export async function deletePropertyAction(id) {
  await db.delete(id);
  revalidatePath('/admin');
  return { success: true };
}

export async function addClientAction(data) {
  await db.insertClient(data);
  revalidatePath('/admin');
  return { success: true };
}

export async function updateClientAction(id, data) {
  await db.updateClient(id, data);
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteClientAction(id) {
  await db.deleteClient(id);
  revalidatePath('/admin');
  return { success: true };
}

export async function updateSettingsAction(data) {
  await db.updateSettings(data);
  revalidatePath('/admin');
  return { success: true };
}

export async function addAgentAction(data) {
  await db.insertAgent(data);
  revalidatePath('/admin');
  return { success: true };
}

export async function updateAgentAction(id, data) {
  await db.updateAgent(id, data);
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteAgentAction(id) {
  await db.deleteAgent(id);
  revalidatePath('/admin');
  return { success: true };
}
