"use server";

import { db } from "@/lib/database";
import { revalidatePath } from "next/cache";

export async function addPropertyAction(data) {
  db.insert(data);
  revalidatePath('/admin');
  return { success: true };
}

export async function updatePropertyAction(id, data) {
  db.update(id, data);
  revalidatePath('/admin');
  return { success: true };
}

export async function deletePropertyAction(id) {
  db.delete(id);
  revalidatePath('/admin');
  return { success: true };
}

export async function addClientAction(data) {
  db.insertClient(data);
  revalidatePath('/admin');
  return { success: true };
}

export async function updateClientAction(id, data) {
  db.updateClient(id, data);
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteClientAction(id) {
  db.deleteClient(id);
  revalidatePath('/admin');
  return { success: true };
}

export async function updateSettingsAction(data) {
  db.updateSettings(data);
  revalidatePath('/admin');
  return { success: true };
}

export async function addAgentAction(data) {
  db.insertAgent(data);
  revalidatePath('/admin');
  return { success: true };
}

export async function updateAgentAction(id, data) {
  db.updateAgent(id, data);
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteAgentAction(id) {
  db.deleteAgent(id);
  revalidatePath('/admin');
  return { success: true };
}
