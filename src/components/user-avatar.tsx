import Image from "next/image";
import { auth } from "../auth";

export default async function UserAvatar() {
  const session = await auth();

  if (!session?.user?.image) return null;

  return (
    <>
      <Image src={session.user.image} alt="User Avatar" width={42} height={42} />
    </>
  );
}
