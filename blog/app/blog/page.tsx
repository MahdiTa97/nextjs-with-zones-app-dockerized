import { cookies } from "next/headers";
import Link from "next/link";

export default async function Blog() {
  const cookieStore = await cookies()
  const token = cookieStore.get('authjs.session-token')
  return (
    <div>
      <h3>This is our blog</h3>
      <p>
        {token?.name}:{token?.value}
      </p>
      <ul>
        <li>
          <Link href="/blog/post/1">Post 1</Link>
        </li>
        <li>
          <Link href="/blog/post/2">Post 2</Link>
        </li>
      </ul>
      <Link href="/">Home</Link>
    </div>
  );
}
