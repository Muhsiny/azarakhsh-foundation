import { saveContribution, storeContributionFile } from "../../contribution-store";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "video/mp4",
]);

function text(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

export async function POST(request: Request) {
  let uploadedKey = "";
  try {
    const form = await request.formData();
    const fullName = text(form, "fullName");
    const email = text(form, "email").toLowerCase();
    const title = text(form, "title");
    const narrative = text(form, "narrative");
    const consent = form.get("consent") === "yes";

    if (fullName.length < 3 || !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ error: "نام کامل و ایمیل معتبر الزامی است." }, { status: 400 });
    }
    if (title.length < 5 || narrative.length < 80) {
      return Response.json({ error: "عنوان را روشن و روایت را با حداقل ۸۰ نویسه بنویسید." }, { status: 400 });
    }
    if (!consent) {
      return Response.json({ error: "تأیید رضایت برای بررسی و نگهداری منبع الزامی است." }, { status: 400 });
    }

    const attachment = form.get("attachment");
    let attachmentName = "";
    let attachmentType = "";
    let attachmentSize = 0;
    if (attachment instanceof File && attachment.size > 0) {
      if (!allowedTypes.has(attachment.type)) {
        return Response.json({ error: "فقط تصویر، PDF، فایل صوتی یا ویدیوی MP4 پذیرفته می‌شود." }, { status: 400 });
      }
      if (attachment.size > 10 * 1024 * 1024) {
        return Response.json({ error: "حجم ضمیمه باید کمتر از ۱۰ مگابایت باشد." }, { status: 400 });
      }
      uploadedKey = await storeContributionFile(attachment);
      attachmentName = attachment.name;
      attachmentType = attachment.type;
      attachmentSize = attachment.size;
    }

    await saveContribution({
      full_name: fullName,
      email,
      phone: text(form, "phone"),
      relation_to_story: text(form, "relationToStory"),
      contribution_type: text(form, "contributionType") || "memory",
      title,
      narrative,
      event_date: text(form, "eventDate"),
      event_place: text(form, "eventPlace"),
      people_present: text(form, "peoplePresent"),
      source_note: text(form, "sourceNote"),
      naming_preference: text(form, "namingPreference") || "full-name",
      publication_consent: consent ? 1 : 0,
      attachment_key: uploadedKey,
      attachment_name: attachmentName,
      attachment_type: attachmentType,
      attachment_size: attachmentSize,
    });

    return Response.json({ ok: true, message: "خاطره یا منبع شما ثبت شد و پس از بررسی مالک پاسخ داده می‌شود." }, { status: 201 });
  } catch (error) {
    console.error("public contribution failed", error);
    return Response.json({ error: error instanceof Error ? error.message : "ثبت روایت انجام نشد." }, { status: 500 });
  }
}
