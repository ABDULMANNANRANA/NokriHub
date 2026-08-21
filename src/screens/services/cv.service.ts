import { supabase } from './supabase';
import type { CVData, CV } from '../types/cv';
import { Buffer } from 'buffer';

export async function createCV(userId: string, templateId: 'classic' | 'modern', data: CVData) {
  const { data: row, error } = await supabase
    .from('cvs')
    .insert({ user_id: userId, template_id: templateId, data })
    .select()
    .single();
  if (error) throw error;
  return row as CV;
}

export async function updateCV(cvId: string, data: Partial<Pick<CV, 'data' | 'pdf_url' | 'template_id'>>) {
  const { data: row, error } = await supabase
    .from('cvs')
    .update(data)
    .eq('id', cvId)
    .select()
    .single();
  if (error) throw error;
  return row as CV;
}

export async function listUserCVs(userId: string) {
  const { data, error } = await supabase
    .from('cvs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as CV[];
}

export async function deleteCV(cvId: string) {
  const { error } = await supabase.from('cvs').delete().eq('id', cvId);
  if (error) throw error;
}

/**
 * Uploads a local PDF file (from react-native-html-to-pdf output) to the
 * `cv-pdfs` storage bucket and returns its public URL.
 */
export async function uploadCVPdf(userId: string, cvId: string, localFilePath: string) {
  const fileName = `${userId}/${cvId}.pdf`;

  // react-native-html-to-pdf gives us a file:// path — read it as base64
  // and convert to a Blob-compatible payload for Supabase storage.
  const RNFS = require('react-native-fs');
  const base64 = await RNFS.readFile(localFilePath, 'base64');
  const fileBuffer = Buffer.from(base64, 'base64');

  const { error: uploadError } = await supabase.storage
    .from('cv-pdfs')
    .upload(fileName, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('cv-pdfs').getPublicUrl(fileName);
  return data.publicUrl;
}