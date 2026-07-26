"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="knowledge-page">
      <section className="knowledge-hero">
        <p className="section-kicker">خطای موقت</p>
        <h1>بخشی از سایت درست بارگذاری نشد.</h1>
        <p>تغییرات شما محفوظ است. صفحه را دوباره تلاش کنید یا به صفحه نخست برگردید.</p>
        <div className="hero-actions">
          <button className="button button-dark" onClick={reset} type="button">تلاش دوباره</button>
          <a className="button button-ghost" href="/">صفحه نخست</a>
        </div>
      </section>
    </main>
  );
}
