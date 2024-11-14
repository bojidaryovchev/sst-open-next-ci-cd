import { auth } from "@/auth";
import Image from "next/image";

const UserAvatar: React.FC = async () => {
  const session = await auth();

  if (!session?.user?.image) return null;

  return (
    <>
      <Image src={session.user.image} alt="User Avatar" width={42} height={42} />
    </>
  );
};

export default UserAvatar;
