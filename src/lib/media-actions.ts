'use server';

import { createClient } from './supabase-server';
import { requireRole } from './auth';
import { writeAudit } from './audit';
import { check, runAndReturn } from './action-flow';
import { FormError, text, uuid } from './form-data';
import { objectName, putObject, readImageUpload, removeObjects } from './media-upload';

// The media library is editor-level, matching the media table's RLS in 0008 and
// the library/ storage policy in 0015. Each action re-checks the role itself: a
// Server Action is a public endpoint, so the page's check does not protect it.

const PAGE = '/admin/media';

/** Back to the folder tab the form was on; only known folders, never a free-form path. */
function returnTo(fd: FormData) {
  return text(fd, 'folder', 20) === 'listings' ? `${PAGE}?folder=listings` : PAGE;
}

export async function uploadMedia(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn(PAGE, async () => {
    const supabase = await createClient();
    const image = await readImageUpload(fd);
    const alt = text(fd, 'alt', 300);
    // Year folders keep any one Storage listing short; the name is generated so
    // nothing from the uploaded file name reaches the path.
    const path = `library/${new Date().getUTCFullYear()}/${objectName(image)}`;

    await putObject(supabase, path, image);
    const { data: after, error } = await supabase
      .from('media')
      .insert({
        path,
        alt,
        width: image.width,
        height: image.height,
        size_bytes: image.size,
        mime_type: image.mime,
        folder: 'library',
        uploaded_by: user.id,
      })
      .select('*')
      .single();
    if (error) {
      // Without a row nothing can find the file again, so do not leave it behind.
      await removeObjects(supabase, [path]);
      throw error;
    }
    await writeAudit(user.id, 'create', 'media', after.id, null, after);
    return alt ? 'Image uploaded.' : 'Image uploaded. Add alt text so it is accessible.';
  });
}

export async function updateMediaAlt(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn(returnTo(fd), async () => {
    const supabase = await createClient();
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');
    const before = check(await supabase.from('media').select('*').eq('id', id).maybeSingle());
    if (!before) throw new FormError('Image not found.');
    const after = check(
      await supabase
        .from('media')
        .update({ alt: text(fd, 'alt', 300) })
        .eq('id', id)
        .select('*')
        .maybeSingle(),
    );
    await writeAudit(user.id, 'update', 'media', id, before, after);
    return 'Alt text saved.';
  });
}

export async function deleteMedia(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn(returnTo(fd), async () => {
    const supabase = await createClient();
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');
    const before = check(await supabase.from('media').select('*').eq('id', id).maybeSingle());
    if (!before) throw new FormError('Image not found.');

    // listing_images.media_id is "on delete cascade", so deleting the row would
    // silently strip the photo from every listing using it. Refuse instead. The
    // other references (location heroes, blog covers) are "set null", which only
    // falls back to the default look, so those are allowed.
    const { count } = await supabase
      .from('listing_images')
      .select('id', { count: 'exact', head: true })
      .eq('media_id', id);
    if (count) {
      throw new FormError(
        `This image is used by ${count} listing image(s). Remove it from the listing first.`,
      );
    }

    check(await supabase.from('media').delete().eq('id', id));
    const removed = await removeObjects(supabase, [before.path]);
    await writeAudit(user.id, 'delete', 'media', id, before, null);
    return removed ? 'Image deleted.' : 'Image deleted, but its file could not be removed.';
  });
}
