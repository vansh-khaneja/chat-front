export async function markUserAsPremium({ userId }: { userId: string }) {
  await fetch("https://lexscope-production.up.railway.app/make_user_premium", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_id: userId,
    }),
  });
}
