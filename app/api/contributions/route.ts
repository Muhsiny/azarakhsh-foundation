import { saveContribution, storeContributionFile } from "../../contribution-store";
import {
  consumeRateLimit,
  detectUploadType,
  isSameOriginMutation,
  safeOriginalFileName,
} from "../../security";

const allowedVerifiedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "video/mp4",
]);

const allowedContributionTypes = new Set([
  "memory",
  "oral-history",
  "document",
  "image",
  "audio",
  "video",
  "correction",
]);

const allowedNamingPreferences = new Set([
  "full-name",
  "first-name",
  "anonymous",
  "decide-later",
]);

function text(form: FormData, key: string, max = 2000) {
  return String(form.get(key) || "").trim().slice(0, max);
}

function rateLimited(retryAfter: number) {
  return Response.json(
    { error: "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  let uploadedKey = "";
  try {
    if (!isSameOriginMutation(request)) {
      return Response.json({ error: "درخواست نامعتبر است." }, { status: 403 });
    }

    const limit = await consumeRateLimit(
      request,
      "public-contribution",
      8,
      60 * 60,
    );
    if (!limit.allowed) return rateLimited(limit.retryAfter);

    const contentLength = Number(request.headers.get("Content-Length") || "0");
    if (contentLength > 11 * 1024 * 1024) {
      return Response.json(
        { error: "حجم درخواست بیش از حد مجاز است." },
        { status: 413 },
      );
    }

    const form = await request.formData();

    // Honeypot for automated form submissions. Legitimate users never see it.
    if (text(form, "website", 200)) {
      return Response.json({ ok: true, message: "درخواست ثبت شد." }, { status: 201 });
    }

    const fullName = text(form, "fullName", 160);
    const email = text(form, "email", 254).toLowerCase();
    const title = text(form, "title", 300);
    const narrative = text(form, "narrative", 40_000);
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

    const contributionTypeRaw = text(form, "contributionType", 40);
    const contributionType = allowedContributionTypes.has(contributionTypeRaw)
      ? contributionTypeRaw
      : "memory";
    const namingPreferenceRaw = text(form, "namingPreference", 40);
    const namingPreference = allowedNamingPreferences.has(namingPreferenceRaw)
      ? namingPreferenceRaw
      : "decide-later";

    const attachment = form.get("attachment");
    let attachmentName = "";
    let attachmentType = "";
    let attachmentSize = 0;
    if (attachment instanceof File && attachment.size > 0) {
      if (attachment.size > 10 * 1024 * 1024) {
        return Response.json({ error: "حجم ضمیمه باید کمتر از ۱۰ مگابایت باشد." }, { status: 413 });
      }

      const verified = await detectUploadType(attachment);
      if (!verified || !allowedVerifiedTypes.has(verified.mime)) {
        return Response.json(
          { error: "نوع واقعی فایل مجاز نیست یا با قالب مورد انتظار سازگار نیست." },
          { status: 400 },
        );
      }

      uploadedKey = await storeContributionFile(attachment, verified);
      attachmentName = safeOriginalFileName(attachment.name);
      attachmentType = verified.mime;
      attachmentSize = attachment.size;
    }

    await saveContribution({
      full_name: fullName,
      email,
      phone: text(form, "phone", 80),
      relation_to_story: text(form, "relationToStory", 500),
      contribution_type: contributionType,
      title,
      narrative,
      event_date: text(form, "eventDate", 120),
      event_place: text(form, "eventPlace", 300),
      people_present: text(form, "peoplePresent", 1000),
      source_note: text(form, "sourceNote", 4000),
      naming_preference: namingPreference,
      publication_consent: consent ? 1 : 0,
      attachment_key: uploadedKey,
      attachment_name: attachmentName,
      attachment_type: attachmentType,
      attachment_size: attachmentSize,
    });

    return Response.json(
      { ok: true, message: "خاطره یا منبع شما ثبت شد و پس از بررسی مالک پاسخ داده می‌شود." },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("public contribution failed", error);
    return Response.json(
      { error: "ثبت روایت انجام نشد. لطفاً دوباره تلاش کنید." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
